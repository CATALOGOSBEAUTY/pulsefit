# Categoria Masculina Images Design

## Objetivo

Replicar para a categoria `masculino` o mesmo pipeline operacional que ja foi usado para `feminino`: exportacao do lote, prompts por produto, assets isolados em fundo branco para catalogo, manifesto aprovado e checklist de ativacao, sem ativar produtos ainda.

## Escopo

- Publico alvo: produtos do catalogo mestre com `audience = masculino`
- Saidas esperadas:
  - `backend/catalog-workspace/masculino/products.json`
  - `backend/catalog-workspace/masculino/image-prompts.md`
  - `backend/catalog-workspace/masculino/activation-checklist.csv`
  - `backend/catalog-workspace/masculino/image-manifest.json`
  - assets em `frontend/public/catalog/masculino/`
- Fora de escopo:
  - ativacao publica dos produtos
  - mudanca de preco
  - alteracao de layout

## Abordagem

1. Reusar o catalogo mestre como fonte de verdade para identificar todos os produtos masculinos e seus `imagePrompt`.
2. Repetir o formato do workspace feminino, inclusive checklist e manifesto.
3. Gerar uma imagem isolada por produto, no mesmo padrao visual do lote feminino:
   - fundo totalmente branco
   - produto centralizado
   - visual comercial de ecommerce
   - sem texto, sem watermark, sem elementos extras
4. Salvar os assets em `frontend/public/catalog/masculino/` e produzir o manifesto final aprovado apontando para esses arquivos.
5. Manter o lote em `draft/inactive`; o passo de `apply-images` fica pronto, mas nao e executado agora.

## Riscos e Controles

- Consistencia visual: o lote masculino precisa seguir o mesmo padrao do feminino para nao misturar estilos no catalogo.
- Integridade do lote: a contagem de imagens precisa bater com a contagem de produtos masculinos no catalogo mestre.
- Escopo: nenhuma ativacao no banco deve acontecer nesta etapa.

## Resultado esperado

Ao final, a categoria masculina tera o mesmo preparo operacional da feminina para carga de imagens e futura ativacao, com todos os produtos masculinos prontos para vinculacao via manifesto.
