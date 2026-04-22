# Catalog Sort And Relevance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public catalog sort control and drive `Mais Relevante` from real purchase history.

**Architecture:** Compute relevance metrics once in the backend catalog bootstrap from orders plus order_items, expose the score in the public response, and use a small frontend sorting utility to order the already-filtered products by the selected option. Keep the UI change local to `Catalog.tsx`.

**Tech Stack:** Express, Supabase, React, TypeScript, Tailwind CSS, Node test runner via `tsx --test`

---

### Task 1: Backend relevance scoring

**Files:**
- Create: `backend/src/modules/catalog/relevance.ts`
- Create: `backend/src/modules/catalog/relevance.test.ts`
- Modify: `backend/src/modules/catalog/service.ts`

- [ ] Write a failing backend relevance test
- [ ] Run it and confirm failure
- [ ] Implement deterministic relevance scoring from orders
- [ ] Re-run the backend relevance test
- [ ] Re-run backend test suite

### Task 2: Frontend sorting utility and UI

**Files:**
- Create: `frontend/src/components/catalog/catalogSort.ts`
- Create: `test/frontend-catalog-sort.test.ts`
- Create: `test/frontend-catalog-sort-ui.test.ts`
- Modify: `frontend/src/components/catalog/Catalog.tsx`
- Modify: `frontend/src/services/catalogService.ts`
- Modify: `frontend/src/types/index.ts`

- [ ] Write failing frontend tests for sort behavior and visible sort options
- [ ] Run them and confirm failure
- [ ] Implement sort utility and catalog select control
- [ ] Re-run focused frontend tests
- [ ] Re-run frontend lint and build

### Task 3: End-to-end verification

**Files:**
- Verify only

- [ ] Run focused backend tests
- [ ] Run focused frontend tests
- [ ] Run `npm run test --workspace backend`
- [ ] Run `npm run lint --workspace frontend`
- [ ] Run `npm run build --workspace frontend`
