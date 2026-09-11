import { $api } from '@/utils/$api';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category?: string;
  booking_id?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  created_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: 'CUSTOMER' | 'STAFF';
  body: string;
  created_at: string;
}

export interface SupportTicketDetail {
  ticket: SupportTicket;
  messages: SupportMessage[];
}

export const supportService = {
  createTicket: async (data: { subject: string; category?: string; booking_id?: string; message?: string }): Promise<SupportTicket> => {
    return $api.post('/support/tickets', data);
  },

  getMyTickets: async (): Promise<SupportTicket[]> => {
    return $api.get('/users/me/support/tickets');
  },

  getTicketDetail: async (ticketId: string): Promise<SupportTicketDetail> => {
    return $api.get(`/users/me/support/tickets/${ticketId}`);
  },

  addMessage: async (ticketId: string, body: string): Promise<{ id: string }> => {
    return $api.post(`/users/me/support/tickets/${ticketId}/messages`, { body });
  },

  closeTicket: async (ticketId: string): Promise<void> => {
    return $api.post(`/users/me/support/tickets/${ticketId}/close`);
  },
};
