import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { env, assertSupabaseConfigured } from '../config/env.js';
import { getArg, hasFlag, parseAudience } from './catalogCli.js';

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  product_type: string | null;
  price: number;
  audience: string;
};

type PricingBand = {
  label: string;
  min: number;
  max: number;
};

type WorkspaceProduct = {
  slug: string;
  price: number;
  title?: string;
};

function getWorkspaceRoot() {
  return path.basename(process.cwd()) === 'backend' ? path.resolve(process.cwd(), '..') : process.cwd();
}

function toCents(value: number) {
  return Math.round(value * 100);
}

function fromCents(value: number) {
  return Number((value / 100).toFixed(2));
}

function hashSlug(slug: string) {
  let hash = 2166136261;
  for (let index = 0; index < slug.length; index += 1) {
    hash ^= slug.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function buildCandidatePrices(min: number, max: number) {
  const minCents = toCents(min);
  const maxCents = toCents(max);
  const values: number[] = [];

  for (let reais = Math.floor(min); reais <= Math.floor(max); reais += 1) {
    for (const cents of [90, 99]) {
      const price = reais * 100 + cents;
      if (price >= minCents && price <= maxCents) values.push(price);
    }
  }

  if (values.length === 0) {
    values.push(minCents);
  }

  return values;
}

function choosePrice(slug: string, band: PricingBand) {
  const candidates = buildCandidatePrices(band.min, band.max);
  return fromCents(candidates[hashSlug(slug) % candidates.length]!);
}

function matchesAny(text: string, values: string[]) {
  return values.some((value) => text.includes(value));
}

function getPricingBand(product: Pick<ProductRow, 'slug' | 'title' | 'product_type'>): PricingBand {
  const text = `${product.slug} ${product.title} ${product.product_type ?? ''}`.toLowerCase();

  if (matchesAny(text, ['tenis', 'calcado'])) {
    return { label: 'calcados', min: 219.9, max: 299.99 };
  }

  if (matchesAny(text, ['calca', 'jogger', 'compressao termica'])) {
    return { label: 'calcas', min: 119.9, max: 189.99 };
  }

  if (matchesAny(text, ['jaqueta', 'moletom', 'colete', 'casaco'])) {
    return { label: 'casacos', min: 149.9, max: 249.99 };
  }

  if (matchesAny(text, ['bermuda', 'short'])) {
    return { label: 'bermudas-shorts', min: 79.9, max: 139.99 };
  }

  if (matchesAny(text, ['camiseta', 'regata'])) {
    return { label: 'camisetas-regatas', min: 59.9, max: 99.99 };
  }

  if (matchesAny(text, ['mochila', 'bolsa'])) {
    return { label: 'bolsas-mochilas', min: 129.9, max: 219.99 };
  }

  if (matchesAny(text, ['cinto'])) {
    return { label: 'acessorio-pesado', min: 99.9, max: 169.99 };
  }

  if (matchesAny(text, ['galao'])) {
    return { label: 'hidratacao-grande', min: 89.9, max: 149.99 };
  }

  if (matchesAny(text, ['garrafa'])) {
    return { label: 'hidratacao', min: 59.9, max: 99.99 };
  }

  if (matchesAny(text, ['joelheira', 'luva'])) {
    return { label: 'acessorio-suporte', min: 69.9, max: 119.99 };
  }

  return { label: 'acessorios-gerais', min: 49.9, max: 89.99 };
}

async function syncWorkspaceProducts(workspaceRoot: string, audience: string, pricesBySlug: Map<string, number>) {
  const productsPath = path.resolve(workspaceRoot, 'backend', 'catalog-workspace', audience, 'products.json');
  const checklistPath = path.resolve(workspaceRoot, 'backend', 'catalog-workspace', audience, 'activation-checklist.csv');

  try {
    const raw = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(raw) as WorkspaceProduct[];
    for (const product of products) {
      const price = pricesBySlug.get(product.slug);
      if (price !== undefined) product.price = price;
    }
    await fs.writeFile(productsPath, `${JSON.stringify(products, null, 2)}\n`, 'utf8');
  } catch {
    // Workspace products are optional for this operation.
  }

  try {
    const raw = await fs.readFile(checklistPath, 'utf8');
    const lines = raw.replace(/^\uFEFF/, '').trimEnd().split(/\r?\n/);
    if (lines.length <= 1) return;

    const [header, ...rows] = lines;
    const rewritten = rows.map((row) => {
      const columns = row.split('","').map((value, index, array) => {
        if (index === 0) return value.replace(/^"/, '');
        if (index === array.length - 1) return value.replace(/"$/, '');
        return value;
      });

      const slug = columns[0];
      const price = pricesBySlug.get(slug);
      if (price !== undefined) columns[6] = price.toFixed(2);
      return `"${columns.join('","')}"`;
    });

    await fs.writeFile(checklistPath, `${header}\n${rewritten.join('\n')}\n`, 'utf8');
  } catch {
    // Checklist is optional for this operation.
  }
}

async function main() {
  const audience = parseAudience('masculino');
  if (audience === 'all') throw new Error('Precificacao em lote exige audiencia especifica.');

  const apply = hasFlag('apply');
  const workspaceRoot = getWorkspaceRoot();
  const min = Number(getArg('min', '49.90').replace(',', '.'));
  const max = Number(getArg('max', '299.99').replace(',', '.'));
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max < min) {
    throw new Error(`Faixa invalida: min=${min} max=${max}`);
  }

  assertSupabaseConfigured();
  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from('products')
    .select('id,slug,title,product_type,price,audience')
    .eq('audience', audience)
    .order('title', { ascending: true });

  if (error) throw error;
  const products = (data ?? []) as ProductRow[];
  if (products.length === 0) {
    throw new Error(`Nenhum produto encontrado para audiencia ${audience}.`);
  }

  const pricing = products.map((product) => {
    const baseBand = getPricingBand(product);
    const boundedBand = {
      ...baseBand,
      min: Math.max(baseBand.min, min),
      max: Math.min(baseBand.max, max),
    };
    if (boundedBand.max < boundedBand.min) {
      boundedBand.min = min;
      boundedBand.max = max;
    }
    const nextPrice = choosePrice(product.slug, boundedBand);
    return {
      ...product,
      band: boundedBand,
      nextPrice,
    };
  });

  const pricesBySlug = new Map(pricing.map((item) => [item.slug, item.nextPrice]));
  const minAssigned = Math.min(...pricing.map((item) => item.nextPrice));
  const maxAssigned = Math.max(...pricing.map((item) => item.nextPrice));
  const summary = [
    `Audiencia: ${audience}`,
    `Produtos encontrados: ${pricing.length}`,
    `Faixa configurada: R$ ${min.toFixed(2)} -> R$ ${max.toFixed(2)}`,
    `Faixa aplicada: R$ ${minAssigned.toFixed(2)} -> R$ ${maxAssigned.toFixed(2)}`,
    ...pricing.slice(0, 8).map((item) => `${item.slug} => R$ ${item.nextPrice.toFixed(2)} [${item.band.label}]`),
  ];
  process.stdout.write(`${summary.join('\n')}\n`);

  if (!apply) {
    process.stdout.write('Dry run: nenhum preco foi gravado. Use --apply para atualizar o Supabase.\n');
    return;
  }

  for (const item of pricing) {
    const { error: updateError } = await supabase
      .from('products')
      .update({ price: item.nextPrice, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    if (updateError) throw updateError;
  }

  await syncWorkspaceProducts(workspaceRoot, audience, pricesBySlug);
  process.stdout.write(`Precos atualizados com sucesso para ${pricing.length} produtos.\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
