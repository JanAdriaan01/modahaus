import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistService } from '@/services/wishlistService';
import { toast } from 'react-toastify';

export interface WishlistItem {
  id: number;
  productId: number;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;

  loadWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  clearLocalWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      loadWishlist: async () => {
        try {
          set({ isLoading: true });
          const res = await wishlistService.getWishlist();
          set({ items: res.wishlist ?? [], isLoading: false });
        } catch {
          set({ items: [], isLoading: false });
        }
      },

      addToWishlist: async (productId) => {
        try {
          set({ isLoading: true });
          await wishlistService.addToWishlist(productId);
          set({
            items: [{ id: Date.now(), productId }, ...get().items],
            isLoading: false,
          });
          toast.success('Added to wishlist');
        } catch {
          set({ isLoading: false });
          toast.error('Failed to add');
        }
      },

      removeFromWishlist: async (productId) => {
        try {
          set({ isLoading: true });
          await wishlistService.removeFromWishlist(productId);
          set({
            items: get().items.filter(
              (i) => i.productId !== productId
            ),
            isLoading: false,
          });
          toast.success('Removed');
        } catch {
          set({ isLoading: false });
          toast.error('Failed to remove');
        }
      },

      clearLocalWishlist: () => {
        set({ items: [] });
      },
    }),
    { name: 'modahaus-wishlist' }
  )
);