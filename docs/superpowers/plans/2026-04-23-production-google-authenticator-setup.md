# Production Google Authenticator Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Google Authenticator enrollment from a local private file into a production application flow backed by encrypted Supabase settings.

**Architecture:** Keep the existing single-admin gate/login model, but add a controlled TOTP setup lifecycle. The backend owns secret generation, encryption, pending setup storage, confirmation, and activation; the frontend only displays the one-time setup key/URI and submits the six-digit confirmation code.

**Tech Stack:** Express, Supabase `settings`, AES-GCM secret encryption, RFC 6238 TOTP helpers, React/Vite admin login UI.

---

### Task 1: Backend TOTP Setup Service

**Files:**
- Create: `backend/src/modules/auth/totpSetup.ts`
- Create: `backend/src/modules/auth/totpSetup.test.ts`
- Modify: `backend/package.json`

- [ ] **Step 1: Write failing tests**

Create tests proving:
- public status reports whether `admin_totp_secret_encrypted` exists.
- unauthenticated setup is blocked once an active secret exists.
- setup stores only encrypted pending secret plus hashed setup token.
- confirm validates setup token, expiry, and TOTP code before activating the encrypted secret.

- [ ] **Step 2: Run RED**

Run: `npm run test --workspace backend`
Expected: fail because `totpSetup.ts` does not exist.

- [ ] **Step 3: Implement service**

Create focused helpers around Supabase `settings`:
- `getAdminTotpSetupStatus`
- `startAdminTotpSetup`
- `confirmAdminTotpSetup`

- [ ] **Step 4: Run GREEN**

Run: `npm run test --workspace backend`
Expected: all backend tests pass.

### Task 2: Backend Routes

**Files:**
- Modify: `backend/src/modules/auth/routes.ts`

- [ ] **Step 1: Wire endpoints**

Add:
- `GET /api/auth/totp/status`
- `POST /api/auth/totp/setup/start`
- `POST /api/auth/totp/setup/confirm`

Allow setup start only when no active TOTP exists, unless the request already has a valid admin session.

- [ ] **Step 2: Verify**

Run: `npm run test --workspace backend`
Expected: all backend tests pass.

### Task 3: Frontend Setup UI

**Files:**
- Modify: `frontend/src/services/authService.ts`
- Modify: `frontend/src/modules/auth/views/LoginView.tsx`

- [ ] **Step 1: Add API client methods**

Expose status/start/confirm methods and typed setup response.

- [ ] **Step 2: Add production enrollment UI**

When no authenticator is configured, show:
- start setup button
- setup key for Google Authenticator
- otpauth URI link for mobile
- confirmation code input

When configured, keep current login flow.

- [ ] **Step 3: Verify**

Run:
- `npm run lint`
- `npm run build`

Expected: both commands exit 0.

### Task 4: Deploy and Production Verification

**Files:**
- No code files.

- [ ] **Step 1: Commit and push**

Commit only files touched by this feature.

- [ ] **Step 2: Deploy**

Trigger Render and Vercel deployment for the pushed commit.

- [ ] **Step 3: Verify production**

Check:
- backend health
- `/api/auth/totp/status`
- frontend bundle contains setup UI text
- existing configured production still requires Google Authenticator code
