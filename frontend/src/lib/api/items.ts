import api from '@/lib/api';
import type { WardrobeItem, ItemFilters, PaginatedResponse, CreateItemFormData } from '@/types';

export const itemsApi = {
  getItems: async (filters?: ItemFilters, page = 1, limit = 12): Promise<PaginatedResponse<WardrobeItem>> => {
    const response = await api.get<PaginatedResponse<WardrobeItem>>('/wardrobe', {
      params: { ...filters, page, limit },
    });
    return response.data;
  },

  getItemById: async (id: string): Promise<WardrobeItem> => {
    const response = await api.get<WardrobeItem>(`/wardrobe/${id}`);
    return response.data;
  },

  getMyItems: async (): Promise<WardrobeItem[]> => {
    const response = await api.get<WardrobeItem[]>('/wardrobe/my-items');
    return response.data;
  },

  createItem: async (data: FormData): Promise<WardrobeItem> => {
    const response = await api.post<WardrobeItem>('/wardrobe', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateItem: async (id: string, data: Partial<CreateItemFormData>): Promise<WardrobeItem> => {
    const response = await api.patch<WardrobeItem>(`/wardrobe/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/wardrobe/${id}`);
  },

  getFeaturedItems: async (): Promise<WardrobeItem[]> => {
    const response = await api.get<WardrobeItem[]>('/wardrobe/featured');
    return response.data;
  },
};
