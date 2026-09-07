import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { bookingService } from '@/services/booking';
import { Plane, Search, QrCode, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const CheckInPage: React.FC = () => {
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [boardingInfo, setBoardingInfo] = useState<{ seat_number: string | null; gate: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnr || !lastName) {
      toast.error('Vui lòng nhập Mã đặt chỗ (PNR) và Họ hành khách');
      return;
    }

    setLoading(true);
    try {
      const res = await bookingService.lookupBooking(pnr, lastName);
      if (res) {
        setBooking(res);
        setCheckedIn(false);
        toast.success('Tìm thấy thông tin vé cất cánh!');
      } else {
        toast.error('Không tìm thấy thông tin đặt chỗ phù hợp');
      }
    } catch (err: any) {
      toast.error(err.message || 'Tra cứu vé check-in thất bại');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!booking?.id) return;
    setCheckingIn(true);
    try {
      const result = await bookingService.confirmCheckIn(booking.id);
      setBoardingInfo({ seat_number: result.seat_number, gate: result.gate });
      setCheckedIn(true);
      toast.success(
        result.already_checked_in
          ? 'Vé này đã được làm thủ tục trực tuyến trước đó.'
          : 'Làm thủ tục trực tuyến thành công! Thẻ lên máy bay đã được khởi tạo.'
      );
    } catch (err: any) {
      toast.error(err.message || 'Không thể làm thủ tục check-in cho đặt chỗ này');
    } finally {
      setCheckingIn(false);
    }
  };

  const eligible = booking?.status === 'CONFIRMED';

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0065eb] text-xs font-semibold">
          <Plane className="w-3.5 h-3.5" />
          <span>Làm Thủ Tục Trực Tuyến 24h</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Check-in Chuyến Bay & Nhận Thẻ Lên Máy Bay
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Nhập mã đặt chỗ (PNR) và họ của hành khách để mở cổng làm thủ tục trước chuyến bay 24h.
        </p>
      </div>

      {/* Check-in Lookup Card */}
      <Card className="bg-white border-0 shadow-none rounded-xl p-4 sm:p-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
          <div className="sm:col-span-5 space-y-1">
            <Label htmlFor="pnr" className="text-xs font-medium text-slate-700">
              Mã Đặt Chỗ (PNR / Mã Vé) <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="pnr"
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              placeholder="VD: PNR12345"
              required
              className="uppercase font-mono text-xs h-9.5 border-slate-200/80 focus:border-[#0065eb]"
            />
          </div>

          <div className="sm:col-span-5 space-y-1">
            <Label htmlFor="lastName" className="text-xs font-medium text-slate-700">
              Họ Hành Khách <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="VD: NGUYEN"
              required
              className="text-xs h-9.5 border-slate-200/80 focus:border-[#0065eb]"
            />
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs h-9.5 rounded-lg shadow-none cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              Tra cứu
            </Button>
          </div>
        </form>
      </Card>

      {/* Result Booking Card */}
      {booking && (
        <Card className="bg-white border-0 shadow-none rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">MÃ ĐẶT CHỖ (PNR)</span>
              <p className="text-lg font-bold font-mono text-slate-900">{booking.pnr || pnr}</p>
            </div>
            {eligible ? (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Đủ Điều Kiện Check-in
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                Chưa Đủ Điều Kiện ({booking.status})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500">Chuyến bay:</span>
              <p className="font-mono font-bold text-slate-900">{booking.flight_number || 'VN210'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500">Hành trình:</span>
              <p className="font-bold text-slate-900">{booking.departure_city || 'Hồ Chí Minh'} → {booking.arrival_city || 'Hà Nội'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500">Thời gian cất cánh:</span>
              <p className="font-mono font-medium text-slate-900">
                {booking.departure_time ? new Date(booking.departure_time).toLocaleString('vi-VN') : '08:30 - Ngày mai'}
              </p>
            </div>
          </div>

          {checkedIn ? (
            /* Digital Boarding Pass Result */
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã Hoàn Tất Làm Thủ Tục Trực Tuyến</span>
                </div>
                <span className="text-xs font-mono text-slate-500">Ghế: {boardingInfo?.seat_number || 'Chưa gán'}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400">HÀNH KHÁCH</p>
                  <p className="text-sm font-bold text-slate-900">{booking.contact_full_name || lastName.toUpperCase()}</p>
                  <p className="text-xs text-slate-500">Cổng lên máy bay (Gate): <span className="font-bold text-slate-900">{boardingInfo?.gate || 'A04'}</span></p>
                </div>
                <div className="flex flex-col items-center gap-1 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6">
                  <QrCode className="w-24 h-24 text-slate-800" />
                  <span className="text-[10px] font-mono text-slate-400">Quét tại quầy an ninh</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <Button
                onClick={handleConfirmCheckIn}
                disabled={!eligible || checkingIn}
                className="w-full h-10 bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs rounded-lg cursor-pointer shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                {checkingIn ? 'Đang xử lý...' : 'Xác Nhận Check-in & Xuất Thẻ Lên Máy Bay'}
              </Button>
              {!eligible && (
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Chỉ đặt chỗ ở trạng thái đã xác nhận (CONFIRMED) mới có thể làm thủ tục trực tuyến.
                </p>
              )}
            </div>
          )}
        </Card>
      )}

    </div>
  );
};
