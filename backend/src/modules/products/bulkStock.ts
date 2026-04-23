import { ApiError } from '../../lib/http.js';

export interface BulkStockPayload {
  productIds: string[];
  stockQuantity: number;
}

export function parseBulkStockPayload(body: any): BulkStockPayload {
  const rawProductIds: unknown[] = Array.isArray(body?.productIds) ? body.productIds : [];
  const productIds = rawProductIds.length > 0
    ? Array.from(
      new Set<string>(
        rawProductIds
          .filter((value): value is string => typeof value === 'string')
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
      )
    )
    : [];

  if (productIds.length === 0) {
    throw new ApiError(400, 'Selecione ao menos um produto.');
  }

  const stockQuantity = typeof body?.stockQuantity === 'number' ? body.stockQuantity : Number(body?.stockQuantity);
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new ApiError(400, 'Quantidade de estoque invalida.');
  }

  return {
    productIds,
    stockQuantity,
  };
}
