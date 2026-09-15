import { $api } from '@/utils/$api';
import type { PaginatedResult } from '@/services/user';
import type { BookingStatusEnum } from '@/types/enums';

export interface Booking {
  id: string;
  user_id: string;
  pnr: string;
  status: BookingStatusEnum;
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
  status: BookingStatusEnum;
  issued_at: string;
}

export const bookingService = {
  createBooking: async (draftId: string): Promise<{ id: string; pnr: string }> => {
    return $api.post('/bookings', { draft_id: draftId });
  },

  getBooking: async (bookingId: string): Promise<BookingDetail> => {
    return $api.get(`/bookings/${bookingId}`);
  },

  getMyBookings: async (status?: BookingStatusEnum | string, page = 1, size = 20): Promise<PaginatedResult<Booking>> => {
    return $api.get('/users/me/bookings', { params: { status, page, size } });
  },

  getMyBookingDetail: async (bookingId: string): Promise<BookingDetail> => {
    return $api.get(`/users/me/bookings/${bookingId}`);
  },

  getETickets: async (bookingId: string): Promise<ETicket[]> => {
    return $api.get(`/bookings/${bookingId}/e-tickets`);
  },

  resendConfirmation: async (bookingId: string): Promise<void> => {
    return $api.post(`/users/me/bookings/${bookingId}/resend-confirmation`);
  },

  sendDocumentsEmail: async (bookingId: string): Promise<void> => {
    return $api.post(`/bookings/${bookingId}/documents/send-email`);
  },

  cancelBooking: async (bookingId: string, reason?: string): Promise<void> => {
    return $api.post(`/users/me/bookings/${bookingId}/cancel`, { reason });
  },

  getStatusHistory: async (bookingId: string): Promise<any[]> => {
    return $api.get(`/users/me/bookings/${bookingId}/history`);
  },

  getPrintable: async (bookingId: string): Promise<any> => {
    return $api.get(`/users/me/bookings/${bookingId}/printable`);
  },
};
