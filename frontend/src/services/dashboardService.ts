import { apiRequest } from './apiClient';

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  categories: number;
  featuredProducts: number;
  promoProducts: number;
  orders: number;
  recentProducts: Array<{
    id: string;
    title: string;
    price: number;
    product_images?: Array<{ url: string; sort_order: number }>;
  }>;
}

export async function getDashboardStats() {
  return apiRequest<DashboardStats>('/api/dashboard/stats', { auth: true });
}

