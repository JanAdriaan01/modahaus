import api from './apiService';

export const usersService = {
  getAddresses: async () => {
    const response = await api.get('/users/addresses');
    return response.data; // Changed from response.data.data
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
    return response.data; // Changed from response.data.data
  },

  updateAddress: async (addressId: number, address: any) => {
    const response = await api.put(`/users/addresses/${addressId}`, address);
    return response.data; // Changed from response.data.data
  },

  deleteAddress: async (addressId: number) => {
    const response = await api.delete(`/users/addresses/${addressId}`);
    return response.data; // Changed from response.data.data
  },
};