import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface StoreState {
  activeTab: 'inicio' | 'catalogo' | 'contato';
  setActiveTab: (tab: 'inicio' | 'catalogo' | 'contato') => void;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useStore = create<StoreState>((set) => ({
  activeTab: 'inicio',
  setActiveTab: (tab) => set({ activeTab: tab }),
  activeCategory: null,
  setActiveCategory: (category) => set({ activeCategory: category }),
  cart: [],
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.product.id === product.id);
    if (existing) {
      return { cart: state.cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) };
    }
    return { cart: [...state.cart, { product, quantity: 1 }] };
  }),
  removeFromCart: (productId) => set((state) => ({ cart: state.cart.filter(item => item.product.id !== productId) })),
  updateQuantity: (productId, quantity) => set((state) => ({
    cart: state.cart.map(item => item.product.id === productId ? { ...item, quantity } : item)
  })),
  clearCart: () => set({ cart: [] })
}));
