import { $api } from '@/utils/$api';
import type { ActiveSession, AuthUser, SavedPassenger } from '@/types/auth';

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

  updateProfile: async (data: { full_name?: string; phone?: string }): Promise<void> => {
    return $api.patch('/users/me', data);
  },

  getSessions: async (page = 1, size = 20): Promise<PaginatedResult<ActiveSession>> => {
    return $api.get('/users/me/sessions', { params: { page, size } });
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    return $api.delete(`/users/me/sessions/${sessionId}`);
  },

  getSavedPassengers: async (): Promise<SavedPassenger[]> => {
    return $api.get('/users/me/saved-passengers');
  },

  addSavedPassenger: async (data: Partial<SavedPassenger>): Promise<SavedPassenger> => {
    return $api.post('/users/me/saved-passengers', data);
  },

  updateSavedPassenger: async (pid: string, data: Partial<SavedPassenger>): Promise<void> => {
    return $api.patch(`/users/me/saved-passengers/${pid}`, data);
  },

  deleteSavedPassenger: async (pid: string): Promise<void> => {
    return $api.delete(`/users/me/saved-passengers/${pid}`);
  },
};
