# Masculino Pricing, Images, and Activation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar a categoria masculina do PulseFit com precificacao aleatoria controlada, imagens vinculadas no Supabase e ativacao segura no catalogo publico.

**Architecture:** A execucao usa o workspace masculino ja preparado como fonte operacional para imagens e checklist, atualiza os produtos masculinos direto no Supabase com uma precificacao deterministica por slug dentro de subfaixas coerentes por tipo e reaproveita os scripts existentes de apply-images e activate-batch. O backend continua sendo a fonte do catalogo publico, entao a validacao final passa pelo estado no banco e pelo bootstrap do catalogo.

**Tech Stack:** TypeScript, tsx, Supabase, scripts de catalogo do backend PulseFit

---

### Task 1: Atualizar os precos do lote masculino no Supabase

**Files:**
- Create: `backend/src/scripts/setCatalogBatchPricing.ts`
- Modify: `backend/package.json`
- Modify: `backend/catalog-workspace/masculino/activation-checklist.csv`

- [ ] Criar um script CLI para atualizar produtos por audiencia usando faixas de preco controladas por subcategoria/tipo.
- [ ] Fazer a geracao ser reproduzivel por `slug` para evitar que uma nova execucao troque os precos arbitrariamente.
- [ ] Atualizar o checklist masculino com os precos efetivamente aplicados.
- [ ] Rodar o script em `--dry-run` para conferir a distribuicao.
- [ ] Rodar o script com `--apply` para gravar no Supabase.

### Task 2: Vincular as imagens masculinas e mover o lote para ready

**Files:**
- Use: `backend/catalog-workspace/masculino/image-manifest.json`
- Use: `backend/src/scripts/applyCatalogImages.ts`

- [ ] Executar `catalog:apply-images` apontando para o manifesto masculino em `--dry-run`.
- [ ] Executar `catalog:apply-images` com `--apply`.
- [ ] Confirmar no banco que os produtos masculinos ficaram com imagem vinculada e `catalog_status = ready`.

### Task 3: Ativar o lote masculino

**Files:**
- Use: `backend/src/scripts/activateCatalogBatch.ts`

- [ ] Executar `catalog:activate` para `masculino` em `--dry-run`.
- [ ] Executar `catalog:activate` com `--apply`.
- [ ] Confirmar no banco que os produtos masculinos elegiveis ficaram `is_active = true` e `catalog_status = live`.

### Task 4: Validar o resultado no catalogo publico

**Files:**
- Use: `backend/src/modules/catalog/service.ts`
- Use: `frontend/src/services/catalogService.ts`

- [ ] Consultar o bootstrap do catalogo e verificar que os produtos masculinos aparecem com preco e imagem.
- [ ] Verificar a contagem de produtos masculinos publicados.
- [ ] Revisar `git status` para deixar claro quais artefatos locais ficaram pendentes de commit.
