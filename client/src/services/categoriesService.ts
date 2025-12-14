import api from './apiService';

export const categoriesService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data; // Changed from response.data.data
  },

  getCategory: async (identifier: string | number) => {
    const response = await api.get(`/categories/${identifier}`);
    return response.data; // Changed from response.data.data
  },

  getCategoryBreadcrumbs: async (identifier: string | number) => {
    const response = await api.get(`/categories/${identifier}/breadcrumbs`);
    return response.data; // Changed from response.data.data
  },
};