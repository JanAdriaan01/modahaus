import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => {
    const response = await api.put('/users/profile', data);
    return response.data.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.put('/users/password', data);
    return response.data.data;
  },
};

// Products Service
export const productsService = {
  getProducts: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    sort?: string;
    search?: string;
  } = {}) => {
    const response = await api.get('/products', { params });
    return response.data.data;
  },

  getFeaturedProducts: async (limit?: number) => {
    const response = await api.get('/products/featured', {
      params: { limit }
    });
    return response.data.data;
  },

  getProduct: async (identifier: string | number) => {
    const response = await api.get(`/products/${identifier}`);
    return response.data.data;
  },
};

// Categories Service
export const categoriesService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data.data;
  },

  getCategory: async (identifier: string | number) => {
    const response = await api.get(`/categories/${identifier}`);
    return response.data.data;
  },

  getCategoryBreadcrumbs: async (identifier: string | number) => {
    const response = await api.get(`/categories/${identifier}/breadcrumbs`);
    return response.data.data;
  },
};

// Orders Service
export const ordersService = {
  createOrder: async (orderData: {
    items: Array<{
      productId: number;
      quantity: number;
    }>;
    shippingAddress: any;
    billingAddress: any;
    paymentMethod: string;
    shippingMethod: string;
  }) => {
    const response = await api.post('/orders', orderData);
    return response.data.data;
  },

  getOrders: async (params: {
    page?: number;
    limit?: number;
  } = {}) => {
    const response = await api.get('/orders', { params });
    return response.data.data;
  },

  getOrder: async (orderId: number) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
  },

  trackOrder: async (orderNumber: string) => {
    const response = await api.get(`/orders/track/${orderNumber}`);
    return response.data.data;
  },
};

// Cart Service
export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data.data;
  },

  addToCart: async (productId: number, quantity: number = 1) => {
    const response = await api.post('/cart', { productId, quantity });
    return response.data.data;
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data.data;
  },

  removeFromCart: async (itemId: number) => {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data.data;
  },

  moveToWishlist: async (itemId: number) => {
    const response = await api.post(`/cart/move-to-wishlist/${itemId}`);
    return response.data.data;
  },
};

// Wishlist Service
export const wishlistService = {
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data.data;
  },

  addToWishlist: async (productId: number) => {
    const response = await api.post('/wishlist', { productId });
    return response.data.data;
  },

  removeFromWishlist: async (productId: number) => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data.data;
  },

  clearWishlist: async () => {
    const response = await api.delete('/wishlist');
    return response.data.data;
  },

  checkWishlist: async (productId: number) => {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data.data;
  },

  moveToCart: async (productId: number, quantity: number = 1) => {
    const response = await api.post(`/wishlist/move-to-cart/${productId}`, { quantity });
    return response.data.data;
  },
};

// Users Service
export const usersService = {
  getAddresses: async () => {
    const response = await api.get('/users/addresses');
    return response.data.data;
  },

  addAddress: async (address: {
    type: 'billing' | 'shipping';
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault?: boolean;
  }) => {
    const response = await api.post('/users/addresses', address);
    return response.data.data;
  },

  updateAddress: async (addressId: number, address: any) => {
    const response = await api.put(`/users/addresses/${addressId}`, address);
    return response.data.data;
  },

  deleteAddress: async (addressId: number) => {
    const response = await api.delete(`/users/addresses/${addressId}`);
    return response.data.data;
  },
};

export default api;