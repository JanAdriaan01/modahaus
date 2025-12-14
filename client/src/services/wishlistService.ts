import api from './apiService';

export const wishlistService = {
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data; // Changed from response.data.data
  },

  addToWishlist: async (productId: number) => {
    const response = await api.post('/wishlist', { productId });
    return response.data; // Changed from response.data.data
  },

  removeFromWishlist: async (productId: number) => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data; // Changed from response.data.data
  },

  clearWishlist: async () => {
    const response = await api.delete('/wishlist');
    return response.data; // Changed from response.data.data
  },

  checkWishlist: async (productId: number) => {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data; // Changed from response.data.data
  },

  moveToCart: async (productId: number, quantity: number = 1) => {
    const response = await api.post(`/wishlist/move-to-cart/${productId}`, { quantity });
    return response.data; // Changed from response.data.data
  },
};