import { $api } from '@/utils/$api';
import type { PaginatedResult } from '@/services/user';
import type { AuthUser } from '@/types/auth';

export const adminService = {
  // Users & Staff
  getCustomers: async (q = '', page = 1, size = 20): Promise<PaginatedResult<AuthUser>> => {
    return $api.get('/admin/customers', { params: { q, page, size } });
  },

  getCustomer: async (userId: string): Promise<AuthUser> => {
    return $api.get(`/admin/customers/${userId}`);
  },

  updateCustomerStatus: async (userId: string, status: string): Promise<void> => {
    return $api.patch(`/admin/customers/${userId}/status`, { status });
  },

  getStaff: async (page = 1, size = 20): Promise<PaginatedResult<AuthUser>> => {
    return $api.get('/admin/staff', { params: { page, size } });
  },

  createStaff: async (data: { email: string; password: string; full_name: string; role?: string }): Promise<{ id: string }> => {
    return $api.post('/admin/staff', data);
  },

  getStaffDetail: async (userId: string): Promise<AuthUser> => {
    return $api.get(`/admin/staff/${userId}`);
  },

  updateStaff: async (userId: string, data: Partial<AuthUser>): Promise<void> => {
    return $api.patch(`/admin/staff/${userId}`, data);
  },

  updateStaffRole: async (userId: string, role: string): Promise<void> => {
    return $api.put(`/admin/staff/${userId}/roles`, { role });
  },

  // Flight Catalog CRUD
  getAirports: async (): Promise<any[]> => {
    return $api.get('/admin/airports');
  },

  createAirport: async (data: any): Promise<{ id: string }> => {
    return $api.post('/admin/airports', data);
  },

  updateAirport: async (airportId: string, data: any): Promise<void> => {
    return $api.patch(`/admin/airports/${airportId}`, data);
  },

  deleteAirport: async (airportId: string): Promise<void> => {
    return $api.delete(`/admin/airports/${airportId}`);
  },

  getAirlines: async (): Promise<any[]> => {
    return $api.get('/admin/airlines');
  },

  createAirline: async (data: any): Promise<{ id: string }> => {
    return $api.post('/admin/airlines', data);
  },

  updateAirline: async (airlineId: string, data: any): Promise<void> => {
    return $api.patch(`/admin/airlines/${airlineId}`, data);
  },

  deleteAirline: async (airlineId: string): Promise<void> => {
    return $api.delete(`/admin/airlines/${airlineId}`);
  },

  getAircraftTypes: async (): Promise<any[]> => {
    return $api.get('/admin/aircraft-types');
  },

  createAircraftType: async (data: any): Promise<{ id: string }> => {
    return $api.post('/admin/aircraft-types', data);
  },

  updateAircraftType: async (atId: string, data: any): Promise<void> => {
    return $api.patch(`/admin/aircraft-types/${atId}`, data);
  },

  deleteAircraftType: async (atId: string): Promise<void> => {
    return $api.delete(`/admin/aircraft-types/${atId}`);
  },

  // Flights & Fares
  getFlights: async (date = '', page = 1, size = 20): Promise<PaginatedResult<any>> => {
    return $api.get('/admin/flights', { params: { date, page, size } });
  },

  createFlight: async (data: any): Promise<{ id: string }> => {
    return $api.post('/admin/flights', data);
  },

  updateFlight: async (flightId: string, data: any): Promise<void> => {
    return $api.patch(`/admin/flights/${flightId}`, data);
  },

  deleteFlight: async (flightId: string): Promise<void> => {
    return $api.delete(`/admin/flights/${flightId}`);
  },

  updateFlightStatus: async (flightId: string, status: string): Promise<void> => {
    return $api.patch(`/admin/flights/${flightId}/status`, { status });
  },

  getFares: async (flightId: string): Promise<any[]> => {
    return $api.get(`/admin/flights/${flightId}/fares`);
  },

  createFare: async (flightId: string, data: any): Promise<{ id: string }> => {
    return $api.post(`/admin/flights/${flightId}/fares`, data);
  },

  updateFare: async (fareId: string, data: any): Promise<void> => {
    return $api.patch(`/admin/fares/${fareId}`, data);
  },

  deleteFare: async (fareId: string): Promise<void> => {
    return $api.delete(`/admin/fares/${fareId}`);
  },

  getSeatMap: async (flightId: string): Promise<any> => {
    return $api.get(`/admin/flights/${flightId}/seat-map`);
  },

  updateSeatMap: async (flightId: string, layout: any): Promise<void> => {
    return $api.put(`/admin/flights/${flightId}/seat-map`, { layout });
  },

  updateSeat: async (flightId: string, seatId: string, data: any): Promise<void> => {
    return $api.patch(`/admin/flights/${flightId}/seats/${seatId}`, data);
  },

  // Admin Bookings, Payments, Refunds
  getBookings: async (status = '', page = 1, size = 20): Promise<PaginatedResult<any>> => {
    return $api.get('/admin/bookings', { params: { status, page, size } });
  },

  getBookingDetail: async (bookingId: string): Promise<any> => {
    return $api.get(`/admin/bookings/${bookingId}`);
  },

  updateBookingStatus: async (bookingId: string, status: string, reason?: string): Promise<void> => {
    return $api.patch(`/admin/bookings/${bookingId}/status`, { status, reason });
  },

  cancelBooking: async (bookingId: string, reason?: string): Promise<void> => {
    return $api.post(`/admin/bookings/${bookingId}/cancel`, { reason });
  },

  getPayments: async (page = 1, size = 20): Promise<PaginatedResult<any>> => {
    return $api.get('/admin/payments', { params: { page, size } });
  },

  getPaymentDetail: async (paymentId: string): Promise<any> => {
    return $api.get(`/admin/payments/${paymentId}`);
  },

  updatePaymentStatus: async (paymentId: string, status: string): Promise<void> => {
    return $api.patch(`/admin/payments/${paymentId}/status`, { status });
  },

  getRefunds: async (page = 1, size = 20): Promise<PaginatedResult<any>> => {
    return $api.get('/admin/refunds', { params: { page, size } });
  },

  getRefundDetail: async (refundId: string): Promise<any> => {
    return $api.get(`/admin/refunds/${refundId}`);
  },

  updateRefundStatus: async (refundId: string, status: string): Promise<void> => {
    return $api.patch(`/admin/refunds/${refundId}`, { status });
  },

  // Coupons & CMS Contents
  getCoupons: async (): Promise<any[]> => {
    return $api.get('/admin/coupons');
  },

  createCoupon: async (data: any): Promise<{ id: string }> => {
    return $api.post('/admin/coupons', data);
  },

  getCouponDetail: async (couponId: string): Promise<any> => {
    return $api.get(`/admin/coupons/${couponId}`);
  },

  updateCoupon: async (couponId: string, data: any): Promise<void> => {
    return $api.patch(`/admin/coupons/${couponId}`, data);
  },

  deleteCoupon: async (couponId: string): Promise<void> => {
    return $api.delete(`/admin/coupons/${couponId}`);
  },

  getContents: async (): Promise<any[]> => {
    return $api.get('/admin/contents');
  },

  createContent: async (data: any): Promise<{ id: string }> => {
    return $api.post('/admin/contents', data);
  },

  getContentDetail: async (contentId: string): Promise<any> => {
    return $api.get(`/admin/contents/${contentId}`);
  },

  updateContent: async (contentId: string, data: any): Promise<void> => {
    return $api.patch(`/admin/contents/${contentId}`, data);
  },

  deleteContent: async (contentId: string): Promise<void> => {
    return $api.delete(`/admin/contents/${contentId}`);
  },

  // Dashboard & Audit Logs
  getDashboardSummary: async (): Promise<{ total_bookings: number; confirmed_bookings: number; total_revenue: number; total_customers: number; currency: string }> => {
    return $api.get('/admin/dashboard/summary');
  },

  getDashboardBookings: async (): Promise<any[]> => {
    return $api.get('/admin/dashboard/bookings');
  },

  getDashboardRevenue: async (): Promise<any[]> => {
    return $api.get('/admin/dashboard/revenue');
  },

  getDashboardFlights: async (): Promise<any[]> => {
    return $api.get('/admin/dashboard/flights');
  },

  getAuditLogs: async (resource = '', page = 1, size = 20): Promise<PaginatedResult<any>> => {
    return $api.get('/admin/audit-logs', { params: { resource, page, size } });
  },
};
