import { $api } from '@/utils/$api';
import type { PaginatedResult } from '@/services/user';

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
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
};
