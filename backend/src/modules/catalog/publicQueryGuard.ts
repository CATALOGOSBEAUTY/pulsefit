import { ApiError } from '../../lib/http.js';

export function assertPublicCatalogQuery(query: Record<string, unknown>) {
  if (query.includeInactive === 'true' || query.includeInactive === true) {
    throw new ApiError(401, 'Consulta administrativa exige autenticacao.');
  }
}
