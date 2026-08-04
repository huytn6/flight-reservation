import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { draftService, type DraftContact, type DraftPassenger, type PriceBreakdown } from '@/services/draft';
import { userService } from '@/services/user';
import { bookingService } from '@/services/booking';
import { useAuthStore } from '@/store/use-auth';
import { SeatMapSelector } from '@/components/checkout/SeatMapSelector';
import { PaymentModal } from '@/components/checkout/PaymentModal';
import type { SavedPassenger } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserCheck, ShieldCheck, CalendarIcon } from 'lucide-react';

import { PassengerTypeEnum } from '@/types/enums';
import { DateOfBirthPicker } from '@/components/common/DateOfBirthPicker';

const NATIONALITY_OPTIONS = [
  { code: 'VN', label: 'Việt Nam (VN)' },
  { code: 'US', label: 'Hoa Kỳ (US)' },
  { code: 'JP', label: 'Nhật Bản (JP)' },
  { code: 'KR', label: 'Hàn Quốc (KR)' },
  { code: 'TH', label: 'Thái Lan (TH)' },
  { code: 'SG', label: 'Singapore (SG)' },
  { code: 'AU', label: 'Úc (AU)' },
  { code: 'GB', label: 'Vương Quốc Anh (GB)' },
  { code: 'FR', label: 'Pháp (FR)' },
  { code: 'DE', label: 'Đức (DE)' },
  { code: 'CA', label: 'Canada (CA)' },
  { code: 'CN', label: 'Trung Quốc (CN)' },
  { code: 'TW', label: 'Đài Loan (TW)' },
  { code: 'MY', label: 'Malaysia (MY)' },
  { code: 'ID', label: 'Indonesia (ID)' },
];

