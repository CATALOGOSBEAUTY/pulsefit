export type ProductRelevanceSource = {
  id: string;
  is_featured?: boolean | null;
  is_new?: boolean | null;
  created_at?: string | null;
};

export type OrderItemRelevanceSource = {
  product_id?: string | null;
  quantity?: number | null;
};

export type OrderRelevanceSource = {
  status?: string | null;
  created_at?: string | null;
  order_items?: OrderItemRelevanceSource[] | null;
};

export type ProductRelevanceMetrics = {
  score: number;
  unitsSold: number;
  orderCount: number;
};

const FEATURED_BOOST = 25;
const NEW_BOOST = 15;
const MAX_FRESHNESS_BOOST = 30;
const FRESHNESS_WINDOW_DAYS = 30;

function getFreshnessBoost(createdAt: string | null | undefined, now: Date) {
  if (!createdAt) return 0;

  const createdAtMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdAtMs)) return 0;

  const ageInDays = Math.floor((now.getTime() - createdAtMs) / 86_400_000);
  if (ageInDays < 0) return MAX_FRESHNESS_BOOST;
  if (ageInDays >= FRESHNESS_WINDOW_DAYS) return 0;

  return MAX_FRESHNESS_BOOST - ageInDays;
}

export function buildProductRelevanceMap(
  products: ProductRelevanceSource[],
  orders: OrderRelevanceSource[],
  now = new Date(),
) {
  const relevance = Object.fromEntries(
    products.map((product) => [
      product.id,
      {
        score: 0,
        unitsSold: 0,
        orderCount: 0,
      } satisfies ProductRelevanceMetrics,
    ]),
  ) as Record<string, ProductRelevanceMetrics>;

  for (const order of orders) {
    if (order.status === 'cancelled') continue;

    const countedInOrder = new Set<string>();

    for (const item of order.order_items ?? []) {
      const productId = item.product_id ?? null;
      if (!productId || !relevance[productId]) continue;

      const quantity = Math.max(0, Number(item.quantity ?? 0));
      relevance[productId].unitsSold += quantity;

      if (!countedInOrder.has(productId)) {
        relevance[productId].orderCount += 1;
        countedInOrder.add(productId);
      }
    }
  }

  for (const product of products) {
    const metrics = relevance[product.id];
    const featuredBoost = product.is_featured ? FEATURED_BOOST : 0;
    const newBoost = product.is_new ? NEW_BOOST : 0;
    const freshnessBoost = getFreshnessBoost(product.created_at, now);

    metrics.score =
      metrics.unitsSold * 1000 +
      metrics.orderCount * 100 +
      featuredBoost +
      newBoost +
      freshnessBoost;
  }

  return relevance;
}
