import { apiRequest } from './apiClient';
import { CartItem, CheckoutData } from '../types';

export async function createOrder(cart: CartItem[], customer: CheckoutData) {
  return apiRequest<{ whatsappUrl: string; order: { order_code?: string } }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer,
      items: cart.map((item) => ({
        productId: item.product.id,
        variantId: item.variant?.id ?? null,
        quantity: item.quantity,
      })),
    }),
  });
}
