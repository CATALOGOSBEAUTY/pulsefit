# Client Provisioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe repeatable way to configure a separate catalog instance for each client without turning the app into a shared multiempresa system.

**Architecture:** Client identity and commercial limits stay in the existing singleton `catalog_config` table. A local JSON template is validated by a focused provisioning module, then an admin-only script applies that template to the current Supabase project configured by environment variables. No `tenant_id` is introduced and no customer records are mixed in the same runtime.

**Tech Stack:** TypeScript, Node `tsx`, Express backend conventions, Supabase service-role client, Node test runner.

---

### Task 1: Provisioning Validator

**Files:**
- Create: `backend/src/modules/clientProvisioning/service.test.ts`
- Create: `backend/src/modules/clientProvisioning/service.ts`

- [ ] **Step 1: Write tests for valid and invalid client templates**

Cover normalized output, required fields, hex colors, URL format, checkout mode, plan code and non-negative integer limits.

- [ ] **Step 2: Run focused test and verify it fails**

Run: `npm test --workspace backend -- src/modules/clientProvisioning/service.test.ts`

Expected: fail because the module does not exist yet.

- [ ] **Step 3: Implement the validator and SQL payload mapper**

Export `parseClientConfig`, `mapClientConfigToCatalogRow` and `safeClientSummary`.

- [ ] **Step 4: Run focused test and verify it passes**

Run: `npm test --workspace backend -- src/modules/clientProvisioning/service.test.ts`

Expected: pass.

### Task 2: Apply Script

**Files:**
- Create: `backend/src/scripts/applyClientConfig.ts`
- Modify: `backend/package.json`
- Modify: `package.json`
- Create: `clients/templates/base-client.example.json`
- Create: `clients/clients/.gitkeep`

- [ ] **Step 1: Add a script that reads `--file=...` and defaults to dry run**

The script validates the JSON, prints a non-secret summary, and only writes to Supabase with `--apply`.

- [ ] **Step 2: Add npm scripts**

Add `client:apply` at root and backend workspace.

- [ ] **Step 3: Add an example template**

Use safe placeholder URLs and PulseFit-like defaults.

- [ ] **Step 4: Run dry run**

Run: `npm run client:apply -- --file clients/templates/base-client.example.json`

Expected: validated summary and dry-run message.

### Task 3: Full Verification

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Add the new test file to the backend test script**

Ensure `npm test --workspace backend` runs the provisioning tests.

- [ ] **Step 2: Run validation**

Run:
- `npm run lint`
- `npm test --workspace backend`
- `npm run build`
- `npm audit --omit=dev`

Expected: all pass.
