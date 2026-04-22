import type { Product } from "../../types";

export type CatalogSortOption = "relevance" | "price-asc" | "price-desc";

export function sortCatalogProducts(products: Product[], sortOption: CatalogSortOption) {
  const sortedProducts = [...products];

  const compareByRelevance = (left: Product, right: Product) => {
    const scoreDiff = (right.relevanceScore ?? 0) - (left.relevanceScore ?? 0);
    if (scoreDiff !== 0) return scoreDiff;

    const featuredDiff = Number(Boolean(right.isFeatured)) - Number(Boolean(left.isFeatured));
    if (featuredDiff !== 0) return featuredDiff;

    const newDiff = Number(Boolean(right.isNew)) - Number(Boolean(left.isNew));
    if (newDiff !== 0) return newDiff;

    const createdAtDiff =
      new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime();
    if (createdAtDiff !== 0) return createdAtDiff;

    return left.name.localeCompare(right.name, "pt-BR");
  };

  if (sortOption === "price-asc") {
    return sortedProducts.sort((left, right) => {
      const priceDiff = left.price - right.price;
      return priceDiff !== 0 ? priceDiff : compareByRelevance(left, right);
    });
  }

  if (sortOption === "price-desc") {
    return sortedProducts.sort((left, right) => {
      const priceDiff = right.price - left.price;
      return priceDiff !== 0 ? priceDiff : compareByRelevance(left, right);
    });
  }

  return sortedProducts.sort(compareByRelevance);
}
