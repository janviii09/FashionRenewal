import api from '@/lib/api';
import type { Order, RentalRequestFormData } from '@/types';

export const ordersApi = {
  createRentalRequest: async (
    data: RentalRequestFormData, 
    idempotencyKey: string
  ): Promise<Order> => {
    const response = await api.post<Order>('/marketplace/request', data, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return response.data;
  },

  getMyOrders: async (type: 'renter' | 'owner'): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders`, {
      params: { type },
    });
    return response.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string, version: number): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${id}/status`, { 
      status,
      version,
    });
    return response.data;
  },

  cancelOrder: async (id: string, version: number): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${id}/cancel`, { version });
    return response.data;
  },
};
