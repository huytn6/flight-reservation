// ==========================================
// CENTRALIZED SYSTEM ENUMS (TypeScript erasable syntax compatible)
// ==========================================

export const UserRoleEnum = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;
export type UserRoleEnum = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];

export const UserStatusEnum = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED',
  BLOCKED: 'BLOCKED',
  SUSPENDED: 'SUSPENDED',
} as const;
export type UserStatusEnum = (typeof UserStatusEnum)[keyof typeof UserStatusEnum];

export const GenderEnum = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;
export type GenderEnum = (typeof GenderEnum)[keyof typeof GenderEnum];

export const CabinClassEnum = {
  ECONOMY: 'ECONOMY',
  PREMIUM_ECONOMY: 'PREMIUM_ECONOMY',
  BUSINESS: 'BUSINESS',
  FIRST: 'FIRST',
} as const;
export type CabinClassEnum = (typeof CabinClassEnum)[keyof typeof CabinClassEnum];

export const FlightStatusEnum = {
  SCHEDULED: 'SCHEDULED',
  DELAYED: 'DELAYED',
  CANCELLED: 'CANCELLED',
  IN_FLIGHT: 'IN_FLIGHT',
  LANDED: 'LANDED',
  COMPLETED: 'COMPLETED',
} as const;
export type FlightStatusEnum = (typeof FlightStatusEnum)[keyof typeof FlightStatusEnum];

export const BookingStatusEnum = {
  PENDING: 'PENDING',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
  CONFIRMED: 'CONFIRMED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;
export type BookingStatusEnum = (typeof BookingStatusEnum)[keyof typeof BookingStatusEnum];

export const PaymentStatusEnum = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatusEnum = (typeof PaymentStatusEnum)[keyof typeof PaymentStatusEnum];

export const PaymentMethodEnum = {
  CARD: 'CARD',
  MOMO: 'MOMO',
  BANK_TRANSFER: 'BANK_TRANSFER',
  VNPAY: 'VNPAY',
  PAYPAL: 'PAYPAL',
} as const;
export type PaymentMethodEnum = (typeof PaymentMethodEnum)[keyof typeof PaymentMethodEnum];

export const PassengerTypeEnum = {
  ADULT: 'ADULT',
  CHILD: 'CHILD',
  INFANT: 'INFANT',
} as const;
export type PassengerTypeEnum = (typeof PassengerTypeEnum)[keyof typeof PassengerTypeEnum];

export const SeatStatusEnum = {
  AVAILABLE: 'AVAILABLE',
  HELD: 'HELD',
  BOOKED: 'BOOKED',
  BLOCKED: 'BLOCKED',
  SELECTED: 'SELECTED',
} as const;
export type SeatStatusEnum = (typeof SeatStatusEnum)[keyof typeof SeatStatusEnum];

export const DraftStatusEnum = {
  ACTIVE: 'ACTIVE',
  CONVERTED: 'CONVERTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;
export type DraftStatusEnum = (typeof DraftStatusEnum)[keyof typeof DraftStatusEnum];

export const TicketStatusEnum = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_CUSTOMER: 'WAITING_CUSTOMER',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;
export type TicketStatusEnum = (typeof TicketStatusEnum)[keyof typeof TicketStatusEnum];

export const TicketCategoryEnum = {
  BOOKING: 'BOOKING',
  REFUND: 'REFUND',
  BAGGAGE: 'BAGGAGE',
  OTHER: 'OTHER',
} as const;
export type TicketCategoryEnum = (typeof TicketCategoryEnum)[keyof typeof TicketCategoryEnum];

export const CouponStatusEnum = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
} as const;
export type CouponStatusEnum = (typeof CouponStatusEnum)[keyof typeof CouponStatusEnum];

// Mirrors every `audit_repo.log(...)` action string emitted by the backend
// (auth/booking/payment services + admin/staff controllers).
export const AuditActionEnum = {
  CREATE_BOOKING: 'CREATE_BOOKING',
  CANCEL_BOOKING: 'CANCEL_BOOKING',
  CHANGE_SEAT: 'CHANGE_SEAT',
  CHANGE_FLIGHT: 'CHANGE_FLIGHT',
  REGISTER: 'REGISTER',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  CREATE_PAYMENT: 'CREATE_PAYMENT',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  UPDATE_STATUS: 'UPDATE_STATUS',
  CREATE_STAFF: 'CREATE_STAFF',
  CREATE_AIRPORT: 'CREATE_AIRPORT',
  UPDATE_AIRPORT: 'UPDATE_AIRPORT',
  DELETE_AIRPORT: 'DELETE_AIRPORT',
  CREATE_AIRLINE: 'CREATE_AIRLINE',
  UPDATE_AIRLINE: 'UPDATE_AIRLINE',
  DELETE_AIRLINE: 'DELETE_AIRLINE',
  CREATE_AIRCRAFT_TYPE: 'CREATE_AIRCRAFT_TYPE',
  UPDATE_AIRCRAFT_TYPE: 'UPDATE_AIRCRAFT_TYPE',
  DELETE_AIRCRAFT_TYPE: 'DELETE_AIRCRAFT_TYPE',
  CREATE_FLIGHT: 'CREATE_FLIGHT',
  UPDATE_FLIGHT: 'UPDATE_FLIGHT',
  CANCEL_FLIGHT: 'CANCEL_FLIGHT',
  UPDATE_BOOKING_STATUS: 'UPDATE_BOOKING_STATUS',
  UPDATE_PAYMENT_STATUS: 'UPDATE_PAYMENT_STATUS',
  UPDATE_REFUND_STATUS: 'UPDATE_REFUND_STATUS',
  CREATE_COUPON: 'CREATE_COUPON',
  UPDATE_COUPON: 'UPDATE_COUPON',
  DEACTIVATE_COUPON: 'DEACTIVATE_COUPON',
  CREATE_CONTENT: 'CREATE_CONTENT',
  UPDATE_CONTENT: 'UPDATE_CONTENT',
  DELETE_CONTENT: 'DELETE_CONTENT',
  UPDATE_CONTACT: 'UPDATE_CONTACT',
} as const;
export type AuditActionEnum = (typeof AuditActionEnum)[keyof typeof AuditActionEnum];

// Badge color group each AuditActionEnum action belongs to. Kept to the 3 standard
// CRUD-outcome colors (tạo mới/thành công, cập nhật, xóa/hủy/thất bại) plus one
// neutral fallback — not one color per action, to avoid a rainbow of badges.
export const AuditActionCategoryEnum = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  DEFAULT: 'DEFAULT',
} as const;
export type AuditActionCategoryEnum = (typeof AuditActionCategoryEnum)[keyof typeof AuditActionCategoryEnum];
