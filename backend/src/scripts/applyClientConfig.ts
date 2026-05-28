import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { env, assertSupabaseConfigured } from '../config/env.js';
import { hasFlag, getArg } from './catalogCli.js';
import {
  mapClientConfigToCatalogRow,
  parseClientConfig,
  safeClientSummary,
} from '../modules/clientProvisioning/service.js';

function readJsonFile(filePath: string) {
  const cwdPath = path.resolve(process.cwd(), filePath);
  const absolutePath = fs.existsSync(cwdPath)
    ? cwdPath
    : path.resolve(process.cwd(), '..', filePath);
  const content = fs.readFileSync(absolutePath, 'utf8');
  return JSON.parse(content);
}

async function main() {
  const filePath = getArg('file');
  if (!filePath) {
    throw new Error('Informe o arquivo do cliente com --file=clients/templates/nome-do-cliente.json');
  }

  const apply = hasFlag('apply');
  const config = parseClientConfig(readJsonFile(filePath));
  const row = mapClientConfigToCatalogRow(config);

  process.stdout.write('Configuracao de cliente validada:\n');
  process.stdout.write(`${JSON.stringify(safeClientSummary(config), null, 2)}\n`);

  if (!apply) {
    process.stdout.write('Dry run: nenhuma configuracao foi gravada. Use --apply para atualizar o Supabase da instancia atual.\n');
    return;
  }

  assertSupabaseConfigured();
  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase
    .from('catalog_config')
    .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  if (error) throw error;
  process.stdout.write(`Configuracao aplicada para ${config.storeName} (${config.storeSlug}).\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
