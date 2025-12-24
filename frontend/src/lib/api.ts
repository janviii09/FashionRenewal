import axios from 'axios';
import type {
  User,
  WardrobeItem,
  Order,
  Review,
  ReviewStats,
  Validation,
  Delivery,
  LoginFormData,
  SignupFormData,
  CreateItemFormData,
  UpdateItemFormData,
  CreateReviewFormData,
  ItemFilters,
  ItemAvailability,
  DeliveryStatus,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests - FIXED VERSION
api.interceptors.request.use((config) => {
  try {
    const authStorage = localStorage.getItem('auth-storage');

    if (authStorage) {
      const parsed = JSON.parse(authStorage);

      // Zustand persist v2 stores data under 'state' key
      const token = parsed.state?.token || parsed.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token attached to request');
      } else {
        console.warn('⚠️ No token found in auth-storage');
      }
    } else {
      console.warn('⚠️ No auth-storage found in localStorage');
    }
  } catch (e) {
    console.error('❌ Error parsing auth token:', e);
  }
  return config;
});

// Auth API
export const authApi = {
  login: (data: LoginFormData) =>
    api.post<{ access_token: string; user: User }>('/auth/login', data),

  signup: (data: SignupFormData) =>
    api.post<User>('/users', data),

  getUser: (id: number) =>
    api.get<User>(`/users/${id}`),
};

// Wardrobe API
export const wardrobeApi = {
  // Personal wardrobe
  createItem: (data: CreateItemFormData) =>
    api.post<WardrobeItem>('/wardrobe', data),

  getMyWardrobe: (filters?: ItemFilters) =>
    api.get<WardrobeItem[]>('/wardrobe/my-items', { params: filters }),

  updateItem: (id: number, data: UpdateItemFormData) =>
    api.patch<WardrobeItem>(`/wardrobe/${id}`, data),

  deleteItem: (id: number) =>
    api.delete(`/wardrobe/${id}`),

  // Marketplace (public)
  getMarketplaceItems: (filters?: ItemFilters) =>
    api.get<WardrobeItem[]>('/wardrobe/marketplace', { params: filters }),

  getItem: (id: number) =>
    api.get<WardrobeItem>(`/wardrobe/${id}`),
};

// Orders API
export const ordersApi = {
  createOrder: (data: { itemId: number; type: string; startDate?: string; endDate?: string; totalPrice?: number }) =>
    api.post<Order>('/marketplace/request', data),

  getOrders: () =>
    api.get<Order[]>('/marketplace/orders'),

  updateOrderStatus: (id: number, status: string, version?: number) =>
    api.patch<Order>(`/marketplace/order/${id}/status`, { status, version }),
};

// Reviews API
export const reviewsApi = {
  createReview: (orderId: number, data: CreateReviewFormData) =>
    api.post<Review>(`/reviews/order/${orderId}`, data),

  getUserReviews: (userId: number) =>
    api.get<Review[]>(`/reviews/user/${userId}`),

  getUserReviewStats: (userId: number) =>
    api.get<ReviewStats>(`/reviews/user/${userId}/stats`),
};

// Validation API (validators only)
export const validationApi = {
  getPendingValidations: () =>
    api.get<Validation[]>('/validations/pending'),

  approveValidation: (id: number, notes?: string) =>
    api.post<Validation>(`/validations/${id}/approve`, { notes }),

  rejectValidation: (id: number, notes: string) =>
    api.post<Validation>(`/validations/${id}/reject`, { notes }),

  getOrderValidation: (orderId: number) =>
    api.get<Validation>(`/validations/order/${orderId}`),
};

// Delivery API
export const deliveryApi = {
  getDelivery: (orderId: number) =>
    api.get<Delivery>(`/delivery/order/${orderId}`),

  updateDeliveryStatus: (orderId: number, status: DeliveryStatus, notes?: string, trackingNumber?: string) =>
    api.post<Delivery>(`/delivery/order/${orderId}/update-status`, {
      status,
      notes,
      trackingNumber,
    }),
};

export default api;
