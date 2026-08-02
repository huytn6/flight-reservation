import { $api } from '@/utils/$api';
import type { PaginatedResult } from '@/services/user';

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface TravelAlertPreferences {
  user_id?: string;
  flight_delay_push: boolean;
  gate_change_push: boolean;
  price_drop_email: boolean;
}

export const notificationService = {
  getNotifications: async (page = 1, size = 20): Promise<PaginatedResult<AppNotification>> => {
    return $api.get('/users/me/notifications', { params: { page, size } });
  },

  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    return $api.get('/users/me/notifications/unread-count');
  },

  markRead: async (notifId: string): Promise<void> => {
    return $api.patch(`/users/me/notifications/${notifId}/read`);
  },

  markAllRead: async (): Promise<void> => {
    return $api.post('/users/me/notifications/read-all');
  },

  getPreferences: async (): Promise<TravelAlertPreferences> => {
    return $api.get('/users/me/travel-alert-preferences');
  },

  updatePreferences: async (data: Partial<TravelAlertPreferences>): Promise<void> => {
    return $api.patch('/users/me/travel-alert-preferences', data);
  },
};
