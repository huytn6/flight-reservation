import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getPaymentMethodLabel, getPassengerTypeLabel } from '@/constants/status-mappings';
import { User, Mail, Phone, XCircle, Plane } from 'lucide-react';
import { toast } from 'sonner';

export const BookingDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) loadBooking();
  }, [id]);

  const loadBooking = async () => {
    setLoading(true);
    try {
      if (id) {
        const res = await adminService.getBookingDetail(id);
        setData(res);
      }
    } catch (err: any) {
      toast.error(err.message || 'Tải thông tin đặt vé thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await adminService.cancelBooking(id, 'Hủy bởi quản trị viên hệ thống');
      toast.success('Đã hủy đặt vé thành công');
      loadBooking();
    } catch (err: any) {
      toast.error(err.message || 'Hủy đặt vé thất bại');
    } finally {
      setCancelling(false);
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Chưa cập nhật';
    try {
      return new Date(isoString).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Đang tải thông tin đặt vé...</div>;
  }

  if (!data?.booking) {
    return (
      <div className="p-8 text-center space-y-4 font-sans">
        <p className="text-sm text-slate-600">Không tìm thấy đơn đặt vé.</p>
        <Button size="sm" onClick={() => navigate('/admin/bookings')} className="text-xs font-normal">
          Quay lại danh sách đặt vé
        </Button>
      </div>
    );
  }

  const { booking, segments = [], passengers = [], seat_assignments = [], payments = [] } = data;

  const seatsForPassenger = (passengerId: string) => {
    const rows = seat_assignments.filter((sa: any) => sa.passenger_id === passengerId);
    if (rows.length === 0) return '—';
    return rows.map((r: any) => r.seat_number).join(', ');
  };

  return (
    <div className="w-full space-y-4 font-sans relative pb-12">
      <AdminPageHeader
        title={`Đặt Vé ${booking.pnr || booking.id?.substring(0, 8)}`}
        description="Thông tin hành trình, hành khách và lịch sử thanh toán của đơn đặt vé."
        backPath="/admin/bookings"
        breadcrumbs={[
          { label: 'Quản lý đặt vé', href: '/admin/bookings' },
          { label: booking.pnr ? `PNR ${booking.pnr}` : 'Chi tiết đặt vé' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (8 Cols): Journey, Passengers, Payments */}
        <div className="lg:col-span-8 space-y-4">

          {/* Flight Segments */}
          <Card className="bg-white border-0 shadow-none rounded-lg py-0">
            <CardHeader className="px-4 py-3 bg-white border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-900">
                Hành Trình Chuyến Bay
              </CardTitle>
              <span className="text-[11px] text-slate-400">{segments.length} chặng bay</span>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {segments.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Chưa có thông tin chặng bay.</p>
              )}
              {segments.map((seg: any, idx: number) => (
                <div key={seg.id || idx} className="bg-slate-50/70 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {segments.length > 1 ? `Chặng ${idx + 1} · ` : ''}
                      {seg.airline_name} · <span className="font-mono">{seg.flight_number}</span>
                    </span>
                    <StatusBadge type="flight" value={seg.flight_status} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{seg.departure_iata}</p>
                      <p className="text-xs text-slate-600 font-medium">{seg.departure_city}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{formatDateTime(seg.departure_time)}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1 max-w-[160px]">
                      <div className="w-full flex items-center gap-2">
                        <div className="h-0.5 flex-1 bg-slate-300 rounded-full" />
                        <Plane className="w-4 h-4 text-[#0065eb] shrink-0 rotate-90" />
                        <div className="h-0.5 flex-1 bg-slate-300 rounded-full" />
                      </div>
                    </div>

                    <div className="space-y-1 text-right">
                      <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{seg.arrival_iata}</p>
                      <p className="text-xs text-slate-600 font-medium">{seg.arrival_city}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{formatDateTime(seg.arrival_time)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Passengers */}
          <Card className="bg-white border-0 shadow-none rounded-lg py-0">
            <CardHeader className="px-4 py-3 bg-white border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-900">
                Danh Sách Hành Khách
              </CardTitle>
              <span className="text-[11px] text-slate-400">{passengers.length} khách</span>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] text-slate-500 pl-4">Họ và tên</TableHead>
                    <TableHead className="text-[11px] text-slate-500">Loại khách</TableHead>
                    <TableHead className="text-[11px] text-slate-500">Ngày sinh</TableHead>
                    <TableHead className="text-[11px] text-slate-500 text-right pr-4">Số ghế</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passengers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-xs text-slate-400 py-6">
                        Chưa có hành khách.
                      </TableCell>
                    </TableRow>
                  )}
                  {passengers.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs font-medium text-slate-900 pl-4">{p.full_name}</TableCell>
                      <TableCell className="text-xs text-slate-600">{getPassengerTypeLabel(p.passenger_type)}</TableCell>
                      <TableCell className="text-xs text-slate-600 font-mono">{p.date_of_birth || '—'}</TableCell>
                      <TableCell className="text-xs text-slate-900 font-mono font-semibold text-right pr-4">
                        {seatsForPassenger(p.id)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card className="bg-white border-0 shadow-none rounded-lg py-0">
            <CardHeader className="px-4 py-3 bg-white border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-900">
                Lịch Sử Thanh Toán
              </CardTitle>
              <span className="text-[11px] text-slate-400">{payments.length} giao dịch</span>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] text-slate-500 pl-4">Phương thức</TableHead>
                    <TableHead className="text-[11px] text-slate-500">Số tiền</TableHead>
                    <TableHead className="text-[11px] text-slate-500">Trạng thái</TableHead>
                    <TableHead className="text-[11px] text-slate-500 text-right pr-4">Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-xs text-slate-400 py-6">
                        Chưa có giao dịch thanh toán.
                      </TableCell>
                    </TableRow>
                  )}
                  {payments.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs text-slate-700 pl-4">{getPaymentMethodLabel(p.payment_method)}</TableCell>
                      <TableCell className="text-xs font-mono font-semibold text-slate-900">
                        {Number(p.amount || 0).toLocaleString('vi-VN')} VND
                      </TableCell>
                      <TableCell className="text-xs">
                        <StatusBadge type="payment" value={p.status} />
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono text-right pr-4">
                        {formatDateTime(p.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (4 Cols): Summary, Contact, Actions */}
        <div className="lg:col-span-4 space-y-4 sticky top-20">

          <Card className="bg-white border-0 shadow-none rounded-lg py-0">
            <CardHeader className="px-4 py-3 bg-white border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-900">
                Tổng Quan Đơn Đặt Vé
              </CardTitle>
              <StatusBadge type="booking" value={booking.status} />
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Mã đặt chỗ (PNR)</span>
                <span className="font-mono font-bold text-[#0065eb]">{booking.pnr || '—'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Tổng tiền thanh toán</span>
                <span className="font-mono font-bold text-slate-900">
                  {Number(booking.total_amount || 0).toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Ngày tạo đơn</span>
                <span className="font-mono text-slate-700">{formatDateTime(booking.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cập nhật gần nhất</span>
                <span className="font-mono text-slate-700">{formatDateTime(booking.updated_at)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-none rounded-lg py-0">
            <CardHeader className="px-4 py-3 bg-white border-b border-slate-100">
              <CardTitle className="text-xs font-semibold text-slate-900">
                Thông Tin Liên Hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-900">{booking.contact_name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-700 truncate">{booking.contact_email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-700">{booking.contact_phone || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-none rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-900">Thao Tác Quản Trị</p>
            {booking.status !== 'CANCELLED' ? (
              <Button
                variant="outline"
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="w-full h-8.5 text-xs font-normal text-red-600 border-red-200 hover:bg-red-50 rounded-md cursor-pointer shadow-none gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                {cancelling ? 'Đang hủy...' : 'Hủy đặt vé này'}
              </Button>
            ) : (
              <p className="text-[11px] text-slate-400">Đơn đặt vé này đã bị hủy.</p>
            )}
            <Button
              variant="outline"
              onClick={() => navigate('/admin/bookings')}
              className="w-full h-8.5 text-xs font-normal text-slate-700 border-slate-200/70 hover:bg-slate-50 rounded-md cursor-pointer shadow-none"
            >
              Quay lại danh sách đặt vé
            </Button>
          </Card>

        </div>
      </div>
    </div>
  );
};
