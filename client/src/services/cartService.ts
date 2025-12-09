import api from './apiService';
import { CartItem, CartSummary } from '@/store/cartStore';

export interface CartResponse {
  items: CartItem[];
  summary: CartSummary;
}

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const response = await api.get('/cart');
    return response.data.data;
  },

  async addToCart(productId: number, quantity: number = 1): Promise<any> {
    const response = await api.post('/cart', { productId, quantity });
    return response.data.data;
  },

  async updateCartItem(itemId: number, quantity: number): Promise<any> {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data.data;
  },

  async removeFromCart(itemId: number): Promise<any> {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data.data;
  },

  async clearCart(): Promise<any> {
    const response = await api.delete('/cart');
    return response.data.data;
  },

  async moveToWishlist(itemId: number): Promise<any> {
    const response = await api.post(`/cart/move-to-wishlist/${itemId}`);
    return response.data.data;
  },

  async validateCart(): Promise<any> {
    const response = await api.post('/cart/validate');
    return response.data;
  },
};