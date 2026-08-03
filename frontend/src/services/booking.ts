import { $api } from '@/utils/$api';
import type { PaginatedResult } from '@/services/user';

export interface Booking {
  id: string;
  user_id: string;
  pnr: string;
  status: string;
  total_amount: number;
  currency: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  updated_at?: string;
  base_price?: number;
  tax_fee?: number;
  total_price?: number;
}

export interface BookingDetail {
  booking: Booking;
  segments: any[];
  passengers: any[];
  payments?: any[];
  history?: any[];
}

export interface ETicket {
  id: string;
  booking_id: string;
  ticket_number: string;
  passenger_name: string;
  status: string;
  issued_at: string;
}

export const bookingService = {
  createBooking: async (draftId: string): Promise<{ id: string; pnr: string }> => {
    return $api.post('/bookings', { draft_id: draftId });
  },

  getBooking: async (bookingId: string): Promise<BookingDetail> => {
    return $api.get(`/bookings/${bookingId}`);
  },

  getMyBookings: async (status?: string, page = 1, size = 20): Promise<PaginatedResult<Booking>> => {
    return $api.get('/users/me/bookings', { params: { status, page, size } });
  },

  getMyBookingDetail: async (bookingId: string): Promise<BookingDetail> => {
    return $api.get(`/users/me/bookings/${bookingId}`);
  },

  getStatusHistory: async (bookingId: string): Promise<any[]> => {
    return $api.get(`/users/me/bookings/${bookingId}/history`);
  },

  getPrintable: async (bookingId: string): Promise<any> => {
    return $api.get(`/users/me/bookings/${bookingId}/printable`);
  },

  resendConfirmation: async (bookingId: string): Promise<void> => {
    return $api.post(`/users/me/bookings/${bookingId}/resend-confirmation`);
  },

  lookupBooking: async (pnr: string, lastName: string): Promise<BookingDetail> => {
    return $api.post('/bookings/lookup', { pnr, last_name: lastName });
  },

  getItinerary: async (bookingId: string): Promise<any> => {
    return $api.get(`/bookings/${bookingId}/itinerary`);
  },

  getETickets: async (bookingId: string): Promise<ETicket[]> => {
    return $api.get(`/bookings/${bookingId}/e-tickets`);
  },

  getETicket: async (bookingId: string, ticketId: string): Promise<ETicket> => {
    return $api.get(`/bookings/${bookingId}/e-tickets/${ticketId}`);
  },

  getReceipt: async (bookingId: string): Promise<any> => {
    return $api.get(`/bookings/${bookingId}/receipt`);
  },

  sendDocumentsEmail: async (bookingId: string): Promise<void> => {
    return $api.post(`/bookings/${bookingId}/documents/send-email`);
  },

  cancellationPreview: async (bookingId: string): Promise<{ refund_amount: number; cancellation_fee: number }> => {
    return $api.post(`/users/me/bookings/${bookingId}/cancellation-preview`);
  },

  cancelBooking: async (bookingId: string, reason?: string): Promise<any> => {
    return $api.post(`/users/me/bookings/${bookingId}/cancel`, { reason });
  },

  getCancellation: async (bookingId: string): Promise<any> => {
    return $api.get(`/users/me/bookings/${bookingId}/cancellation`);
  },

  refundPreview: async (bookingId: string): Promise<any> => {
    return $api.get(`/bookings/${bookingId}/refund-preview`);
  },

  createRefund: async (bookingId: string, amount?: number, reason?: string): Promise<any> => {
    return $api.post(`/bookings/${bookingId}/refunds`, { amount, reason });
  },

  getRefunds: async (bookingId: string): Promise<any[]> => {
    return $api.get(`/bookings/${bookingId}/refunds`);
  },

  getRefund: async (refundId: string): Promise<any> => {
    return $api.get(`/refunds/${refundId}`);
  },

  getCheckInLink: async (bookingId: string): Promise<{ check_in_url: string; opens_at: string; note: string }> => {
    return $api.get(`/bookings/${bookingId}/check-in`);
  },

  getFlightStatus: async (bookingId: string): Promise<any> => {
    return $api.get(`/bookings/${bookingId}/flight-status`);
  },

  getTravelAlerts: async (bookingId: string): Promise<any[]> => {
    return $api.get(`/bookings/${bookingId}/travel-alerts`);
  },

  changeSearch: async (bookingId: string, searchData: any): Promise<any> => {
    return $api.post(`/users/me/bookings/${bookingId}/change-search`, searchData);
  },

  changeQuote: async (bookingId: string, newFareId: string): Promise<any> => {
    return $api.post(`/users/me/bookings/${bookingId}/change-quote`, { new_fare_id: newFareId });
  },

  changeConfirm: async (bookingId: string, newFareId: string, newFlightId: string, oldFlightId?: string): Promise<any> => {
    return $api.post(`/users/me/bookings/${bookingId}/change-confirm`, {
      new_fare_id: newFareId,
      new_flight_id: newFlightId,
      old_flight_id: oldFlightId,
    });
  },

  getChangeStatus: async (bookingId: string): Promise<any> => {
    return $api.get(`/users/me/bookings/${bookingId}/change-status`);
  },

  getPostBookingSeatMap: async (bookingId: string, segmentId: string): Promise<any> => {
    return $api.get(`/users/me/bookings/${bookingId}/segments/${segmentId}/seat-map`);
  },

  seatChangePreview: async (bookingId: string, seatId?: string): Promise<any> => {
    return $api.post(`/users/me/bookings/${bookingId}/seat-change-preview`, { seat_id: seatId });
  },

  seatChangeConfirm: async (bookingId: string, segmentId: string, passengerId: string, newSeatId: string): Promise<void> => {
    return $api.post(`/users/me/bookings/${bookingId}/seat-change-confirm`, {
      segment_id: segmentId,
      passenger_id: passengerId,
      new_seat_id: newSeatId,
    });
  },
};
