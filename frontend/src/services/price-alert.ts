import { $api } from '@/utils/$api';

export interface PriceAlert {
  id: string;
  user_id: string;
  origin_iata: string;
  destination_iata: string;
  departure_date: string;
  max_price?: number;
  current_price?: number;
  is_active: boolean;
  created_at: string;
}

export interface PriceAlertHistory {
  id: string;
  alert_id: string;
  price: number;
  recorded_at: string;
}

export const priceAlertService = {
  getAlerts: async (): Promise<PriceAlert[]> => {
    return $api.get('/users/me/price-alerts');
  },

  createAlert: async (data: { origin_iata: string; destination_iata: string; departure_date: string; max_price?: number }): Promise<PriceAlert> => {
    return $api.post('/users/me/price-alerts', data);
  },

  getAlert: async (alertId: string): Promise<PriceAlert> => {
    return $api.get(`/users/me/price-alerts/${alertId}`);
  },

  updateAlert: async (alertId: string, data: Partial<PriceAlert>): Promise<void> => {
    return $api.patch(`/users/me/price-alerts/${alertId}`, data);
  },

  deleteAlert: async (alertId: string): Promise<void> => {
    return $api.delete(`/users/me/price-alerts/${alertId}`);
  },

  getHistory: async (alertId: string): Promise<PriceAlertHistory[]> => {
    return $api.get(`/users/me/price-alerts/${alertId}/history`);
  },
};
