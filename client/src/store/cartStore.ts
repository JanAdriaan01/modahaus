import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService } from '@/services/cartService';
import { toast } from 'react-toastify';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface CartSummary {
  subtotal: number;
  totalAmount: number;
  itemCount: number;
}

interface CartState {
  items: CartItem[];
  summary: CartSummary | null;
  globalLoading: boolean;
  isInitialized: boolean;

  loadCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  clearLocalCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      summary: null,
      globalLoading: false,
      isInitialized: false,

      loadCart: async () => {
        try {
          set({ globalLoading: true });
          const res = await cartService.getCart();
          set({
            items: res.items ?? [],
            summary: res.summary ?? null,
            isInitialized: true,
            globalLoading: false,
          });
        } catch {
          set({
            items: [],
            summary: null,
            globalLoading: false,
            isInitialized: false,
          });
        }
      },

      refreshCart: async () => {
        try {
          const res = await cartService.getCart();
          set({
            items: res.items ?? [],
            summary: res.summary ?? null,
          });
        } catch {}
      },

      addToCart: async (productId, quantity = 1) => {
        try {
          await cartService.addToCart(productId, quantity);
          await cartService.getCart().then((res) =>
            set({ items: res.items ?? [], summary: res.summary ?? null })
          );
          toast.success('Added to cart');
        } catch {
          toast.error('Failed to add item');
        }
      },

      clearLocalCart: () => {
        set({ items: [], summary: null, isInitialized: false });
      },
    }),
    { name: 'modahaus-cart' }
  )
);