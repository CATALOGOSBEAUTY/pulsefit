# Catalog Dashboard Metrics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder dashboard catalog metrics area with robust, real Supabase-backed catalog, inventory, quality, and sales metrics.

**Architecture:** Add a pure backend aggregation module for catalog metrics and cover it with tests before wiring it into `/api/dashboard/stats`. The frontend receives a typed `catalogMetrics` object and renders compact dashboard cards, progress bars, rankings, and action alerts without changing the admin navigation.

**Tech Stack:** Express, Supabase service-role backend queries, Node test runner, React/Vite, Tailwind utility classes, lucide-react icons.

---

### Task 1: Backend Metrics Aggregator

**Files:**
- Create: `backend/src/modules/dashboard/catalogMetrics.ts`
- Create: `backend/src/modules/dashboard/catalogMetrics.test.ts`
- Modify: `backend/package.json`

- [ ] **Step 1: Write failing tests for aggregate catalog health**

Test products by audience, catalog status counts, image coverage, stock health, quality issues, category performance, and sales totals using in-memory rows.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test src/modules/dashboard/catalogMetrics.test.ts`
Expected: fail because `catalogMetrics.ts` does not exist.

- [ ] **Step 3: Implement `buildCatalogMetrics`**

Create a single exported function:
`buildCatalogMetrics({ products, categories, orders }, options?)`.

- [ ] **Step 4: Run GREEN**

Run: `npx tsx --test src/modules/dashboard/catalogMetrics.test.ts`
Expected: pass.

### Task 2: Dashboard API Wiring

**Files:**
- Modify: `backend/src/modules/dashboard/routes.ts`

- [ ] **Step 1: Fetch richer dashboard source data**

Query products with category, subcategory, images, and variants; query categories; query orders with order_items.

- [ ] **Step 2: Return `catalogMetrics`**

Include `catalogMetrics` in the existing `/api/dashboard/stats` response while preserving existing fields.

- [ ] **Step 3: Verify backend**

Run: `npm run test --workspace backend` and `npm run lint --workspace backend`.

### Task 3: Frontend Dashboard UI

**Files:**
- Modify: `frontend/src/services/dashboardService.ts`
- Modify: `frontend/src/modules/dashboard/views/DashboardView.tsx`

- [ ] **Step 1: Add TypeScript types**

Model `CatalogMetrics` so the UI consumes backend data safely.

- [ ] **Step 2: Replace placeholder**

Render catalog completion, image coverage, stock health, audience distribution, status funnel, top sellers, category performance, and critical alerts.

- [ ] **Step 3: Verify frontend**

Run: `npm run lint --workspace frontend` and `npm run build`.

### Task 4: Deploy and Production Verification

**Files:**
- No code files.

- [ ] **Step 1: Commit and push**

Commit only this metrics feature.

- [ ] **Step 2: Deploy**

Trigger Render and rely on Vercel Git deployment.

- [ ] **Step 3: Verify production**

Check backend health, authenticated stats shape if a valid session is available, frontend production status, and bundle text for the new metrics UI.