export const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const draftId = searchParams.get('draft_id') || '';

  // Form states
  const [contact, setContact] = useState<DraftContact>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
  });

  const [passengers, setPassengers] = useState<Partial<DraftPassenger>[]>([
    { passenger_index: 0, passenger_type: PassengerTypeEnum.ADULT, full_name: user?.full_name || '', nationality: 'VN' },
  ]);

  const [savedPassengers, setSavedPassengers] = useState<SavedPassenger[]>([]);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [flightId, setFlightId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Payment modal state
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!draftId) {
      toast.error('Không tìm thấy thông tin đơn hàng nháp');
      navigate('/');
      return;
    }
    loadData();
  }, [draftId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [draftData, summaryData] = await Promise.all([
        draftService.getDraft(draftId),
        draftService.getPriceBreakdown(draftId),
      ]);

      if (draftData.contact) setContact(draftData.contact);
      if (draftData.passengers && draftData.passengers.length > 0) {
        setPassengers(draftData.passengers);
      }
      setBreakdown(summaryData);

      if (draftData.draft?.flight_offer_json) {
        try {
          const offer = JSON.parse(draftData.draft.flight_offer_json);
          if (offer && offer.length > 0 && offer[0].flight_id) {
            setFlightId(offer[0].flight_id);
          }
        } catch {
          // ignore
        }
      }

      if (isAuthenticated) {
        const saved = await userService.getSavedPassengers();
        setSavedPassengers(saved || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Tải thông tin thanh toán thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillPassenger = (saved: SavedPassenger, index: number) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        full_name: saved.full_name,
        date_of_birth: saved.date_of_birth,
        nationality: saved.nationality || 'VN',
        passport_number: saved.passport_number,
        passport_expiry: saved.passport_expiry,
      };
      return next;
    });
    toast.info(`Đã tự động điền hành khách ${index + 1}: ${saved.full_name}`);
  };

  const handleAddPassengerInput = () => {
    setPassengers((prev) => [
      ...prev,
      { passenger_index: prev.length, passenger_type: PassengerTypeEnum.ADULT, full_name: '', nationality: 'VN' },
    ]);
  };

  const handleSaveContactAndPassengers = async () => {
    if (!contact.full_name || !contact.email || !contact.phone) {
      toast.error('Vui lòng nhập đầy đủ thông tin người liên hệ');
      return false;
    }
    for (const p of passengers) {
      if (!p.full_name) {
        toast.error('Vui lòng nhập họ tên cho tất cả hành khách');
        return false;
      }
    }
    try {
      await draftService.saveContact(draftId, contact);
      await draftService.savePassengers(draftId, passengers);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Lưu thông tin thất bại');
      return false;
    }
  };

  const handleCreateBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để hoàn tất đặt vé');
      navigate('/signin');
      return;
    }

    const savedOk = await handleSaveContactAndPassengers();
    if (!savedOk) return;

    setSubmitting(true);
    try {
      const bookingRes = await bookingService.createBooking(draftId);
      toast.success('Đã tạo đơn đặt vé! Đang mở cổng thanh toán...');
      setCreatedBookingId(bookingRes.id);
      setIsPaymentModalOpen(true);
    } catch (err: any) {
      const msg = err.message || '';
      if (
        msg.includes('active') ||
        msg.includes('expired') ||
        err.code === 'DRAFT_NOT_ACTIVE' ||
        err.code === 'DRAFT_EXPIRED'
      ) {
        toast.error('Đơn hàng nháp này đã hoàn tất đặt vé hoặc hết hạn. Đang chuyển về trang tìm kiếm...');
        setTimeout(() => navigate('/'), 1200);
      } else {
        toast.error(msg || 'Tạo đơn đặt vé thất bại');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen p-12 text-center text-slate-500 font-sans text-xs">Đang tải thông tin đặt vé...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-8">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-6">

        {/* Header */}
        <div className="border-b border-slate-200/80 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Thanh Toán & Thông Tin Hành Khách</h1>
          <p className="text-xs text-slate-500 mt-0.5">Hoàn tất thông tin hành khách để xác nhận giữ chỗ chuyến bay.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column (8 cols): 1. Interactive Seat Selection FIRST, 2. Contact Info, 3. Passenger Info */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* 1. Interactive Seat Selection Map (MOVED UP TO TOP) */}
            {flightId && (
              <SeatMapSelector
                draftId={draftId}
                segmentId={flightId}
                passengerCount={passengers.length}
                passengerNames={passengers.map((p) => p.full_name || '')}
                onSeatHoldsChange={() => {
                  draftService.getPriceBreakdown(draftId).then(setBreakdown);
                }}
              />
            )}

            {/* 2. Contact Information Form */}
            <Card className="bg-white p-6 rounded-2xl border-0 shadow-none flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <UserCheck className="w-4 h-4 text-[#0065eb]" /> Thông Tin Người Liên Hệ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Họ và Tên</label>
                  <Input value={contact.full_name} onChange={(e) => setContact({ ...contact, full_name: e.target.value })} required className="text-xs h-9" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Nhận Vé</label>
                  <Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} required className="text-xs h-9" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Số Điện Thoại</label>
                  <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="0901 234 567" required className="text-xs h-9" />
                </div>
              </div>
            </Card>

            {/* 3. Passenger Details Form */}
            <Card className="bg-white p-6 rounded-2xl border-0 shadow-none flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-sm font-semibold text-slate-900">Danh Sách Hành Khách</h2>
                <Button onClick={handleAddPassengerInput} size="sm" variant="outline" className="text-[#0065eb] border-blue-200 text-xs font-normal h-8 shadow-none">
                  + Thêm Hành Khách
                </Button>
              </div>

              {passengers.map((pax, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl flex flex-col gap-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Hành Khách {idx + 1} ({pax.passenger_type || 'ADULT'})</span>

                    {/* Saved passenger autofill options */}
                    {savedPassengers.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Điền nhanh:</span>
                        {savedPassengers.map((saved) => (
                          <button
                            key={saved.id}
                            type="button"
                            onClick={() => handleAutofillPassenger(saved, idx)}
                            className="px-2 py-0.5 bg-blue-100 text-[#0065eb] hover:bg-blue-200 rounded text-[11px] font-medium cursor-pointer"
                          >
                            {saved.full_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Họ tên (Như trên CCCD/Hộ chiếu)</label>
                      <Input
                        value={pax.full_name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPassengers((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], full_name: val };
                            return next;
                          });
                        }}
                        placeholder="NGUYEN VAN A"
                        required
                        className="text-xs h-9 bg-white"
                      />
                    </div>

                    {/* Date of Birth Picker */}
                    <DateOfBirthPicker
                      label="Ngày sinh"
                      value={pax.date_of_birth}
                      onChange={(iso) => {
                        setPassengers((prev) => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], date_of_birth: iso };
                          return next;
                        });
                      }}
                    />

                    {/* Nationality using shadcn Select */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Quốc tịch</label>
                      <Select
                        value={pax.nationality || 'VN'}
                        onValueChange={(val) => {
                          setPassengers((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], nationality: val };
                            return next;
                          });
                        }}
                      >
                        <SelectTrigger className="w-full text-xs h-9 bg-white border-slate-200 shadow-none cursor-pointer">
                          <SelectValue placeholder="Chọn quốc tịch" />
                        </SelectTrigger>
                        <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] bg-white border-slate-200 shadow-xl max-h-60 overflow-y-auto">
                          {NATIONALITY_OPTIONS.map((c) => (
                            <SelectItem key={c.code} value={c.code} className="text-xs cursor-pointer">
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Số Hộ chiếu / CCCD</label>
                      <Input
                        value={pax.passport_number || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPassengers((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], passport_number: val };
                            return next;
                          });
                        }}
                        placeholder="001200012345"
                        className="text-xs h-9 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Card>

          </div>

          {/* Right Summary Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border-0 shadow-none flex flex-col gap-4 sticky top-20">
            <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">Tóm Tắt Đơn Hàng</h2>

            {breakdown && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Giá vé cơ bản</span>
                  <span className="font-mono">{breakdown.fares_total.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                {breakdown.ancillary_total > 0 && (
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Chọn ghế & Dịch vụ mua thêm</span>
                    <span className="font-mono">+{breakdown.ancillary_total.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                )}
                {breakdown.coupon_discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Mã giảm giá áp dụng</span>
                    <span className="font-mono">-{breakdown.coupon_discount.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900">Tổng tiền thanh toán</span>
                  <span className="text-base font-mono font-bold text-[#0065eb]">{breakdown.grand_total.toLocaleString('vi-VN')} VNĐ</span>
                </div>

                <Button
                  onClick={handleCreateBooking}
                  disabled={submitting}
                  className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs h-9.5 rounded-lg mt-3 cursor-pointer shadow-none flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {submitting ? 'Đang khởi tạo đơn...' : 'Tạo Đặt Chỗ & Thanh Toán'}
                </Button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && createdBookingId && (
        <PaymentModal
          bookingId={createdBookingId}
          amount={breakdown?.grand_total || 0}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            navigate(`/bookings/${createdBookingId}`);
          }}
        />
      )}
    </div>
  );
};
