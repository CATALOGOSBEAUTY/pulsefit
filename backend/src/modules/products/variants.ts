export interface VariantOption {
  name: string;
  value: string;
}

export interface ProductVariantPayload {
  id?: string;
  label?: string;
  sku?: string;
  options: VariantOption[];
  price?: number | null;
  stockQuantity: number;
  isActive: boolean;
}

export function normalizeVariantOptions(options: unknown): VariantOption[] {
  if (!Array.isArray(options)) return [];

  return options
    .map((option: any) => ({
      name: String(option?.name ?? '').trim(),
      value: String(option?.value ?? '').trim(),
    }))
    .filter((option) => option.name.length > 0 && option.value.length > 0);
}

export function buildVariantLabel(options: VariantOption[]) {
  return options.map((option) => `${option.name}: ${option.value}`).join(' / ');
}

export function parseProductVariants(input: unknown): ProductVariantPayload[] {
  if (!Array.isArray(input)) return [];

  return input.map((variant: any) => {
    const options = normalizeVariantOptions(variant?.options);
    const label = String(variant?.label ?? '').trim() || buildVariantLabel(options);
    const rawPrice = variant?.price === '' || variant?.price === undefined ? null : variant?.price;
    const price = rawPrice === null ? null : Number(rawPrice);
    const stockQuantity = Math.max(0, Math.floor(Number(variant?.stockQuantity ?? variant?.stock_quantity ?? 0)));

    return {
      id: typeof variant?.id === 'string' ? variant.id : undefined,
      label,
      sku: typeof variant?.sku === 'string' ? variant.sku.trim() : '',
      options,
      price: Number.isFinite(price) ? price : null,
      stockQuantity,
      isActive: variant?.isActive ?? variant?.is_active ?? true,
    };
  }).filter((variant) => variant.label.length > 0 || variant.options.length > 0);
}
