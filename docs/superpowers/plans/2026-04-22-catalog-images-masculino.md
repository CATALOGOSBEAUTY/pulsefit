# Categoria Masculina Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replicar o lote de imagens da categoria masculina no mesmo formato operacional da categoria feminina.

**Architecture:** O catalogo mestre continua sendo a fonte de verdade dos produtos masculinos e dos prompts. O workspace masculino e os assets publicos sao gerados no mesmo padrao do lote feminino, sem ativar produtos nem alterar layout.

**Tech Stack:** TypeScript, Node/tsx, workspace local do PulseFit, assets raster do catalogo

---

### Task 1: Exportar o workspace masculino

**Files:**
- Create: `backend/catalog-workspace/masculino/products.json`
- Create: `backend/catalog-workspace/masculino/image-prompts.md`
- Create: `backend/catalog-workspace/masculino/activation-checklist.csv`
- Create: `backend/catalog-workspace/masculino/image-manifest.template.json`

- [ ] Gerar o batch masculino a partir do catalogo mestre usando os utilitarios ja existentes.
- [ ] Verificar que a contagem do batch masculino bate com os produtos `audience=masculino`.

### Task 2: Gerar assets masculinos

**Files:**
- Create: `frontend/public/catalog/masculino/*.png`

- [ ] Gerar uma imagem isolada por produto masculino seguindo o mesmo padrao visual do lote feminino.
- [ ] Garantir naming por `slug` para compatibilidade direta com o manifest.

### Task 3: Fechar o manifest final

**Files:**
- Create: `backend/catalog-workspace/masculino/image-manifest.json`
- Modify: `backend/catalog-workspace/masculino/activation-checklist.csv`

- [ ] Preencher o manifest final com `approved=true`, `imagePath` local e nota padrao do lote.
- [ ] Atualizar o checklist para refletir que o lote tem imagem preparada, mantendo produtos em `draft/inactive`.
- [ ] Validar contagem final entre imagens, manifest e checklist.
