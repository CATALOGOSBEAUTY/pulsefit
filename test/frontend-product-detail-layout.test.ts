import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(
  new URL("../frontend/src/components/catalog/ProductDetail.tsx", import.meta.url),
  "utf8",
);

test("renders a mobile-only title block before the image container", () => {
  assert.match(
    source,
    /<div className="flex flex-col gap-5">\s*<ProductDetailTitleBlock[^>]*className="lg:hidden"/s,
  );
});

test("keeps a desktop-only title block inside the information column", () => {
  assert.match(
    source,
    /<section className="flex flex-col gap-6">\s*<ProductDetailTitleBlock[^>]*className="hidden lg:block"/s,
  );
});
