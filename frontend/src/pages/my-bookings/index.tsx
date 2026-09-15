import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService, type Booking } from '@/services/booking';
import { BookingStatusEnum } from '@/types/enums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Ticket,
  Search,
  Plane,
  ChevronRight,
  CreditCard,
  UserCheck,
  Calendar,
  FileText,
} from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { StatusBadge } from '@/components/common/StatusBadge';

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings(statusFilter || undefined);
      setBookings(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách vé máy bay');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (b.pnr && b.pnr.toLowerCase().includes(q)) ||
      (b.contact_name && b.contact_name.toLowerCase().includes(q)) ||
      (b.contact_email && b.contact_email.toLowerCase().includes(q)) ||
      (b.id && b.id.toLowerCase().includes(q))
    );
  });

  const confirmedCount = bookings.filter((b) => b.status === BookingStatusEnum.CONFIRMED).length;
  const pendingCount = bookings.filter(
    (b) =>
      b.status === BookingStatusEnum.PENDING ||
      b.status === BookingStatusEnum.PENDING_PAYMENT ||
      b.status === BookingStatusEnum.PAYMENT_PROCESSING
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Ticket className="w-6 h-6 text-[#0065eb]" /> Quản Lý Chuyến Bay & Vé Máy Bay
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Xem lại lịch trình chuyến bay, quản lý vé điện tử E-ticket và cập nhật trạng thái đặt chỗ của bạn.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2 text-xs">
              <span className="text-slate-500">Tất cả:</span>
              <span className="font-bold text-slate-900 font-mono">{bookings.length} vé</span>
            </div>
            <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60 shadow-2xs flex items-center gap-2 text-xs text-emerald-800">
              <span>Đã xác nhận:</span>
              <span className="font-bold font-mono">{confirmedCount} vé</span>
            </div>
            {pendingCount > 0 && (
              <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60 shadow-2xs flex items-center gap-2 text-xs text-amber-800">
                <span>Chờ thanh toán:</span>
                <span className="font-bold font-mono">{pendingCount} vé</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <Card className="bg-white p-4 rounded-2xl border-0 shadow-none flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl overflow-x-auto">
            {[
              { key: '', label: 'Tất Cả' },
              { key: BookingStatusEnum.CONFIRMED, label: 'Đã Xác Nhận' },
              { key: BookingStatusEnum.PENDING_PAYMENT, label: 'Chờ Thanh Toán' },
              { key: BookingStatusEnum.CANCELLED, label: 'Chờ Hoàn Tiền' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.key
                    ? 'bg-white text-[#0065eb] shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo PNR, Tên khách, Email..."
              className="text-xs h-9 pl-9 bg-slate-50 border-slate-200 shadow-none focus-visible:bg-white"
            />
          </div>
        </Card>

        {/* Booking Cards List */}
        {loading ? (
          <LoadingState message="Đang nạp danh sách chuyến bay của bạn..." />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="Chưa tìm thấy đơn đặt vé nào"
            description={
              searchQuery
                ? `Không có chuyến bay nào khớp với từ khóa "${searchQuery}"`
                : 'Bạn chưa có chuyến bay nào trong danh sách này. Hãy sẵn sàng cho hành trình tiếp theo!'
            }
            actionLabel="Tìm Kiếm Chuyến Bay Mới"
            onAction={() => navigate('/flights-search')}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredBookings.map((booking) => {
              const isPending =
                booking.status === BookingStatusEnum.PENDING ||
                booking.status === BookingStatusEnum.PENDING_PAYMENT ||
                booking.status === BookingStatusEnum.PAYMENT_PROCESSING;

              const isConfirmed = booking.status === BookingStatusEnum.CONFIRMED;

              return (
                <Card
                  key={booking.id}
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                  className="bg-white p-5 rounded-2xl border-0 shadow-none hover:shadow-md transition-all cursor-pointer group flex flex-col gap-4"
                >
                  {/* Top Bar: PNR & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-[#0065eb] rounded-lg">
                        <Plane className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                        MÃ PNR: <strong className="text-slate-900 text-sm">{booking.pnr || 'ĐANG TẠO'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge type="booking" value={booking.status} customerView />
                    </div>
                  </div>

                  {/* Middle Content: Route & Passenger Info */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Passenger & Contact Info (7 cols) */}
                    <div className="md:col-span-7 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        <span>Người liên hệ: <strong className="text-slate-900">{booking.contact_name || 'Hành khách'}</strong></span>
                        {booking.contact_email && (
                          <span className="text-slate-500 font-normal">({booking.contact_email})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Ngày đặt: {new Date(booking.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</span>
                      </div>
                    </div>

                    {/* Price & Action Button (5 cols) */}
                    <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="text-[11px] text-slate-500 block">Tổng tiền thanh toán</span>
                        <span className="text-base font-mono font-bold text-[#0065eb]">
                          {Number(booking.total_amount || 0).toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/bookings/${booking.id}`);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-normal text-xs h-8 px-3 rounded-lg cursor-pointer shadow-none flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Thanh Toán Ngay
                          </Button>
                        ) : isConfirmed ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/bookings/${booking.id}`);
                            }}
                            className="border-blue-200 text-[#0065eb] hover:bg-blue-50 font-normal text-xs h-8 px-3 rounded-lg cursor-pointer shadow-none flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" /> Vé Điện Tử
                          </Button>
                        ) : null}

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-600 group-hover:text-[#0065eb] font-normal text-xs h-8 px-2 rounded-lg cursor-pointer flex items-center gap-0.5"
                        >
                          Chi tiết <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </div>
                    </div>

                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
