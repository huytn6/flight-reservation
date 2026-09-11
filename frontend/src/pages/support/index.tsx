import React, { useEffect, useState } from 'react';
import { supportService, type SupportTicket, type SupportTicketDetail } from '@/services/support';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  LifeBuoy,
  Plus,
  MessageSquare,
  Send,
  User,
  Headphones,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getTicketCategoryLabel } from '@/constants/status-mappings';

export const Support: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketDetail, setActiveTicketDetail] = useState<SupportTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // New ticket modal
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
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
      const list = res || [];
      setTickets(list);
      if (list.length > 0 && !activeTicketDetail) {
        handleSelectTicket(list[0].id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách yêu cầu hỗ trợ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung cần hỗ trợ');
      return;
    }
    setCreating(true);
    try {
      await supportService.createTicket({ subject, category, message });
      toast.success('Đã gửi yêu cầu hỗ trợ mới thành công!');
      setSubject('');
      setMessage('');
      setIsNewTicketOpen(false);
      loadTickets();
    } catch (err: any) {
      toast.error(err.message || 'Gửi yêu cầu hỗ trợ thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectTicket = async (ticketId: string) => {
    try {
      const detail = await supportService.getTicketDetail(ticketId);
      setActiveTicketDetail(detail);
    } catch (err: any) {
      toast.error(err.message || 'Không thể nạp chi tiết hội thoại');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketDetail || !replyBody.trim()) return;
    setSendingReply(true);
    try {
      await supportService.addMessage(activeTicketDetail.ticket.id, replyBody);
      toast.success('Đã gửi tin nhắn phản hồi');
      setReplyBody('');
      handleSelectTicket(activeTicketDetail.ticket.id);
    } catch (err: any) {
      toast.error(err.message || 'Gửi tin nhắn thất bại');
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!activeTicketDetail) return;
    try {
      await supportService.closeTicket(activeTicketDetail.ticket.id);
      toast.info('Đã đóng yêu cầu hỗ trợ');
      handleSelectTicket(activeTicketDetail.ticket.id);
      loadTickets();
    } catch (err: any) {
      toast.error(err.message || 'Không thể đóng yêu cầu');
    }
  };

  const getStatusBadge = (status: string) => {
    return <StatusBadge type="ticket" value={status} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0065eb] border border-blue-100 flex items-center justify-center font-semibold shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Trung Tâm Hỗ Trợ & Khách Hàng
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhận trợ giúp từ chuyên viên hỗ trợ về đặt vé, hoàn tiền, thay đổi hành trình hoặc thắc mắc dịch vụ.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsNewTicketOpen(true)}
            className="bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs h-9.5 px-4 rounded-xl cursor-pointer shadow-none flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Gửi Yêu Cầu Hỗ Trợ Mới
          </Button>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (4 cols): Ticket List */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Card className="bg-white p-4 rounded-2xl border-0 shadow-none flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Danh Sách Yêu Cầu ({tickets.length})
                </h2>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500">Đang nạp danh sách yêu cầu...</div>
              ) : tickets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl space-y-1">
                  <MessageSquare className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="font-semibold text-slate-700">Chưa có yêu cầu hỗ trợ nào</p>
                  <p className="text-[11px] text-slate-500">Nhấn "+ Gửi Yêu Cầu Hỗ Trợ Mới" để bắt đầu hội thoại.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[540px] overflow-y-auto pr-1">
                  {tickets.map((t) => {
                    const isSelected = activeTicketDetail?.ticket.id === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTicket(t.id)}
                        className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                          isSelected
                            ? 'bg-blue-50/80 border-[#0065eb] shadow-2xs'
                            : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-xs font-semibold leading-tight line-clamp-1 ${isSelected ? 'text-[#0065eb]' : 'text-slate-900'}`}>
                            {t.subject}
                          </span>
                          {getStatusBadge(t.status)}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <Tag className="w-3 h-3 text-slate-400" /> {getTicketCategoryLabel(t.category)}
                          </span>
                          <span>{new Date(t.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column (8 cols): Active Ticket Conversation Stream */}
          <div className="lg:col-span-8">
            <Card className="bg-white p-6 rounded-2xl border-0 shadow-none min-h-[580px] flex flex-col justify-between">
              {!activeTicketDetail ? (
                <div className="flex flex-col items-center justify-center my-auto text-slate-400 gap-2 p-12">
                  <MessageSquare className="w-12 h-12 text-slate-300 stroke-[1.5]" />
                  <p className="text-xs sm:text-sm font-medium text-slate-600">Chọn một yêu cầu hỗ trợ bên trái để xem cuộc trò chuyện</p>
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between gap-4">
                  
                  {/* Active Ticket Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] font-mono border-blue-200 text-[#0065eb] bg-blue-50">
                          {getTicketCategoryLabel(activeTicketDetail.ticket.category)}
                        </Badge>
                        {getStatusBadge(activeTicketDetail.ticket.status)}
                      </div>
                      <h2 className="text-base font-bold text-slate-900 tracking-tight">
                        {activeTicketDetail.ticket.subject}
                      </h2>
                    </div>

                    {activeTicketDetail.ticket.status !== 'CLOSED' && (
                      <Button
                        onClick={handleCloseTicket}
                        size="sm"
                        variant="outline"
                        className="text-slate-600 border-slate-200 text-xs font-normal h-8 rounded-lg cursor-pointer shadow-none"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Đóng Yêu Cầu Hỗ Trợ
                      </Button>
                    )}
                  </div>

                  {/* Messages Conversation Stream */}
                  <div className="flex flex-col gap-4 my-2 max-h-[380px] overflow-y-auto p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                    {activeTicketDetail.messages.map((m) => {
                      const isStaff = m.sender_role === 'STAFF';
                      return (
                        <div
                          key={m.id}
                          className={`flex gap-3 max-w-[85%] ${isStaff ? 'self-start' : 'self-end flex-row-reverse'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isStaff ? 'bg-indigo-600 text-white' : 'bg-[#0065eb] text-white'
                          }`}>
                            {isStaff ? <Headphones className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>

                          <div className={`p-3.5 rounded-2xl text-xs flex flex-col gap-1 shadow-2xs ${
                            isStaff
                              ? 'bg-white border border-slate-200/80 text-slate-800'
                              : 'bg-[#0065eb] text-white'
                          }`}>
                            <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-1 mb-0.5">
                              <span className="font-bold text-[11px]">
                                {isStaff ? 'Chuyên Viên Hỗ Trợ' : 'Bạn'}
                              </span>
                              <span className="text-[10px] opacity-70">
                                {new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="leading-relaxed font-normal whitespace-pre-wrap">{m.body}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Input Form */}
                  {activeTicketDetail.ticket.status !== 'CLOSED' ? (
                    <form onSubmit={handleSendReply} className="flex gap-2 border-t border-slate-100 pt-3">
                      <Input
                        placeholder="Nhập nội dung phản hồi cho chuyên viên..."
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        className="text-xs rounded-xl flex-1 h-9 bg-slate-50"
                        required
                      />
                      <Button
                        type="submit"
                        disabled={sendingReply}
                        className="bg-[#0065eb] hover:bg-blue-700 text-white gap-1.5 rounded-xl text-xs font-normal px-5 h-9 cursor-pointer shadow-none"
                      >
                        <Send className="w-3.5 h-3.5" /> Gửi
                      </Button>
                    </form>
                  ) : (
                    <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-500 text-center font-medium">
                      Yêu cầu hỗ trợ này đã được hoàn tất và đóng lại.
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

        </div>

      </div>

      {/* New Support Ticket Modal */}
      {isNewTicketOpen && (
        <Dialog open onOpenChange={setIsNewTicketOpen}>
          <DialogContent className="sm:max-w-lg bg-white border-0 shadow-xl rounded-2xl p-6 font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0065eb]" /> Gửi Yêu Cầu Hỗ Trợ Mới
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Nhập tiêu đề và chi tiết thắc mắc để chuyên viên phản hồi nhanh nhất.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateTicket} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tiêu Đề Yêu Cầu</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ví dụ: Cần hỗ trợ đổi ngày bay đơn hàng..."
                  required
                  className="text-xs h-9 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Danh Mục Hỗ Trợ</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="text-xs h-9 bg-slate-50 border-slate-200 shadow-none cursor-pointer">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-xl">
                    <SelectItem value="BOOKING" className="text-xs cursor-pointer">Đặt vé & Lịch trình</SelectItem>
                    <SelectItem value="REFUND" className="text-xs cursor-pointer">Hoàn vé & Thanh toán</SelectItem>
                    <SelectItem value="BAGGAGE" className="text-xs cursor-pointer">Hành lý & Dịch vụ mua thêm</SelectItem>
                    <SelectItem value="OTHER" className="text-xs cursor-pointer">Thắc mắc khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Nội Dung Chi Tiết</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                  className="text-xs min-h-24 bg-slate-50"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="text-xs h-9 rounded-lg border-slate-200 font-normal cursor-pointer"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs h-9 px-5 rounded-lg cursor-pointer shadow-none"
                >
                  {creating ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};
