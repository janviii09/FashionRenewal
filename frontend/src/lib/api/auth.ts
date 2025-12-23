import api from '@/lib/api';
import type { LoginFormData, SignupFormData, User } from '@/types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  signup: async (data: Omit<SignupFormData, 'confirmPassword' | 'acceptTerms'>): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/auth/profile', data);
    return response.data;
  },
};
