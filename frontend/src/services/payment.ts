import { $api } from '@/utils/$api';

export interface Payment {
  id: string;
  booking_id: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  payment_id: string;
  event_type: string;
  amount: number;
  response_payload?: string;
  created_at: string;
}

export const paymentService = {
  createPayment: async (bookingId: string, paymentMethod: string): Promise<Payment> => {
    return $api.post(`/bookings/${bookingId}/payments`, { payment_method: paymentMethod });
  },

  getPayment: async (paymentId: string): Promise<Payment> => {
    return $api.get(`/payments/${paymentId}`);
  },

  simulateSuccess: async (paymentId: string): Promise<Payment> => {
    return $api.post(`/payments/${paymentId}/simulate-success`);
  },

  simulateFailure: async (paymentId: string): Promise<Payment> => {
    return $api.post(`/payments/${paymentId}/simulate-failure`);
  },

  retryPayment: async (paymentId: string): Promise<Payment> => {
    return $api.post(`/payments/${paymentId}/retry`);
  },

  getTransactions: async (paymentId: string): Promise<PaymentTransaction[]> => {
    return $api.get(`/payments/${paymentId}/transactions`);
  },
};
