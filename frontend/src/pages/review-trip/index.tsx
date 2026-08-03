import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { draftService, type PriceBreakdown, type AncillaryItem, type InsuranceOption } from '@/services/draft';
import { flightService } from '@/services/flight';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldCheck, Tag, ShoppingBag, Plus, ArrowRight, ArrowLeft } from 'lucide-react';

export const ReviewTrip: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedFlight = location.state?.flight;
  const passedFare = location.state?.fare;

  const [draftId, setDraftId] = useState<string | null>(searchParams.get('draft_id'));
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [ancillaries, setAncillaries] = useState<{ selected: AncillaryItem[]; available: AncillaryItem[] } | null>(null);
  const [insuranceOptions, setInsuranceOptions] = useState<InsuranceOption[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initOrLoadDraft();
  }, [draftId]);

  const initOrLoadDraft = async () => {
    setLoading(true);
    try {
      let currentId = draftId;
      if (!currentId) {
        let flightId = passedFlight?.id;
        let fareId = passedFare?.id || passedFlight?.fares?.[0]?.id;

        // If no passed flight state, search first available flight & fare from real backend API
        if (!flightId || !fareId) {
          const availableFlights = await flightService.searchFlights({ origin: 'SGN', destination: 'HAN' });
          const list = Array.isArray(availableFlights) ? availableFlights : availableFlights.outbound?.flights || (availableFlights as any).items || [];
          if (list.length > 0 && list[0].fares?.length > 0) {
            flightId = list[0].id;
            fareId = list[0].fares[0].id;
          }
        }

        if (!flightId || !fareId) {
          toast.error('Không tìm thấy chuyến bay khả dụng để xem lại');
          navigate('/');
          return;
        }

        const newDraft = await draftService.createDraft([
          { flight_id: flightId, fare_id: fareId },
        ]);
        currentId = newDraft.id;
        setDraftId(currentId);
      }

      const [breakdownRes, ancRes, insRes] = await Promise.all([
        draftService.getPriceBreakdown(currentId!),
        draftService.getAncillaries(currentId!).catch(() => ({ selected: [], available: [] })),
        draftService.getInsuranceOptions(currentId!).catch(() => []),
      ]);

      setBreakdown(breakdownRes);
      setAncillaries(ancRes);
      setInsuranceOptions(insRes || []);
    } catch (err: any) {
      toast.error(err.message || 'Tải thông tin hành trình thất bại');
    } finally {
      setLoading(false);
    }
  };

  const refreshBreakdown = async () => {
    if (!draftId) return;
    try {
      const [breakdownRes, ancRes] = await Promise.all([
        draftService.getPriceBreakdown(draftId),
        draftService.getAncillaries(draftId).catch(() => ({ selected: [], available: [] })),
      ]);
      setBreakdown(breakdownRes);
      setAncillaries(ancRes);
    } catch {
      // ignore
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftId || !couponCode.trim()) return;
    try {
      const res = await draftService.applyCoupon(draftId, couponCode);
      toast.success(`Đã áp dụng mã giảm giá ${res.code}! Tiết kiệm ${res.discount.toLocaleString('vi-VN')} VNĐ`);
      setCouponCode('');
      refreshBreakdown();
    } catch (err: any) {
      toast.error(err.message || 'Mã giảm giá không hợp lệ');
    }
  };

  const handleAddInsurance = async (code: string) => {
    if (!draftId) return;
    try {
      await draftService.addInsurance(draftId, code);
      toast.success('Đã thêm bảo hiểm chuyến bay');
      refreshBreakdown();
    } catch (err: any) {
      toast.error(err.message || 'Thêm bảo hiểm thất bại');
    }
  };

  const handleAddAncillary = async (ancillary: AncillaryItem) => {
    if (!draftId) return;
    try {
      await draftService.addAncillary(draftId, ancillary);
      toast.success('Đã thêm dịch vụ bổ sung');
      refreshBreakdown();
    } catch (err: any) {
      toast.error(err.message || 'Thêm dịch vụ thất bại');
    }
  };

  const handleProceedToCheckout = () => {
    if (!draftId) return;
    navigate(`/checkout?draft_id=${draftId}`);
  };

  if (loading) {
    return <div className="min-h-screen p-12 text-center text-slate-500 font-sans text-xs">Đang chuẩn bị thông tin chuyến đi...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-6 pb-24">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-6">
        
        {/* Navigation & Title */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Xem Lại Chuyến Đi & Dịch Vụ Mua Thêm</h1>
            <p className="text-xs text-slate-500 mt-0.5">Kiểm tra chi tiết hành trình, chọn gói bảo hiểm & mã giảm giá trước khi nhập thông tin hành khách.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-xs border-slate-200/80 text-slate-700 shadow-none cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Trở lại tìm chuyến bay
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Left Content (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Flight Summary */}
            <Card className="bg-white p-5 rounded-2xl border-0 shadow-none space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                Hành Trình Đã Chọn
              </h2>
              {passedFlight ? (
                <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-bold text-slate-900">{passedFlight.airline?.name || 'Vietnam Airlines'} ({passedFlight.flight_number})</span>
                    <p className="text-slate-500 mt-0.5">{passedFlight.departure_airport?.city} ➔ {passedFlight.arrival_airport?.city}</p>
                  </div>
                  <span className="font-mono text-slate-800 font-bold bg-white px-2.5 py-1 rounded border border-slate-200">
                    {passedFare?.fare_name || 'Hạng Phổ Thông'}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Chuyến bay đã được ghi nhận trong đơn hàng số #{draftId?.substring(0, 8)}.</p>
              )}
            </Card>

            {/* Insurance Options */}
            {insuranceOptions.length > 0 && (
              <Card className="bg-white p-5 rounded-2xl border-0 shadow-none space-y-4">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ShieldCheck className="w-4 h-4 text-[#0065eb]" /> Bảo Hiểm Du Lịch & Chuyến Bay
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {insuranceOptions.map((opt) => (
                    <div key={opt.code} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{opt.name}</span>
                        <p className="text-slate-500 text-[11px] mt-1">Phủ sóng: {opt.covers?.join(', ') || 'Chuyến bay & y tế'}</p>
                        <p className="font-mono text-[#0065eb] font-bold mt-2">{opt.price.toLocaleString('vi-VN')} VNĐ</p>
                      </div>
                      <Button
                        onClick={() => handleAddInsurance(opt.code)}
                        size="sm"
                        variant="outline"
                        className="w-full text-xs border-blue-200 text-[#0065eb] hover:bg-blue-50 cursor-pointer shadow-none h-8 mt-1 font-normal"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Thêm Bảo Hiểm
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Ancillaries */}
            {ancillaries?.available && ancillaries.available.length > 0 && (
              <Card className="bg-white p-5 rounded-2xl border-0 shadow-none space-y-4">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ShoppingBag className="w-4 h-4 text-[#0065eb]" /> Dịch Vụ Bổ Sung (Hành lý / Suất ăn)
                </h2>
                <div className="divide-y divide-slate-100">
                  {ancillaries.available.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-slate-500 text-[11px]">{item.ancillary_type || 'Dịch vụ nâng cao'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-800 font-semibold">{item.price.toLocaleString('vi-VN')} VNĐ</span>
                        <Button
                          onClick={() => handleAddAncillary(item)}
                          size="sm"
                          variant="outline"
                          className="text-xs border-slate-200 text-slate-700 shadow-none cursor-pointer h-7 px-2.5 font-normal"
                        >
                          + Thêm
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          </div>

          {/* Right Summary Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Coupon Code Input */}
            <Card className="bg-white p-5 rounded-2xl border-0 shadow-none space-y-3">
              <h2 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#0065eb]" /> Mã Giảm Giá (Coupon)
              </h2>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Nhập DEMO10 hoặc SAVE200"
                  className="text-xs h-9"
                />
                <Button type="submit" size="sm" className="bg-[#0065eb] text-white font-normal text-xs h-9 px-3 cursor-pointer shadow-none">
                  Áp dụng
                </Button>
              </form>
            </Card>

            {/* Breakdown Summary */}
            {breakdown && (
              <Card className="bg-white p-5 rounded-2xl border-0 shadow-none space-y-3.5 text-xs">
                <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">
                  Tóm Tắt Bảng Giá
                </h2>
                <div className="flex justify-between text-slate-600">
                  <span>Tổng tiền vé chuyến bay</span>
                  <span className="font-mono">{breakdown.fares_total.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                {breakdown.ancillary_total > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Dịch vụ & Bảo hiểm bổ sung</span>
                    <span className="font-mono">{breakdown.ancillary_total.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                )}
                {breakdown.coupon_discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Giảm giá mã ưu đãi</span>
                    <span className="font-mono">-{breakdown.coupon_discount.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Tổng tiền thanh toán</span>
                  <span className="text-[#0065eb] font-mono">{breakdown.grand_total.toLocaleString('vi-VN')} VNĐ</span>
                </div>

                <Button
                  onClick={handleProceedToCheckout}
                  size="sm"
                  className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs h-9.5 rounded-lg mt-3 cursor-pointer shadow-none flex items-center justify-center gap-1.5"
                >
                  Tiếp Tục Điền Thông Tin Hành Khách <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
