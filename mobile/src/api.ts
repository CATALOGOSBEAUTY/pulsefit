import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3101').replace(/\/$/, '');
const TOKEN_KEY = 'sistemalize:admin-token';

type RequestOptions = RequestInit & {
  auth?: boolean;
};

// Token de sessão admin é armazenado de forma criptografada pelo SO (Keychain/Keystore)
async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth) {
    const token = await getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error || 'Falha na comunicacao com a API.');
  }

  return data as T;
}

export interface MobileStoreResponse {
  store: {
    id: string;
    name: string;
    slug: string;
    whatsapp: string;
    primaryColor: string;
    banner: string;
    logo: string;
    plan: 'basic' | 'medium' | 'master';
    planUsage: {
      products: number;
      ordersThisMonth: number;
      stockItems: number;
    };
  };
  products: Array<{
    id: string;
    storeId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    stockQuantity: number;
    isActive: boolean;
    isFeatured?: boolean;
    variants: Array<{
      id: string;
      label: string;
      stockQuantity: number;
      price?: number;
    }>;
  }>;
}

export interface AdminOrderResponse {
  id: string;
  order_code?: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  status: 'new' | 'confirmed' | 'paid' | 'sent' | 'cancelled';
  created_at: string;
  order_items?: Array<{
    product_name: string;
    quantity: number;
    variant_label?: string | null;
    unit_price: number;
  }>;
}

export async function getMobileStore(slug: string) {
  return apiRequest<MobileStoreResponse>(`/api/mobile/store/${encodeURIComponent(slug)}`);
}

export async function requestAdminGate(accessCode: string) {
  const response = await apiRequest<{ gateToken: string }>('/api/auth/gate', {
    method: 'POST',
    body: JSON.stringify({ accessCode }),
  });
  return response.gateToken;
}

export async function loginAdmin(email: string, password: string, gateToken: string) {
  const response = await apiRequest<{ token: string; user: { email: string } }>('/api/auth/login', {
    method: 'POST',
    headers: {
      'X-Admin-Gate-Token': gateToken,
    },
    body: JSON.stringify({ email, password }),
  });
  await setToken(response.token);
  return response.user;
}

export async function listAdminOrders() {
  return apiRequest<AdminOrderResponse[]>('/api/orders', { auth: true });
}

export async function updateAdminOrderStatus(orderId: string, status: string) {
  return apiRequest<AdminOrderResponse>(`/api/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ status }),
  });
}

export async function createMobileOrder(payload: {
  customer: {
    fullName: string;
    phone: string;
    address: string;
    paymentMethod: 'pix' | 'cash';
    note?: string;
  };
  items: Array<{ productId: string; variantId?: string | null; quantity: number }>;
}) {
  return apiRequest<{ whatsappUrl: string; order: { id: string; order_code?: string; total_amount: number } }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer: {
        fullName: payload.customer.fullName,
        phone: payload.customer.phone,
        fulfillmentType: 'delivery',
        deliveryToBeArranged: true,
        paymentMethod: payload.customer.paymentMethod,
        referencePoint: payload.customer.note || payload.customer.address || 'Entrega a combinar pelo WhatsApp',
      },
      items: payload.items,
    }),
  });
}
