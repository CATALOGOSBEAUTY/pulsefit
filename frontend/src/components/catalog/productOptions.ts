import type { Product, ProductVariant } from "../../types";

export interface VisibleVariantOption {
  id: string;
  title: string;
  optionSummary: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  variant: ProductVariant;
}

export function getActiveVariants(product: Product | null | undefined) {
  if (!product?.variantsEnabled) return [];
  return (product.variants ?? []).filter((variant) => variant.isActive);
}

export function getTotalAvailableStock(product: Product | null | undefined) {
  const activeVariants = getActiveVariants(product);
  if (activeVariants.length > 0) {
    return activeVariants.reduce((total, variant) => total + Math.max(0, variant.stockQuantity || 0), 0);
  }

  return Math.max(0, product?.stockQuantity ?? 0);
}

export function getInitialSelectedVariantId(product: Product | null | undefined) {
  const activeVariants = getActiveVariants(product);
  const firstAvailable = activeVariants.find((variant) => variant.stockQuantity > 0);
  return firstAvailable?.id ?? activeVariants[0]?.id ?? "";
}

function getOptionSummary(variant: ProductVariant) {
  const summary = variant.options
    .filter((option) => option.name || option.value)
    .map((option) => [option.name, option.value].filter(Boolean).join(": "))
    .join(" / ");

  return summary || variant.label;
}

export function getVisibleVariantOptions(product: Product | null | undefined): VisibleVariantOption[] {
  if (!product) return [];

  return getActiveVariants(product).map((variant) => {
    const optionSummary = getOptionSummary(variant);

    return {
      id: variant.id,
      title: variant.label || optionSummary,
      optionSummary,
      price: variant.price ?? product.price,
      stockQuantity: Math.max(0, variant.stockQuantity || 0),
      isAvailable: variant.stockQuantity > 0,
      variant,
    };
  });
}
