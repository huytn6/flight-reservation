import { $api } from '@/utils/$api';
import type { PaginatedResult } from '@/services/user';
import type { Booking } from '@/services/booking';
import type { SupportTicket } from '@/services/support';

export interface StaffBookingDetail {
  booking: Booking;
  segments: any[];
  passengers: any[];
  payments: any[];
  notes: Array<{ id: string; note: string; created_by: string; created_at: string }>;
}

export const staffService = {
  getBookings: async (q = '', status = '', pnr = '', page = 1, size = 20): Promise<PaginatedResult<Booking>> => {
    return $api.get('/staff/bookings', { params: { q, status, pnr, page, size } });
  },

  getBookingDetail: async (bookingId: string): Promise<StaffBookingDetail> => {
    return $api.get(`/staff/bookings/${bookingId}`);
  },

  updateContact: async (bookingId: string, contactData: { contact_name?: string; contact_email?: string; contact_phone?: string }): Promise<void> => {
    return $api.patch(`/staff/bookings/${bookingId}/contact`, contactData);
  },

  updatePassenger: async (bookingId: string, passengerId: string, data: any): Promise<void> => {
    return $api.patch(`/staff/bookings/${bookingId}/passengers/${passengerId}`, data);
  },

  changeSeat: async (bookingId: string, data: { segment_id: string; passenger_id: string; new_seat_id: string }): Promise<void> => {
    return $api.post(`/staff/bookings/${bookingId}/change-seat`, data);
  },

  cancelBooking: async (bookingId: string, reason: string): Promise<void> => {
    return $api.post(`/staff/bookings/${bookingId}/cancel`, { reason });
  },

  addNote: async (bookingId: string, note: string): Promise<{ id: string }> => {
    return $api.post(`/staff/bookings/${bookingId}/notes`, { note });
  },

  getNotes: async (bookingId: string): Promise<any[]> => {
    return $api.get(`/staff/bookings/${bookingId}/notes`);
  },

  getHistory: async (bookingId: string): Promise<any[]> => {
    return $api.get(`/staff/bookings/${bookingId}/history`);
  },

  getTickets: async (status = '', page = 1, size = 20): Promise<PaginatedResult<SupportTicket>> => {
    return $api.get('/staff/support/tickets', { params: { status, page, size } });
  },

  getTicketDetail: async (ticketId: string): Promise<any> => {
    return $api.get(`/staff/support/tickets/${ticketId}`);
  },

  updateTicketStatus: async (ticketId: string, status: string): Promise<void> => {
    return $api.patch(`/staff/support/tickets/${ticketId}/status`, { status });
  },

  replyTicket: async (ticketId: string, body: string): Promise<{ id: string }> => {
    return $api.post(`/staff/support/tickets/${ticketId}/messages`, { body });
  },

  assignTicket: async (ticketId: string, staffId?: string): Promise<void> => {
    return $api.post(`/staff/support/tickets/${ticketId}/assign`, { staff_id: staffId });
  },
};
