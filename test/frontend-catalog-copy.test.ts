import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(
  new URL("../frontend/src/components/catalog/Catalog.tsx", import.meta.url),
  "utf8",
);

test("renders Moda Fitness as the public catalog headline", () => {
  assert.match(
    source,
    /<h2 className="text-2xl lg:text-4xl font-bold uppercase tracking-tight text-neutral-900 mb-1 lg:mb-2">\s*Moda{" "}\s*<span[\s\S]*?>\s*Fitness\s*<\/span>/,
  );
});

test("renders the new catalog supporting message below the headline", () => {
  assert.match(
    source,
    /<p className="text-xs lg:text-sm text-neutral-500">Mais do que roupa, é um estilo de vida!<\/p>/,
  );
});
