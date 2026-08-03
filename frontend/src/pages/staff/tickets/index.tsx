import React, { useEffect, useState } from 'react';
import { staffService } from '@/services/staff';
import type { SupportTicket } from '@/services/support';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Send, MessageSquare, UserCheck, Clock } from 'lucide-react';
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
      toast.error(err.message || 'Tải danh sách yêu cầu hỗ trợ thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (id: string) => {
    try {
      const detail = await staffService.getTicketDetail(id);
      setActiveTicketDetail(detail);
    } catch (err: any) {
      toast.error(err.message || 'Tải chi tiết yêu cầu hỗ trợ thất bại');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!activeTicketDetail) return;
    try {
      await staffService.updateTicketStatus(activeTicketDetail.ticket.id, newStatus);
      toast.success('Đã cập nhật trạng thái yêu cầu thành công');
      handleSelectTicket(activeTicketDetail.ticket.id);
      loadTickets();
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleAssignToSelf = async () => {
    if (!activeTicketDetail) return;
    try {
      await staffService.assignTicket(activeTicketDetail.ticket.id);
      toast.success('Đã tự phân công tiếp nhận yêu cầu này');
      handleSelectTicket(activeTicketDetail.ticket.id);
    } catch (err: any) {
      toast.error(err.message || 'Tiếp nhận yêu cầu thất bại');
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketDetail || !replyBody.trim()) return;
    setSendingReply(true);
    try {
      await staffService.replyTicket(activeTicketDetail.ticket.id, replyBody);
      toast.success('Đã gửi phản hồi cho khách hàng thành công');
      setReplyBody('');
      handleSelectTicket(activeTicketDetail.ticket.id);
    } catch (err: any) {
      toast.error(err.message || 'Gửi phản hồi thất bại');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Mới tạo';
      case 'IN_PROGRESS':
        return 'Đang xử lý';
      case 'WAITING_CUSTOMER':
        return 'Chờ khách phản hồi';
      case 'RESOLVED':
        return 'Đã giải quyết';
      case 'CLOSED':
        return 'Đã đóng';
      default:
        return status;
    }
  };

  return (
    <div className="w-full space-y-4 font-sans relative pb-12">
      {/* Enterprise Page Header */}
      <AdminPageHeader
        title="Quản Lý Hỗ Trợ Khách Hàng"
        description="Theo dõi, tiếp nhận và phản hồi giải đáp các yêu cầu hỗ trợ từ khách hàng."
        breadcrumbs={[
          { label: 'Hỗ trợ khách hàng' },
        ]}
      />

      {/* Filter Tabs */}
      <div className="flex bg-white p-1 rounded-lg border border-slate-200/60 w-fit gap-1 text-xs">
        {[
          { key: '', label: 'Tất cả' },
          { key: 'OPEN', label: 'Mới tạo' },
          { key: 'IN_PROGRESS', label: 'Đang xử lý' },
          { key: 'WAITING_CUSTOMER', label: 'Chờ phản hồi' },
          { key: 'RESOLVED', label: 'Đã giải quyết' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs font-normal ${
              statusFilter === tab.key
                ? 'bg-[#0065eb] text-white font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Column (4 Cols): Tickets List */}
        <div className="lg:col-span-4">
          <Card className="bg-white border-0 shadow-none rounded-lg py-0">
            <CardHeader className="px-4 py-3 bg-white border-b border-slate-100">
              <CardTitle className="text-xs font-semibold text-slate-900">
                Danh Sách Yêu Cầu ({tickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="p-4 text-xs text-slate-500">Đang tải danh sách yêu cầu...</p>
              ) : tickets.length === 0 ? (
                <p className="p-4 text-xs text-slate-500">Không có yêu cầu hỗ trợ nào.</p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTicket(t.id)}
                      className={`p-3.5 text-xs flex flex-col gap-1.5 cursor-pointer transition-colors ${
                        activeTicketDetail?.ticket.id === t.id
                          ? 'bg-blue-50/70 border-l-2 border-[#0065eb]'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 truncate">{t.subject}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                          {getStatusLabel(t.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(t.created_at).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (8 Cols): Reply Workspace */}
        <div className="lg:col-span-8">
          <Card className="bg-white border-0 shadow-none rounded-lg py-0 min-h-[550px] flex flex-col justify-between">
            {!activeTicketDetail ? (
              <div className="flex flex-col items-center justify-center my-auto p-12 text-slate-400 gap-2 text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-medium text-slate-600">
                  Vui lòng chọn một yêu cầu hỗ trợ từ danh sách bên trái để xem chi tiết và trao đổi với khách hàng
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between p-4 gap-4">
                
                {/* Header & Status Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      {activeTicketDetail.ticket.subject}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Mã khách hàng: {activeTicketDetail.ticket.user_id}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={handleAssignToSelf}
                      variant="outline"
                      className="text-xs font-normal border-slate-200/70 text-slate-700 hover:bg-slate-50 h-8 px-3 rounded-md cursor-pointer shadow-none flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      Tự tiếp nhận
                    </Button>

                    <select
                      value={activeTicketDetail.ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="text-xs font-medium p-1.5 border border-blue-200 rounded-md bg-blue-50 text-[#0065eb] cursor-pointer focus:outline-none"
                    >
                      <option value="OPEN">Mới tạo (OPEN)</option>
                      <option value="IN_PROGRESS">Đang xử lý (IN_PROGRESS)</option>
                      <option value="WAITING_CUSTOMER">Chờ khách phản hồi (WAITING)</option>
                      <option value="RESOLVED">Đã giải quyết (RESOLVED)</option>
                      <option value="CLOSED">Đã đóng (CLOSED)</option>
                    </select>
                  </div>
                </div>

                {/* Messages Thread */}
                <div className="flex flex-col gap-3 my-2 max-h-[380px] overflow-y-auto p-4 bg-slate-50/70 rounded-lg border-0">
                  {activeTicketDetail.messages?.map((m: any) => {
                    const isStaff = m.sender_type === 'STAFF';
                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-lg max-w-[80%] text-xs flex flex-col gap-1 ${
                          isStaff
                            ? 'bg-[#0065eb] text-white self-end'
                            : 'bg-white text-slate-900 border border-slate-100 self-start'
                        }`}
                      >
                        <span className="font-semibold text-[10px] opacity-85">
                          {isStaff ? 'Nhân viên hỗ trợ (Bạn)' : 'Khách hàng'}
                        </span>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.body}</p>
                        <span className="text-[9px] opacity-65 text-right font-mono">
                          {new Date(m.created_at).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleReplySubmit} className="flex gap-2 items-center pt-2">
                  <Input
                    placeholder="Nhập nội dung phản hồi cho khách hàng..."
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    className="text-xs h-9 bg-white border-slate-200/60 shadow-none focus:border-[#0065eb]"
                  />
                  <Button
                    type="submit"
                    disabled={sendingReply || !replyBody.trim()}
                    className="bg-[#0065eb] hover:bg-blue-700 text-white h-9 text-xs font-normal px-4 rounded-md cursor-pointer shrink-0 shadow-none flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Gửi phản hồi
                  </Button>
                </form>

              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};
