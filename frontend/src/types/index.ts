export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  categoryId?: string;
  subcategoryId?: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutData {
  fullName: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  region: string;
}
