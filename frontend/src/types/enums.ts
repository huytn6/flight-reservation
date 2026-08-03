export const PaymentMethodEnum = {
  CARD: 'CARD',
  MOMO: 'MOMO',
  BANK_TRANSFER: 'BANK_TRANSFER',
} as const;
export type PaymentMethodEnum = (typeof PaymentMethodEnum)[keyof typeof PaymentMethodEnum];

export const PaymentStatusEnum = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;
export type PaymentStatusEnum = (typeof PaymentStatusEnum)[keyof typeof PaymentStatusEnum];

export const BookingStatusEnum = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
  CONFIRMED: 'CONFIRMED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;
export type BookingStatusEnum = (typeof BookingStatusEnum)[keyof typeof BookingStatusEnum];

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
} as const;
export type SeatStatusEnum = (typeof SeatStatusEnum)[keyof typeof SeatStatusEnum];

export const DraftStatusEnum = {
  ACTIVE: 'ACTIVE',
  CONVERTED: 'CONVERTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;
export type DraftStatusEnum = (typeof DraftStatusEnum)[keyof typeof DraftStatusEnum];
