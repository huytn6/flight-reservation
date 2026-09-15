import { $api } from '@/utils/$api';
import type { AuthUser } from '@/types/auth';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export const userService = {
  getProfile: async (): Promise<AuthUser> => {
    return $api.get('/users/me');
  },

  updateProfile: async (data: {
    full_name?: string;
    phone?: string;
    date_of_birth?: string;
    nationality?: string;
    gender?: string;
    bio?: string;
    special_assistance?: string;
  }): Promise<void> => {
    return $api.patch('/users/me', data);
  },
};
