import { ApiError } from '../../lib/http.js';

interface ProductVisibilityQuery {
  eq: (field: string, value: unknown) => ProductVisibilityQuery;
}

export function assertPublicCatalogQuery(query: Record<string, unknown>) {
  if (query.includeInactive === 'true' || query.includeInactive === true) {
    throw new ApiError(401, 'Consulta administrativa exige autenticacao.');
  }
}

export function applyPublicCatalogProductVisibility<T extends ProductVisibilityQuery>(query: T): T {
  return query
    .eq('is_active', true)
    .eq('catalog_status', 'live') as T;
}
