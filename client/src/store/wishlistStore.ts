import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistService } from '@/services/apiService';
import { toast } from 'react-toastify';

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  primaryImage?: string;
  primaryImageAlt?: string;
  category?: {
    name: string;
    slug: string;
  };
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;

  // Actions
  loadWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  moveToCart: (productId: number, quantity?: number) => Promise<void>;
  checkWishlist: (productId: number) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      loadWishlist: async () => {
        try {
          set({ isLoading: true });
          const response = await wishlistService.getWishlist();
          set({ items: response.wishlist, isLoading: false });
        } catch (error) {
          set({ items: [], isLoading: false });
        }
      },

      addToWishlist: async (productId: number) => {
        try {
          set({ isLoading: true });
          await wishlistService.addToWishlist(productId);
          
          // Add to local state immediately for better UX
          const currentItems = get().items;
          const newItem = {
            id: Date.now(), // Temporary ID
            productId,
            productName: '',
            productSlug: '',
            price: 0,
            stockQuantity: 0,
            rating: 0,
            reviewCount: 0,
            addedAt: new Date().toISOString(),
          };
          
          set({
            items: [newItem, ...currentItems],
            isLoading: false,
          });
          
          toast.success('Item added to wishlist');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Failed to add item to wishlist');
          throw error;
        }
      },

      removeFromWishlist: async (productId: number) => {
        try {
          set({ isLoading: true });
          await wishlistService.removeFromWishlist(productId);
          
          // Remove from local state immediately
          const updatedItems = get().items.filter(item => item.productId !== productId);
          set({ items: updatedItems, isLoading: false });
          
          toast.success('Item removed from wishlist');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Failed to remove item from wishlist');
          throw error;
        }
      },

      clearWishlist: async () => {
        try {
          set({ isLoading: true });
          await wishlistService.clearWishlist();
          set({ items: [], isLoading: false });
          toast.success('Wishlist cleared');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Failed to clear wishlist');
          throw error;
        }
      },

      moveToCart: async (productId: number, quantity: number = 1) => {
        try {
          set({ isLoading: true });
          await wishlistService.moveToCart(productId, quantity);
          
          // Remove from wishlist
          const updatedItems = get().items.filter(item => item.productId !== productId);
          set({ items: updatedItems, isLoading: false });
          
          toast.success('Item moved to cart');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Failed to move item to cart');
          throw error;
        }
      },

      checkWishlist: async (productId: number): Promise<boolean> => {
        try {
          const response = await wishlistService.checkWishlist(productId);
          return response.inWishlist;
        } catch (error) {
          return false;
        }
      },

      refreshWishlist: async () => {
        try {
          const response = await wishlistService.getWishlist();
          set({ items: response.wishlist });
        } catch (error) {
          console.error('Failed to refresh wishlist:', error);
        }
      },
    }),
    {
      name: 'modahaus-wishlist',
    }
  )
);