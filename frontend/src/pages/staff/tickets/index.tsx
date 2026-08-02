import React, { useEffect, useState } from 'react';
import { staffService } from '@/services/staff';
import type { SupportTicket } from '@/services/support';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LifeBuoy, UserPlus, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export const StaffTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTicketDetail, setActiveTicketDetail] = useState<any | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await staffService.getTickets(statusFilter);
      setTickets(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (id: string) => {
    try {
      const detail = await staffService.getTicketDetail(id);
      setActiveTicketDetail(detail);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load ticket details');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!activeTicketDetail) return;
    try {
      await staffService.updateTicketStatus(activeTicketDetail.ticket.id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      handleSelectTicket(activeTicketDetail.ticket.id);
      loadTickets();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleAssignToSelf = async () => {
    if (!activeTicketDetail) return;
    try {
      await staffService.assignTicket(activeTicketDetail.ticket.id);
      toast.success('Ticket assigned to you');
      handleSelectTicket(activeTicketDetail.ticket.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign ticket');
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketDetail || !replyBody.trim()) return;
    setSendingReply(true);
    try {
      await staffService.replyTicket(activeTicketDetail.ticket.id, replyBody);
      toast.success('Staff reply sent');
      setReplyBody('');
      handleSelectTicket(activeTicketDetail.ticket.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-purple-600" /> Support Desk Tickets
          </h1>
          <p className="text-xs text-slate-500">Manage, assign, and reply to customer support requests.</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border gap-1 text-xs font-semibold">
          {['', 'OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === st ? 'bg-purple-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Tickets List */}
        <div className="bg-white p-5 rounded-2xl border shadow-xs flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-900 border-b pb-2">Tickets List ({tickets.length})</h2>
          {loading ? (
            <p className="text-xs text-slate-500">Loading tickets...</p>
          ) : (
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t.id)}
                  className={`p-3 text-xs flex flex-col gap-1 cursor-pointer transition-colors ${
                    activeTicketDetail?.ticket.id === t.id ? 'bg-purple-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{t.subject}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">{t.status}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(t.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Reply & Controls Workspace */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-md min-h-[550px] flex flex-col justify-between">
          {!activeTicketDetail ? (
            <div className="flex flex-col items-center justify-center my-auto text-slate-400 gap-2">
              <MessageSquare className="w-12 h-12" />
              <p className="text-sm font-semibold">Select a support ticket to inspect and reply</p>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between gap-4">
              {/* Header & Status Changer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{activeTicketDetail.ticket.subject}</h2>
                  <p className="text-xs text-slate-500">Customer ID: {activeTicketDetail.ticket.user_id}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={handleAssignToSelf} size="sm" variant="outline" className="text-xs gap-1">
                    <UserPlus className="w-3.5 h-3.5" /> Assign Self
                  </Button>
                  <select
                    value={activeTicketDetail.ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-xs font-bold p-1.5 border rounded-xl bg-purple-50 text-purple-900"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="WAITING_CUSTOMER">WAITING_CUSTOMER</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex flex-col gap-3 my-2 max-h-96 overflow-y-auto p-3 bg-slate-50 rounded-xl border">
                {activeTicketDetail.messages?.map((m: any) => {
                  const isStaff = m.sender_type === 'STAFF';
                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-2xl max-w-[80%] text-xs flex flex-col gap-1 ${
                        isStaff ? 'bg-purple-600 text-white self-end' : 'bg-white text-slate-900 border self-start'
                      }`}
                    >
                      <span className="font-bold text-[10px] opacity-80">{isStaff ? 'Staff (You)' : 'Customer'}</span>
                      <p className="leading-relaxed">{m.body}</p>
                      <span className="text-[9px] opacity-60 text-right">{new Date(m.created_at).toLocaleTimeString()}</span>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleReplySubmit} className="flex gap-2 border-t pt-3">
                <Input
                  placeholder="Type staff reply to customer..."
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className="text-xs rounded-xl flex-1"
                  required
                />
                <Button type="submit" disabled={sendingReply} className="bg-purple-600 hover:bg-purple-700 text-white gap-1 rounded-xl text-xs font-bold px-4">
                  <Send className="w-3.5 h-3.5" /> Staff Reply
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
