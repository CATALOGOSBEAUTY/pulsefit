export type Mode = 'light' | 'dark';

export type Screen =
  | 'entry'
  | 'catalog'
  | 'product'
  | 'favorites'
  | 'cart'
  | 'checkout'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-settings';

export type PlanCode = 'basic' | 'medium' | 'master';

export type OrderStatus =
  | 'Aguardando WhatsApp'
  | 'Confirmado'
  | 'Em separacao'
  | 'Saiu para entrega'
  | 'Entregue'
  | 'Cancelado';

export type Store = {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
  primaryColor: string;
  banner: string;
  logo: string;
  plan: PlanCode;
  planUsage: {
    products: number;
    ordersThisMonth: number;
    stockItems: number;
  };
};

export type ProductVariant = {
  id: string;
  label: string;
  stockQuantity: number;
  price?: number;
};

export type Product = {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  category: string;
  imageUrl: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured?: boolean;
  variants: ProductVariant[];
};

export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type CheckoutProfile = {
  name: string;
  phone: string;
  address: string;
  paymentMethod: 'Presencial' | 'Pix a combinar';
  note: string;
};

export type Order = {
  id: string;
  storeId: string;
  customerName: string;
  phone: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: Array<{ name: string; quantity: number; variant?: string; unitPrice: number }>;
};

export type Plan = {
  label: string;
  price: string;
  products: number | null;
  orders: number | null;
  stock: number | null;
  customization: boolean;
};

export type Colors = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  danger: string;
};
