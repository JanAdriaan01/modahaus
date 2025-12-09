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
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  loadCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  moveToWishlist: (itemId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      summary: null,
      isLoading: false,
      isInitialized: false,

      loadCart: async () => {
        try {
          set({ isLoading: true });
          const response = await cartService.getCart();
          
          set({
            items: response.items,
            summary: response.summary,
            isLoading: false,
            isInitialized: true,
          });
        } catch (error) {
          set({
            items: [],
            summary: null,
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      addToCart: async (productId: number, quantity: number = 1) => {
        try {
          set({ isLoading: true });
          const response = await cartService.addToCart(productId, quantity);
          
          // Refresh cart to get updated data
          await get().refreshCart();
          
          toast.success('Item added to cart');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Failed to add item to cart');
          throw error;
        }
      },

      updateQuantity: async (itemId: number, quantity: number) => {
        try {
          set({ isLoading: true });
          await cartService.updateCartItem(itemId, quantity);
          
          // Refresh cart to get updated data
          await get().refreshCart();
          
          toast.success('Cart updated');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Failed to update cart');
          throw error;
        }
      },

      removeFromCart: async (itemId: number) => {
        try {
          set({ isLoading: true });
          await cartService.removeFromCart(itemId);
          
          // Update local state immediately for better UX
          const currentItems = get().items.filter(item => item.id !== itemId);
          const currentSummary = get().summary;
          
          if (currentSummary) {
            const removedItem = get().items.find(item => item.id === itemId);
            if (removedItem) {
              const newSubtotal = currentSummary.subtotal - removedItem.totalPrice;
              const newItemCount = currentSummary.itemCount - 1;
              const newShippingAmount = newSubtotal >= 100 ? 0 : 9.99;
              const newTaxAmount = newSubtotal * 0.08;
              const newTotalAmount = newSubtotal + newShippingAmount + newTaxAmount;
              
              set({
                items: currentItems,
                summary: {
                  ...currentSummary,
                  subtotal: parseFloat(newSubtotal.toFixed(2)),
                  itemCount: newItemCount,
                  shippingAmount: parseFloat(newShippingAmount.toFixed(2)),
                  taxAmount: parseFloat(newTaxAmount.toFixed(2)),
                  totalAmount: parseFloat(newTotalAmount.toFixed(2)),
                  eligibleForFreeShipping: newSubtotal >= 100,
                },
                isLoading: false,
              });
            } else {
              set({
                items: currentItems,
                summary: currentSummary,
                isLoading: false,
              });
            }
          } else {
            set({
              items: currentItems,
              isLoading: false,
            });
          }
          
          toast.success('Item removed from cart');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Failed to remove item from cart');
          throw error;
        }
      },

      clearCart: async () => {
        try {
          set({ isLoading: true });
          await cartService.clearCart();
          
          set({
            items: [],
            summary: {
              subtotal: 0,
              shippingAmount: 0,
              taxAmount: 0,
              totalAmount: 0,
              itemCount: 0,
              freeShippingThreshold: 100,
              eligibleForFreeShipping: true,
            },
            isLoading: false,
          });
          
          toast.success('Cart cleared');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Failed to clear cart');
          throw error;
        }
      },

      moveToWishlist: async (itemId: number) => {
        try {
          set({ isLoading: true });
          await cartService.moveToWishlist(itemId);
          
          // Remove from cart and refresh
          const currentItems = get().items.filter(item => item.id !== itemId);
          set({ items: currentItems });
          
          await get().refreshCart();
          
          toast.success('Item moved to wishlist');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Failed to move item to wishlist');
          throw error;
        }
      },

      refreshCart: async () => {
        try {
          const response = await cartService.getCart();
          set({
            items: response.items,
            summary: response.summary,
          });
        } catch (error) {
          console.error('Failed to refresh cart:', error);
        }
      },
    }),
    {
      name: 'modahaus-cart',
    }
  )
);