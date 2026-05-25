# Product Detail Mobile Title Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the product title block above the product image on mobile without changing the desktop product detail layout.

**Architecture:** Keep `ProductDetail.tsx` as the single ownership point for the public product page and introduce one shared title block renderer with breakpoint-specific visibility classes. Use a narrow source-level regression test because the repo currently has no React DOM test harness for the frontend.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Node test runner via `tsx --test`

---

### Task 1: Lock the responsive requirement with a regression test

**Files:**
- Create: `test/frontend-product-detail-layout.test.ts`
- Test: `frontend/src/components/catalog/ProductDetail.tsx`

- [ ] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("../frontend/src/components/catalog/ProductDetail.tsx", import.meta.url), "utf8");

test("renders a mobile-only title block before the image container", () => {
  assert.match(source, /<div className="flex flex-col gap-5">\s*<ProductDetailTitleBlock[^>]*className="lg:hidden"/s);
});

test("keeps a desktop-only title block inside the information column", () => {
  assert.match(source, /<section className="flex flex-col gap-6">\s*<ProductDetailTitleBlock[^>]*className="hidden lg:block"/s);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test test/frontend-product-detail-layout.test.ts`
Expected: FAIL because `ProductDetail.tsx` still renders the title block only inside the right column.

- [ ] **Step 3: Write minimal implementation**

```tsx
function ProductDetailTitleBlock({ category, name, className = "" }: ProductDetailTitleBlockProps) {
  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase tracking-widest text-purple-700">{category}</p>
      <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-neutral-900">{name}</h1>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test test/frontend-product-detail-layout.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add test/frontend-product-detail-layout.test.ts frontend/src/components/catalog/ProductDetail.tsx
git commit -m "fix: move mobile product title above image"
```

### Task 2: Validate the storefront still builds cleanly

**Files:**
- Modify: `frontend/src/components/catalog/ProductDetail.tsx`
- Test: `test/frontend-product-detail-layout.test.ts`

- [ ] **Step 1: Run the focused frontend regression test**

Run: `npx tsx --test test/frontend-product-detail-layout.test.ts`
Expected: PASS

- [ ] **Step 2: Run frontend typecheck**

Run: `npm run lint --workspace frontend`
Expected: exit code 0

- [ ] **Step 3: Run frontend production build**

Run: `npm run build --workspace frontend`
Expected: exit code 0

- [ ] **Step 4: Review diff for scope control**

Run: `git diff -- frontend/src/components/catalog/ProductDetail.tsx test/frontend-product-detail-layout.test.ts`
Expected: only the mobile title ordering change and the regression test

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/catalog/ProductDetail.tsx test/frontend-product-detail-layout.test.ts
git commit -m "fix: keep product title above image on mobile"
```
