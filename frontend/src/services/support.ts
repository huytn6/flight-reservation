export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category?: string;
  booking_id?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  created_at: string;
}
