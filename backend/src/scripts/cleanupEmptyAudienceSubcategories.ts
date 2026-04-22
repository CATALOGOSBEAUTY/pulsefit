import { createClient } from '@supabase/supabase-js';
import { env, assertSupabaseConfigured } from '../config/env.js';
import { hasFlag, parseAudience } from './catalogCli.js';

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

function getRootSlug(audience: Exclude<ReturnType<typeof parseAudience>, 'all'>) {
  if (audience === 'feminino') return 'feminina';
  if (audience === 'masculino') return 'masculina';
  return 'suplementos';
}

async function main() {
  const audience = parseAudience('masculino');
  if (audience === 'all') {
    throw new Error('Limpeza exige uma audiencia especifica.');
  }

  const apply = hasFlag('apply');
  assertSupabaseConfigured();

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: root, error: rootError } = await supabase
    .from('categories')
    .select('id,name,slug')
    .eq('slug', getRootSlug(audience))
    .is('parent_id', null)
    .single();

  if (rootError || !root) {
    throw new Error(`Categoria raiz ${audience} nao encontrada: ${rootError?.message ?? 'sem retorno'}`);
  }

  const { data: subcategories, error: categoriesError } = await supabase
    .from('categories')
    .select('id,name,slug')
    .eq('parent_id', root.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (categoriesError) throw categoriesError;

  const empty: CategoryRow[] = [];
  const blocked: string[] = [];

  for (const category of (subcategories ?? []) as CategoryRow[]) {
    const [childrenResult, productResult] = await Promise.all([
      supabase.from('categories').select('id', { count: 'exact', head: true }).eq('parent_id', category.id),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('subcategory_id', category.id),
    ]);

    const failed = [childrenResult, productResult].find((result) => result.error);
    if (failed?.error) throw failed.error;

    const childCount = childrenResult.count ?? 0;
    const productCount = productResult.count ?? 0;

    if (childCount === 0 && productCount === 0) {
      empty.push(category);
      continue;
    }

    blocked.push(`${category.slug} [filhas=${childCount}, produtos=${productCount}]`);
  }

  process.stdout.write(`Audiencia: ${audience}\n`);
  process.stdout.write(`Subcategorias ativas analisadas: ${subcategories?.length ?? 0}\n`);
  process.stdout.write(`Vazias para remover: ${empty.map((category) => category.slug).join(', ') || 'nenhuma'}\n`);
  process.stdout.write(`Mantidas: ${blocked.join(', ') || 'nenhuma'}\n`);

  if (!apply) {
    process.stdout.write('Dry run: nada foi removido. Use --apply para excluir as vazias.\n');
    return;
  }

  if (empty.length === 0) {
    process.stdout.write('Nenhuma subcategoria vazia para remover.\n');
    return;
  }

  const ids = empty.map((category) => category.id);
  const { error: deleteError } = await supabase.from('categories').delete().in('id', ids);
  if (deleteError) throw deleteError;

  process.stdout.write(`Subcategorias removidas: ${empty.map((category) => category.slug).join(', ')}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
