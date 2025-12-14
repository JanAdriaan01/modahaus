import api from './apiService';

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
    return response.data; // Changed from response.data.data
  },

  getOrders: async (params: {
    page?: number;
    limit?: number;
  } = {}) => {
    const response = await api.get('/orders', { params });
    return response.data; // Changed from response.data.data
  },

  getOrder: async (orderId: number) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data; // Changed from response.data.data
  },

  trackOrder: async (orderNumber: string) => {
    const response = await api.get(`/orders/track/${orderNumber}`);
    return response.data; // Changed from response.data.data
  },
};