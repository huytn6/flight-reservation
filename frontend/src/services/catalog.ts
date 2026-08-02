import { $api } from '@/utils/$api';
import type { Airport } from '@/types/airport';

export interface Airline {
  id: string;
  iata_code: string;
  name: string;
  country?: string;
  logo_url?: string;
}

export interface CabinClass {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface Country {
  code: string;
  name: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface PaymentMethodConfig {
  code: string;
  name: string;
  description: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type?: string;
  discount_value?: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  description?: string;
  valid_until?: string;
  status?: string;
}

export const catalogService = {
  getAirports: async (q = '', page = 1, size = 20): Promise<{ items: Airport[]; total: number }> => {
    return $api.get('/airports', { params: { q, page, size } });
  },

  autocompleteAirports: async (q: string): Promise<Airport[]> => {
    if (!q.trim()) return [];
    return $api.get('/airports/autocomplete', { params: { q } });
  },

  getNearbyAirports: async (lat: number, lng: number): Promise<Airport[]> => {
    return $api.get('/airports/nearby', { params: { lat, lng } });
  },

  getAirport: async (airportId: string): Promise<Airport> => {
    return $api.get(`/airports/${airportId}`);
  },

  getAirlines: async (): Promise<Airline[]> => {
    return $api.get('/airlines');
  },

  getAirline: async (airlineId: string): Promise<Airline> => {
    return $api.get(`/airlines/${airlineId}`);
  },

  getCabinClasses: async (): Promise<CabinClass[]> => {
    return $api.get('/cabin-classes');
  },

  getCountries: async (): Promise<Country[]> => {
    return $api.get('/config/countries');
  },

  getCurrencies: async (): Promise<Currency[]> => {
    return $api.get('/config/currencies');
  },

  getPaymentMethods: async (): Promise<PaymentMethodConfig[]> => {
    return $api.get('/config/payment-methods');
  },

  getCoupons: async (role?: string): Promise<Coupon[]> => {
    if (role === 'ADMIN' || role === 'STAFF') {
      try {
        const res: any = await $api.get('/admin/coupons');
        return Array.isArray(res) ? res : res?.items || [];
      } catch {
        return [];
      }
    }
    return [];
  },
};
