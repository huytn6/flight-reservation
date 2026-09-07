import { $api } from '@/utils/$api';

export interface AirlineReview {
  id: string;
  user_id: string;
  booking_id: string;
  airline_id: string;
  rating: number;
  title?: string;
  body?: string;
  created_at: string;
  reviewer_name?: string;
}

export const reviewService = {
  getAirlineReviews: async (airlineId: string): Promise<AirlineReview[]> => {
    return $api.get(`/airlines/${airlineId}/reviews`);
  },

  createReview: async (data: { booking_id: string; airline_id: string; rating: number; title?: string; body?: string }): Promise<AirlineReview> => {
    return $api.post(`/bookings/${data.booking_id}/reviews`, data);
  },

  updateReview: async (reviewId: string, data: Partial<AirlineReview>): Promise<void> => {
    return $api.patch(`/reviews/${reviewId}`, data);
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    return $api.delete(`/reviews/${reviewId}`);
  },

  reportReview: async (reviewId: string, reason: string): Promise<void> => {
    return $api.post(`/reviews/${reviewId}/reports`, { reason });
  },
};
