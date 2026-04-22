import { createClient } from '@supabase/supabase-js';
import { env, assertSupabaseConfigured } from '../config/env.js';
import { hasFlag } from './catalogCli.js';

const duplicateNames = ['Conjuntos', 'Leggings', 'Shorts', 'Tops'];

async function main() {
  const apply = hasFlag('apply');
  assertSupabaseConfigured();
  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: root, error: rootError } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Feminina')
    .single();
  if (rootError || !root) throw new Error(`Categoria Feminina nao encontrada: ${rootError?.message ?? 'sem retorno'}`);

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id,name')
    .eq('parent_id', root.id)
    .in('name', duplicateNames);
  if (categoriesError) throw categoriesError;

  const blocked: string[] = [];
  const empty: Array<{ id: string; name: string }> = [];
  for (const category of categories ?? []) {
    const { count, error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('subcategory_id', category.id);
    if (error) throw error;
    if ((count ?? 0) > 0) blocked.push(`${category.name} (${count})`);
    else empty.push(category);
  }

  process.stdout.write(`Subcategorias vazias candidatas: ${empty.map((item) => item.name).join(', ') || 'nenhuma'}\n`);
  process.stdout.write(`Bloqueadas por conter produtos: ${blocked.join(', ') || 'nenhuma'}\n`);

  if (!apply) {
    process.stdout.write('Dry run: nada foi alterado. Use --apply para ocultar as vazias.\n');
    return;
  }

  if (empty.length === 0) {
    process.stdout.write('Nenhuma subcategoria vazia para ocultar.\n');
    return;
  }

  const { error } = await supabase
    .from('categories')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .in('id', empty.map((item) => item.id));
  if (error) throw error;

  process.stdout.write(`Subcategorias ocultadas: ${empty.map((item) => item.name).join(', ')}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
