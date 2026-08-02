import { $api } from '@/utils/$api';
import type {
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
} from '@/types/auth';

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthUser> => {
    return $api.post('/auth/register', payload);
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    return $api.post('/auth/login', payload);
  },

  logout: async (): Promise<void> => {
    return $api.post('/auth/logout');
  },

  refresh: async (): Promise<{ token: string; expires_at: string }> => {
    return $api.post('/auth/refresh');
  },

  getMe: async (): Promise<AuthUser> => {
    return $api.get('/auth/me');
  },

  forgotPassword: async (email: string): Promise<void> => {
    return $api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, new_password: string): Promise<void> => {
    return $api.post('/auth/reset-password', { token, new_password });
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    return $api.put('/auth/change-password', payload);
  },
};
