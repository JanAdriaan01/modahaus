import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService } from '@/services/cartService';
import { toast } from 'react-toastify';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productSku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  quantity: number;
  totalPrice: number;
  primaryImage?: string;
  primaryImageAlt?: string;
  category?: {
    name: string;
    slug: string;
  };
  updatedAt: string;
}

export interface CartSummary {
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  itemCount: number;
  freeShippingThreshold: number;
  eligibleForFreeShipping: boolean;
}

interface CartState {
  items: CartItem[];
  summary: CartSummary | null;

  globalLoading: boolean;        // Used for full cart load
  itemLoading: number[];         // List of productIds currently loading
  isInitialized: boolean;

  isItemLoading: (productId: number) => boolean;

  loadCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearLocalCart: () => void;
  moveToWishlist: (itemId: number) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      summary: null,

      globalLoading: false,
      itemLoading: [],             // per-product loading states
      isInitialized: false,

      isItemLoading: (productId: number) => {
        return get().itemLoading.includes(productId);
      },

      // Load entire cart initially
      loadCart: async () => {
        try {
          set({ globalLoading: true });
          const response = await cartService.getCart();

          set({
            items: response.items,
            summary: response.summary,
            globalLoading: false,
            isInitialized: true,
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

      // Refresh full cart silently (no global loading)
      refreshCart: async () => {
        try {
          const response = await cartService.getCart();
          set({
            items: response.items,
            summary: response.summary,
          });
        } catch (err) {
          console.error('refreshCart failed:', err);
        }
      },

      // Add item to cart with per-product loading
      addToCart: async (productId: number, quantity: number = 1) => {
        set((state) => ({
          itemLoading: [...state.itemLoading, productId]
        }));

        try {
          await cartService.addToCart(productId, quantity);

          await get().refreshCart();
          toast.success('Added to cart');
        } catch (error: any) {
          toast.error(
            error?.response?.data?.error || 'Failed to add item to cart'
          );
          throw error;
        } finally {
          set((state) => ({
            itemLoading: state.itemLoading.filter((id) => id !== productId),
          }));
        }
      },

      // Update quantity with per-item loading (loading uses itemId, not productId)
      updateQuantity: async (itemId: number, quantity: number) => {
        set((state) => ({
          itemLoading: [...state.itemLoading, itemId]
        }));

        try {
          await cartService.updateCartItem(itemId, quantity);

          await get().refreshCart();
          toast.success('Cart updated');
        } catch (error: any) {
          toast.error(
            error?.response?.data?.error || 'Failed to update cart'
          );
          throw error;
        } finally {
          set((state) => ({
            itemLoading: state.itemLoading.filter((id) => id !== itemId)
          }));
        }
      },

      // Remove item with instant UI feedback
      removeFromCart: async (itemId: number) => {
        set((state) => ({
          itemLoading: [...state.itemLoading, itemId]
        }));

        try {
          await cartService.removeFromCart(itemId);

          // Immediate local update
          const newItems = get().items.filter((i) => i.id !== itemId);
          set({ items: newItems });

          await get().refreshCart();
          toast.success('Item removed');
        } catch (error: any) {
          toast.error(
            error?.response?.data?.error || 'Failed to remove item'
          );
          throw error;
        } finally {
          set((state) => ({
            itemLoading: state.itemLoading.filter((id) => id !== itemId)
          }));
        }
      },

      clearCart: async () => {
        set({ globalLoading: true });

        try {
          await cartService.clearCart();

          set({
            items: [],
            summary: {
              subtotal: 0,
              shippingAmount: 0,
              taxAmount: 0,
              totalAmount: 0,
              itemCount: 0,
              eligibleForFreeShipping: true,
              freeShippingThreshold: 100,
            },
          });

          toast.success('Cart cleared');
        } catch (error: any) {
          toast.error(
            error?.response?.data?.error || 'Failed to clear cart'
          );
          throw error;
        } finally {
          set({ globalLoading: false });
        }
      },

      clearLocalCart: () => {
        set({ items: [], summary: null, isInitialized: false });
      },

      moveToWishlist: async (itemId: number) => {
        set((state) => ({
          itemLoading: [...state.itemLoading, itemId]
        }));

        try {
          await cartService.moveToWishlist(itemId);

          // Update local state
          const items = get().items.filter((i) => i.id !== itemId);
          set({ items });

          await get().refreshCart();
          toast.success('Moved to wishlist');
        } catch (error: any) {
          toast.error(
            error?.response?.data?.error || 'Failed to move item'
          );
          throw error;
        } finally {
          set((state) => ({
            itemLoading: state.itemLoading.filter((id) => id !== itemId)
          }));
        }
      },
    }),
    { name: 'modahaus-cart' }
  )
);