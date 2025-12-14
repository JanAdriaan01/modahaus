import api from './apiService';

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
    return response.data; // Changed from response.data.data
  },

  getFeaturedProducts: async (limit?: number) => {
    const response = await api.get('/products/featured', {
      params: { limit }
    });
    return response.data; // Changed from response.data.data
  },

  getProduct: async (identifier: string | number) => {
    const response = await api.get(`/products/${identifier}`);
    return response.data; // Changed from response.data.data
  },
};