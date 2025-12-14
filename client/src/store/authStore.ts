import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';
import { useCartStore } from './cartStore';
import { useWishlistStore } from './wishlistStore';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName:string;
  isAdmin: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,

      login: async (email, password) => {
        try {
          set({ isLoading: true });

          const response = await authService.login(email, password);

          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });

          toast.success('Login successful');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Login failed');
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true });

          const response = await authService.register(data);

          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });

          toast.success('Registration successful');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Registration failed');
        }
      },

      logout: () => {
        set({ user: null, token: null });
        useCartStore.getState().clearLocalCart();
        useWishlistStore.getState().clearLocalWishlist();
        toast.success('Logged out successfully');
      },

      updateProfile: async (data) => {
        try {
          set({ isLoading: true });

          const response = await authService.updateProfile(data);

          set({
            user: { ...get().user!, ...response.user },
            isLoading: false,
          });

          toast.success('Profile updated');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Failed to update profile');
        }
      },

      initializeAuth: async () => {
        const token = get().token;

        if (!token) {
          set({ isInitialized: true });
          return;
        }

        try {
          set({ isLoading: true });

          const response = await authService.getProfile();

          set({
            user: response.user,
            isLoading: false,
            isInitialized: true,
          });
        } catch {
          set({
            user: null,
            token: null,
            isInitialized: true,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'modahaus-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
