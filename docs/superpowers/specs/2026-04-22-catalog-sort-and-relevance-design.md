# Catalog Sort And Relevance Design

**Goal**

Add a sort control to the public catalog with `Mais Relevante`, `Menor Preço`, and `Maior Preço`, and make `Mais Relevante` use actual purchase history instead of a static frontend-only sort.

**Scope**

- Public catalog page only
- Visible sort control in the catalog header
- Backend catalog bootstrap enriched with relevance metadata

**Design**

- Add a select control in the catalog header aligned to the right on desktop and stacked on mobile.
- Keep `Mais Relevante` as the default sort.
- Compute relevance in the backend catalog bootstrap using order history from `orders` and `order_items`.
- Primary signal: units sold.
- Secondary signal: number of distinct orders containing the product.
- Fallback signal for products with no sales: featured flag, new flag, and creation recency.

**Why this approach**

- The user explicitly asked for a relevance rule based on what has been bought.
- Putting the score in the backend keeps the business rule centralized and reusable.
- The frontend remains responsible only for exposing the selected sort and ordering the already-loaded list.

**Risk Controls**

- Ignore cancelled orders in relevance scoring.
- Keep deterministic fallback ordering for products with the same score.
- Preserve existing category, search, pagination, and responsive layout behavior.
