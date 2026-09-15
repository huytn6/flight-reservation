import { $api } from '@/utils/$api';
import type { CabinClassEnum, FlightStatusEnum } from '@/types/enums';

export interface SearchFlightPayload {
  trip_type?: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY';
  origin?: string;
  destination?: string;
  departure_date?: string;
  return_date?: string;
  passengers?: number;
  cabin_class?: CabinClassEnum | string;
  min_price?: number;
  max_price?: number;
  airlines?: string[];
  refundable?: boolean;
  sort?: 'price' | 'departure' | 'duration';
  legs?: Array<{ origin: string; destination: string; departure_date: string }>;
}

export interface FareOption {
  id: string;
  flight_id?: string;
  cabin_class_id?: string;
  cabin_code?: string;
  cabin_name?: string;
  fare_code: string;
  fare_name: string;
  base_price: number;
  tax: number;
  fees: number;
  available_seats: number;
  baggage_kg?: number;
  carry_on_kg?: number;
  is_refundable?: boolean;
  is_changeable?: boolean;
  change_fee?: number;
  cancel_fee?: number;
}

export interface FlightOffer {
  id: string;
  flight_number: string;
  airline: {
    iata_code: string;
    name: string;
    logo_url?: string;
  };
  departure_airport: {
    iata_code: string;
    name: string;
    city: string;
    timezone?: string;
  };
  arrival_airport: {
    iata_code: string;
    name: string;
    city: string;
    timezone?: string;
  };
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  status: FlightStatusEnum;
  stops: number;
  fares: FareOption[];
  cheapest_total: number;
}

/** Flat shape returned by GET /flights/status (public flight-status lookup). */
export interface FlightStatusItem {
  id: string;
  flight_number: string;
  airline_name: string;
  airline_code?: string;
  departure_city: string;
  departure_iata?: string;
  arrival_city: string;
  arrival_iata?: string;
  departure_time: string;
  arrival_time: string;
  status: FlightStatusEnum;
}

export interface SearchFlightResult {
  origin: string;
  destination: string;
  departure_date: string;
  flights: FlightOffer[];
  total: number;
}

export interface SearchFlightResponse {
  trip_type: string;
  outbound?: SearchFlightResult;
  inbound?: SearchFlightResult;
  legs?: SearchFlightResult[];
}

export interface FareRule {
  rule_type: string;
  description: string;
}

export interface FareBaggage {
  checked_baggage_kg: number;
  carry_on_kg: number;
  extra_baggage_available: boolean;
}

export const flightService = {
  searchFlights: async (payload: SearchFlightPayload): Promise<SearchFlightResponse> => {
    return $api.post('/flights/search', payload);
  },

  /** Public flight-status lookup by flight number / city / airline name. Empty query returns upcoming flights. */
  searchFlightStatus: async (query: string): Promise<FlightStatusItem[]> => {
    return $api.get('/flights/status', { params: { q: query } });
  },

  getFlexibleDates: async (origin: string, destination: string, date: string): Promise<Array<{ date: string; min_price: number | null }>> => {
    return $api.get('/flights/flexible-dates', { params: { origin, destination, date } });
  },

  getPriceCalendar: async (origin: string, destination: string, month: string): Promise<Array<{ date: string; min_price: number }>> => {
    return $api.get('/flights/price-calendar', { params: { origin, destination, month } });
  },

  getWeeklyPrices: async (origin: string, destination: string, month: string): Promise<Array<{ date: string; min_price: number }>> => {
    return $api.get('/flights/weekly-prices', { params: { origin, destination, month } });
  },

  getFlightOffer: async (flightId: string): Promise<FlightOffer> => {
    return $api.get(`/flight-offers/${flightId}`);
  },

  repriceOffer: async (flightId: string, fareId?: string): Promise<any> => {
    return $api.post(`/flight-offers/${flightId}/reprice`, { fare_id: fareId });
  },

  getSegments: async (flightId: string): Promise<any[]> => {
    return $api.get(`/flight-offers/${flightId}/segments`);
  },

  getFareOptions: async (flightId: string): Promise<FareOption[]> => {
    return $api.get(`/flight-offers/${flightId}/fare-options`);
  },

  getFareComparison: async (flightId: string): Promise<FareOption[]> => {
    return $api.get(`/flight-offers/${flightId}/fare-comparison`);
  },

  getFare: async (fareId: string): Promise<FareOption> => {
    return $api.get(`/fares/${fareId}`);
  },

  getFareRules: async (fareId: string): Promise<FareRule[]> => {
    return $api.get(`/fares/${fareId}/rules`);
  },

  getFareBaggage: async (fareId: string): Promise<FareBaggage> => {
    return $api.get(`/fares/${fareId}/baggage`);
  },

};
