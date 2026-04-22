import { Router } from 'express';
import { handleError, ok } from '../../lib/http.js';
import { loadPublicCatalogSnapshot } from './service.js';

export const catalogRouter = Router();

catalogRouter.get('/bootstrap', async (_req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    const snapshot = await loadPublicCatalogSnapshot();
    return ok(res, snapshot);
  } catch (error) {
    return handleError(res, error);
  }
});
