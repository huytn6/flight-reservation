import { $api } from '@/utils/$api';
import type { DraftStatusEnum, PassengerTypeEnum, SeatStatusEnum } from '@/types/enums';

export interface BookingDraft {
  id: string;
  user_id?: string;
  status?: DraftStatusEnum;
  expires_at: string;
  flight_offer_json?: string;
}

export interface DraftContact {
  full_name: string;
  email: string;
  phone: string;
}

export interface DraftPassenger {
  passenger_index: number;
  passenger_type: PassengerTypeEnum;
  full_name: string;
  date_of_birth?: string;
  nationality?: string;
  passport_number?: string;
  passport_expiry?: string;
}

export interface SeatMapSeat {
  id: string;
  seat_number: string;
  seat_type: string;
  extra_fee: number;
  status: SeatStatusEnum;
  held_by_me?: boolean;
}

export interface SeatMapData {
  flight_id: string;
  layout: {
    rows: number;
    seats_per_row: number;
    aisles: number[];
  };
  seats: SeatMapSeat[];
}

export interface SeatHold {
  id: string;
  draft_id: string;
  seat_id: string;
  passenger_index: number;
  expires_at: string;
}

export interface AncillaryItem {
  id?: string;
  code: string;
  name: string;
  ancillary_type: string;
  price: number;
  quantity?: number;
  passenger_index?: number;
  segment_id?: string;
}

export interface InsuranceOption {
  code: string;
  name: string;
  price: number;
  covers: string[];
}

export interface PriceBreakdown {
  fare_items: Array<{
    fare_id: string;
    fare_name: string;
    base_price: number;
    tax: number;
    fees: number;
    subtotal: number;
    passengers: number;
  }>;
  ancillary_items: Array<{
    code: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  fares_total: number;
  ancillary_total: number;
  coupon_discount: number;
  grand_total: number;
  currency: string;
}

export const draftService = {
  createDraft: async (flights: Array<{ flight_id: string; fare_id: string }>): Promise<{ id: string; expires_at: string }> => {
    return $api.post('/booking-drafts', { flights });
  },

  getDraft: async (draftId: string): Promise<any> => {
    return $api.get(`/booking-drafts/${draftId}`);
  },

  cancelDraft: async (draftId: string): Promise<void> => {
    return $api.delete(`/booking-drafts/${draftId}`);
  },

  repriceDraft: async (draftId: string): Promise<{ price_changed: boolean; fares: any[] }> => {
    return $api.post(`/booking-drafts/${draftId}/reprice`);
  },

  getSummary: async (draftId: string): Promise<PriceBreakdown> => {
    return $api.get(`/booking-drafts/${draftId}/summary`);
  },

  saveContact: async (draftId: string, contact: DraftContact): Promise<void> => {
    return $api.put(`/booking-drafts/${draftId}/contact`, contact);
  },

  getPassengers: async (draftId: string): Promise<DraftPassenger[]> => {
    return $api.get(`/booking-drafts/${draftId}/passengers`);
  },

  savePassengers: async (draftId: string, passengers: Partial<DraftPassenger>[]): Promise<void> => {
    return $api.put(`/booking-drafts/${draftId}/passengers`, passengers);
  },

  getSeatMap: async (draftId: string, segmentId: string): Promise<SeatMapData> => {
    return $api.get(`/booking-drafts/${draftId}/segments/${segmentId}/seat-map`);
  },

  getSeatHolds: async (draftId: string): Promise<SeatHold[]> => {
    return $api.get(`/booking-drafts/${draftId}/seat-holds`);
  },

  holdSeat: async (draftId: string, seatId: string, passengerIndex: number): Promise<{ id: string; expires_at: string }> => {
    return $api.post(`/booking-drafts/${draftId}/seat-holds`, { seat_id: seatId, passenger_index: passengerIndex });
  },

  changeSeatHold: async (draftId: string, holdId: string, seatId: string): Promise<{ id: string; expires_at: string }> => {
    return $api.patch(`/booking-drafts/${draftId}/seat-holds/${holdId}`, { seat_id: seatId });
  },

  releaseSeatHold: async (draftId: string, holdId: string): Promise<void> => {
    return $api.delete(`/booking-drafts/${draftId}/seat-holds/${holdId}`);
  },

  getAncillaries: async (draftId: string): Promise<{ selected: AncillaryItem[]; available: AncillaryItem[] }> => {
    return $api.get(`/booking-drafts/${draftId}/ancillaries`);
  },

  addAncillary: async (draftId: string, data: AncillaryItem): Promise<{ id: string }> => {
    return $api.post(`/booking-drafts/${draftId}/ancillaries`, data);
  },

  updateAncillary: async (draftId: string, itemId: string, quantity: number): Promise<void> => {
    return $api.patch(`/booking-drafts/${draftId}/ancillaries/${itemId}`, { quantity });
  },

  deleteAncillary: async (draftId: string, itemId: string): Promise<void> => {
    return $api.delete(`/booking-drafts/${draftId}/ancillaries/${itemId}`);
  },

  getInsuranceOptions: async (draftId: string): Promise<InsuranceOption[]> => {
    return $api.get(`/booking-drafts/${draftId}/insurance-options`);
  },

  addInsurance: async (draftId: string, planCode: string): Promise<{ id: string; plan_name: string; price: number }> => {
    return $api.post(`/booking-drafts/${draftId}/insurance`, { plan_code: planCode });
  },

  removeInsurance: async (draftId: string): Promise<void> => {
    return $api.delete(`/booking-drafts/${draftId}/insurance`);
  },

  getPriceBreakdown: async (draftId: string): Promise<PriceBreakdown> => {
    return $api.get(`/booking-drafts/${draftId}/price-breakdown`);
  },

  applyCoupon: async (draftId: string, code: string): Promise<{ code: string; discount: number }> => {
    return $api.post(`/booking-drafts/${draftId}/coupons`, { code });
  },

  removeCoupon: async (draftId: string, code: string): Promise<void> => {
    return $api.delete(`/booking-drafts/${draftId}/coupons/${code}`);
  },
};
