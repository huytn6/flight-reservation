import { $api } from '@/utils/$api';

export interface LoginPayload {
  email: string;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    return $api.post('/auth/login', payload);
  },
  refreshToken: async (token: string) => {
    return $api.post('/auth/refresh-token', { refreshToken: token });
  },
  logout: async () => {
    return $api.post('/auth/logout');
  },
};
