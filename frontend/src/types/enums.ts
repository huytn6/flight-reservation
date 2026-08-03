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
