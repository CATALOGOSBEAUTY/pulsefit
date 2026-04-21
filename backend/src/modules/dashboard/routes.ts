import { Router } from 'express';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { handleError, ok } from '../../lib/http.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', requireAuth, async (_req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const [
      products,
      activeProducts,
      categories,
      featuredProducts,
      promoProducts,
      recentProducts,
      orders,
    ] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('categories').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_featured', true),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_promo', true),
      supabase.from('products').select('id,title,price,product_images(url,sort_order)').order('created_at', { ascending: false }).limit(4),
      supabase.from('orders').select('id,total_amount,status,created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
    ]);

    const failed = [products, activeProducts, categories, featuredProducts, promoProducts, recentProducts, orders].find((result) => result.error);
    if (failed?.error) throw failed.error;

    return ok(res, {
      totalProducts: products.count ?? 0,
      activeProducts: activeProducts.count ?? 0,
      inactiveProducts: Math.max((products.count ?? 0) - (activeProducts.count ?? 0), 0),
      categories: categories.count ?? 0,
      featuredProducts: featuredProducts.count ?? 0,
      promoProducts: promoProducts.count ?? 0,
      orders: orders.count ?? 0,
      recentProducts: recentProducts.data ?? [],
      recentOrders: orders.data ?? [],
    });
  } catch (error) {
    return handleError(res, error);
  }
});

