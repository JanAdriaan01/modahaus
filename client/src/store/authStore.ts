import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await authService.login(email, password);
          
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
          
          toast.success('Login successful!');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Login failed');
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true });
          const response = await authService.register(userData);
          
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
          
          toast.success('Registration successful!');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Registration failed');
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
        });
        toast.success('Logged out successfully');
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          set({ isLoading: true });
          const response = await authService.updateProfile(data);
          
          set({
            user: { ...get().user!, ...response.user },
            isLoading: false,
          });
          
          toast.success('Profile updated successfully');
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Profile update failed');
          throw error;
        }
      },

      initializeAuth: async () => {
        try {
          const token = get().token;
          if (!token) {
            set({ isInitialized: true });
            return;
          }

          set({ isLoading: true });
          const response = await authService.getProfile();
          
          set({
            user: response.user,
            isLoading: false,
            isInitialized: true,
          });
        } catch (error) {
          // Token is invalid, clear auth state
          set({
            user: null,
            token: null,
            isLoading: false,
            isInitialized: true,
          });
        }
      },
    }),
    {
      name: 'modahaus-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);