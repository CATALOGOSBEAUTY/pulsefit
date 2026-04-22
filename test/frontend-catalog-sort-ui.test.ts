import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(
  new URL('../frontend/src/components/catalog/Catalog.tsx', import.meta.url),
  'utf8',
);

test('renders the catalog sort control with the requested options', () => {
  assert.match(source, /Ordenar por/);
  assert.match(source, /Mais Relevante/);
  assert.match(source, /Menor Preço/);
  assert.match(source, /Maior Preço/);
});
