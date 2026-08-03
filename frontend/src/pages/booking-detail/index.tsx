import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService, type BookingDetail as BookingDetailType, type ETicket } from '@/services/booking';
import { paymentService } from '@/services/payment';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/StatusBadge';
import { 
  Printer, 
  Mail, 
  ExternalLink, 
  AlertCircle, 
  RefreshCw, 
  XCircle, 
  FileText,
  ArrowLeft,
  QrCode
} from 'lucide-react';

export const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<BookingDetailType | null>(null);
  const [etickets, setEtickets] = useState<ETicket[]>([]);
  const [flightStatus, setFlightStatus] = useState<any>(null);
  const [checkInInfo, setCheckInInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retryingPayment, setRetryingPayment] = useState(false);

  useEffect(() => {
    if (id) loadBookingAll();
  }, [id]);

  const loadBookingAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [bDetail, tickets, statusRes] = await Promise.all([
        bookingService.getMyBookingDetail(id),
        bookingService.getETickets(id).catch(() => []),
        bookingService.getFlightStatus(id).catch(() => null),
      ]);

      setDetail(bDetail);
      setEtickets(tickets || []);
      setFlightStatus(statusRes);

      if (bDetail.booking.status === 'CONFIRMED') {
        bookingService.getCheckInLink(id).then(setCheckInInfo).catch(() => null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Tải thông tin chi tiết đơn hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!id) return;
    setRetryingPayment(true);
    try {
      const payRes = await paymentService.createPayment(id, 'CREDIT_CARD');
      if (payRes && payRes.id) {
        await paymentService.simulateSuccess(payRes.id);
      }
      toast.success('Thanh toán lại thành công! Vé đã được xác nhận.');
      loadBookingAll();
    } catch (err: any) {
      toast.error(err.message || 'Thanh toán lại thất bại');
    } finally {
      setRetryingPayment(false);
    }
  };

  const handleResendEmail = async () => {
    if (!id) return;
    try {
      await bookingService.resendConfirmation(id);
      toast.success('Đã gửi lại email xác nhận!');
    } catch (err: any) {
      toast.error(err.message || 'Gửi email xác nhận thất bại');
    }
  };

  const handleSendDocuments = async () => {
    if (!id) return;
    try {
      await bookingService.sendDocumentsEmail(id);
      toast.success('Đã gửi vé điện tử & lịch trình qua email của bạn!');
    } catch (err: any) {
      toast.error(err.message || 'Gửi tài liệu thất bại');
    }
  };

  const handleCancelBooking = async () => {
    if (!id) return;
    try {
      await bookingService.cancelBooking(id, 'Yêu cầu hủy từ người dùng');
      toast.success('Hủy vé thành công!');
      loadBookingAll();
    } catch (err: any) {
      toast.error(err.message || 'Chuyến bay không hỗ trợ hủy');
    }
  };

  if (loading) {
    return <div className="min-h-screen p-12 text-center text-slate-500 font-sans text-xs">Đang tải thông tin vé...</div>;
  }

  if (!detail) {
    return (
      <div className="min-h-screen p-12 text-center text-slate-500 font-sans text-xs space-y-4">
        <p>Không tìm thấy dữ liệu đặt vé.</p>
        <Button size="sm" onClick={() => navigate('/my-bookings')}>Quay lại danh sách vé</Button>
      </div>
    );
  }

  const { booking, segments, passengers } = detail;

  const totalAmount = Number(booking.total_amount || 0);
  const taxFee = Math.round(totalAmount * 0.1);
  const basePrice = totalAmount - taxFee;

  const getStatusBadge = (status: string) => {
    return <StatusBadge type="booking" value={status} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-6">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-5">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/my-bookings')}
            className="text-xs text-slate-600 hover:text-slate-900 border-slate-200/80 cursor-pointer shadow-none"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Trở về danh sách chuyến đi
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.print()}
              size="sm"
              variant="outline"
              className="text-xs border-slate-200/80 text-slate-700 cursor-pointer shadow-none flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              In Vé Điện Tử PDF
            </Button>
          </div>
        </div>

        {/* Top Control Header Card */}
        <Card className="bg-white p-5 sm:p-6 rounded-2xl border-0 shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs text-slate-500 font-medium">MÃ ĐẶT CHỖ (PNR):</span>
              <h1 className="text-xl font-bold font-mono text-slate-900 tracking-tight">{booking.pnr}</h1>
              {getStatusBadge(booking.status)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Liên hệ: <span className="font-semibold text-slate-800">{booking.contact_name}</span> ({booking.contact_email}) • Ngày đặt: {new Date(booking.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(booking.status === 'PENDING' || booking.status === 'PENDING_PAYMENT') && (
              <Button
                onClick={handleRetryPayment}
                disabled={retryingPayment}
                size="sm"
                className="bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs h-8.5 px-4 rounded-md cursor-pointer shadow-none flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {retryingPayment ? 'Đang xử lý...' : 'Thanh Toán Lại Ngay'}
              </Button>
            )}

            <Button onClick={handleResendEmail} size="sm" variant="outline" className="text-xs border-slate-200/80 text-slate-700 shadow-none cursor-pointer">
              <Mail className="w-3.5 h-3.5 mr-1" /> Gửi Lại Email
            </Button>

            <Button onClick={handleSendDocuments} size="sm" variant="outline" className="text-xs border-slate-200/80 text-slate-700 shadow-none cursor-pointer">
              <FileText className="w-3.5 h-3.5 mr-1" /> Gửi Vé Qua Email
            </Button>

            {booking.status === 'CONFIRMED' && (
              <Button onClick={handleCancelBooking} size="sm" variant="outline" className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 shadow-none cursor-pointer">
                <XCircle className="w-3.5 h-3.5 mr-1" /> Yêu Cầu Hủy Vé
              </Button>
            )}
          </div>
        </Card>

        {/* Flight Status Banner */}
        {flightStatus && (
          <div className="bg-blue-50/80 border border-blue-100 p-4 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="w-4 h-4 text-[#0065eb]" />
              <span className="font-semibold">Trạng thái bay thực tế:</span>
              <span>{flightStatus.status_label || 'Đang chuẩn bị khởi hành theo kế hoạch'}</span>
            </div>
            {checkInInfo?.check_in_url && (
              <a
                href="/check-in"
                className="text-[#0065eb] font-semibold flex items-center gap-1 hover:underline"
              >
                Làm thủ tục Check-in ngay <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Main Details (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Flight Segments */}
            <Card className="bg-white border-0 shadow-none rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Hành Trình Chuyến Bay
              </h2>
              {segments?.length > 0 ? (
                segments.map((seg: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-slate-50/70 rounded-lg text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 text-sm">{seg.flight_number || 'Chuyến bay'}</span>
                      <p className="text-slate-500">{seg.airline_name || 'Hãng hàng không'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-slate-900">{seg.departure_iata || '---'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {seg.departure_time ? new Date(seg.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa cập nhật'}
                        </p>
                      </div>
                      <span className="text-slate-400">➔</span>
                      <div>
                        <p className="font-bold text-slate-900">{seg.arrival_iata || '---'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {seg.arrival_time ? new Date(seg.arrival_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa cập nhật'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Thông tin hành trình đã được lưu hệ thống.</p>
              )}
            </Card>

            {/* Passengers & E-Tickets */}
            <Card className="bg-white border-0 shadow-none rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Danh Sách Hành Khách & Vé Điện Tử
              </h2>
              <div className="divide-y divide-slate-100">
                {passengers?.map((pax: any, idx: number) => (
                  <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{pax.full_name}</p>
                      <p className="text-slate-500 text-[11px]">Loại vé: {pax.type || pax.passenger_type || 'ADULT'} • Quốc tịch: {pax.nationality || 'VN'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded text-[11px]">
                        Số vé: {etickets[idx]?.ticket_number || `TK-${booking.pnr}-${idx + 1}`}
                      </span>
                      <QrCode className="w-6 h-6 text-slate-700" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Right Summary Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="bg-white border-0 shadow-none rounded-xl p-5 space-y-3.5 text-xs">
              <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Chi Tiết Thanh Toán
              </h2>
              <div className="flex justify-between text-slate-600">
                <span>Giá vé cơ bản</span>
                <span className="font-mono">{basePrice.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Thuế & Phí sân bay</span>
                <span className="font-mono">{taxFee.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Tổng tiền thanh toán</span>
                <span className="text-[#0065eb] font-mono">{totalAmount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
};
