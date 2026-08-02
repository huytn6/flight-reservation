import React, { useEffect, useState } from 'react';
import { supportService, type SupportTicket, type SupportTicketDetail } from '@/services/support';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LifeBuoy, Plus, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

export const Support: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketDetail, setActiveTicketDetail] = useState<SupportTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // New ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('BOOKING');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);

  // Reply message
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await supportService.getMyTickets();
      setTickets(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await supportService.createTicket({ subject, category, message });
      toast.success('Support ticket created!');
      setSubject('');
      setMessage('');
      loadTickets();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectTicket = async (ticketId: string) => {
    try {
      const detail = await supportService.getTicketDetail(ticketId);
      setActiveTicketDetail(detail);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load ticket details');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketDetail || !replyBody.trim()) return;
    setSendingReply(true);
    try {
      await supportService.addMessage(activeTicketDetail.ticket.id, replyBody);
      toast.success('Message sent');
      setReplyBody('');
      handleSelectTicket(activeTicketDetail.ticket.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!activeTicketDetail) return;
    try {
      await supportService.closeTicket(activeTicketDetail.ticket.id);
      toast.success('Ticket closed');
      handleSelectTicket(activeTicketDetail.ticket.id);
      loadTickets();
    } catch (err: any) {
      toast.error(err.message || 'Failed to close ticket');
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-8 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
          <LifeBuoy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Support Desk</h1>
          <p className="text-xs text-slate-500">Get assistance from our staff for bookings, refunds, or general queries.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Create Form & List of Tickets */}
        <div className="flex flex-col gap-6">
          {/* Form */}
          <form onSubmit={handleCreateTicket} className="bg-white p-5 rounded-2xl border shadow-xs flex flex-col gap-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Submit New Support Ticket
            </h2>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Subject</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Need help with booking..." required className="text-xs" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-xs p-2 border rounded-xl bg-white">
                <option value="BOOKING">Booking & Itinerary</option>
                <option value="REFUND">Refund / Payment</option>
                <option value="BAGGAGE">Baggage & Extras</option>
                <option value="OTHER">Other Query</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Initial Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your question or issue in detail..." className="w-full text-xs p-2 border rounded-xl h-20" required />
            </div>
            <Button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl py-2">
              {creating ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </form>

          {/* List */}
          <div className="bg-white p-5 rounded-2xl border shadow-xs flex flex-col gap-3">
            <h2 className="text-base font-bold text-slate-900">Your Tickets</h2>
            {loading ? (
              <p className="text-xs text-slate-500">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="text-xs text-slate-500">No support tickets found.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTicket(t.id)}
                    className={`p-3 text-left rounded-xl border transition-all flex flex-col gap-1 ${
                      activeTicketDetail?.ticket.id === t.id ? 'bg-blue-50 border-blue-400' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">{t.subject}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'CLOSED' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(t.created_at).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ticket Chat Thread */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-md min-h-[500px] flex flex-col justify-between">
          {!activeTicketDetail ? (
            <div className="flex flex-col items-center justify-center my-auto text-slate-400 gap-2">
              <MessageSquare className="w-12 h-12" />
              <p className="text-sm font-semibold">Select a ticket from the left to view thread</p>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between gap-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{activeTicketDetail.ticket.subject}</h2>
                  <p className="text-xs text-slate-500">Category: {activeTicketDetail.ticket.category} • Status: <span className="font-bold text-blue-600">{activeTicketDetail.ticket.status}</span></p>
                </div>
                {activeTicketDetail.ticket.status !== 'CLOSED' && (
                  <Button onClick={handleCloseTicket} size="sm" variant="outline" className="text-slate-600 text-xs">
                    Close Ticket
                  </Button>
                )}
              </div>

              {/* Messages Thread */}
              <div className="flex flex-col gap-3 my-2 max-h-96 overflow-y-auto p-2 bg-slate-50 rounded-xl border">
                {activeTicketDetail.messages.map((m) => {
                  const isStaff = m.sender_type === 'STAFF';
                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-2xl max-w-[80%] text-xs flex flex-col gap-1 ${
                        isStaff ? 'bg-purple-100 text-purple-900 self-start' : 'bg-blue-600 text-white self-end'
                      }`}
                    >
                      <span className="font-bold text-[10px] opacity-80">{isStaff ? 'Support Staff' : 'You'}</span>
                      <p className="leading-relaxed">{m.body}</p>
                      <span className="text-[9px] opacity-60 text-right">{new Date(m.created_at).toLocaleTimeString()}</span>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              {activeTicketDetail.ticket.status !== 'CLOSED' ? (
                <form onSubmit={handleSendReply} className="flex gap-2 border-t pt-3">
                  <Input
                    placeholder="Type your message reply..."
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    className="text-xs rounded-xl flex-1"
                    required
                  />
                  <Button type="submit" disabled={sendingReply} className="bg-blue-600 hover:bg-blue-700 text-white gap-1 rounded-xl text-xs font-bold px-4">
                    <Send className="w-3.5 h-3.5" /> Send
                  </Button>
                </form>
              ) : (
                <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-500 text-center font-semibold">
                  This support ticket is closed.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
