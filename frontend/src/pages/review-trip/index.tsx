import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  draftService,
  type PriceBreakdown,
  type AncillaryItem,
} from '@/services/draft';
import { flightService, type FlightOffer, type FareOption } from '@/services/flight';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

export const ReviewTrip: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Preferred: an array of legs [{flight, fare}, ...] — one item for one-way, two for round-trip.
  const passedLegs: Array<{ flight: FlightOffer; fare?: FareOption }> | undefined = location.state?.legs;
  // Back-compat: a single flight/fare passed directly (older navigation shape).
  const passedFlight = location.state?.flight || passedLegs?.[0]?.flight;
  const passedFare = location.state?.fare || passedLegs?.[0]?.fare;

  const [draftId, setDraftId] = useState<string | null>(searchParams.get('draft_id'));
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [ancillaries, setAncillaries] = useState<{
    selected: AncillaryItem[];
    available: AncillaryItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initOrLoadDraft();
  }, [draftId]);

  const initOrLoadDraft = async () => {
    setLoading(true);
    try {
      let currentId = draftId;
      if (!currentId) {
        let legItems: Array<{ flight_id: string; fare_id: string }> = (passedLegs || [])
          .filter((l) => l.flight?.id && (l.fare?.id || l.flight.fares?.[0]?.id))
          .map((l) => ({ flight_id: l.flight.id, fare_id: (l.fare?.id || l.flight.fares?.[0]?.id) as string }));

        // Back-compat: single flight/fare passed directly, no legs array
        if (legItems.length === 0 && passedFlight?.id) {
          const fareId = passedFare?.id || passedFlight?.fares?.[0]?.id;
          if (fareId) legItems = [{ flight_id: passedFlight.id, fare_id: fareId }];
        }

        // If nothing was passed at all, search first available flight & fare from real backend API
        if (legItems.length === 0) {
          const availableFlights = await flightService.searchFlights({
            origin: 'SGN',
            destination: 'HAN',
          });
          const list = Array.isArray(availableFlights)
            ? availableFlights
            : availableFlights.outbound?.flights || (availableFlights as any).items || [];
          if (list.length > 0 && list[0].fares?.length > 0) {
            legItems = [{ flight_id: list[0].id, fare_id: list[0].fares[0].id }];
          }
        }

        if (legItems.length === 0) {
          toast.error('Không tìm thấy chuyến bay khả dụng để xem lại');
          navigate('/');
          return;
        }

        const newDraft = await draftService.createDraft(legItems);
        currentId = newDraft.id;
        setDraftId(currentId);
      }

      const [breakdownRes, ancRes] = await Promise.all([
        draftService.getPriceBreakdown(currentId!),
        draftService.getAncillaries(currentId!).catch(() => ({ selected: [], available: [] })),
      ]);

      setBreakdown(breakdownRes);
      setAncillaries(ancRes);
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
    return (
      <div className="min-h-screen p-12 text-center text-slate-500 font-sans text-xs">
        Đang chuẩn bị thông tin chuyến đi...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-6 pb-24">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-6">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Xem Lại Chuyến Đi & Dịch Vụ Mua Thêm
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kiểm tra chi tiết hành trình và các dịch vụ bổ sung trước khi nhập thông tin hành khách.
            </p>
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
              {passedLegs && passedLegs.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {passedLegs.map((leg, idx) => {
                    const legFare = leg.fare || leg.flight.fares?.[0];
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl">
                        <div>
                          {passedLegs.length > 1 && (
                            <span className="inline-block text-[10px] font-bold text-[#0065eb] bg-blue-50 rounded px-1.5 py-0.5 mb-1">
                              {idx === 0 ? 'CHUYẾN ĐI' : 'CHUYẾN VỀ'}
                            </span>
                          )}
                          <p className="font-bold text-slate-900">
                            {leg.flight.airline?.name || 'Vietnam Airlines'} ({leg.flight.flight_number})
                          </p>
                          <p className="text-slate-500 mt-0.5">
                            {leg.flight.departure_airport?.city} → {leg.flight.arrival_airport?.city}
                            {leg.flight.departure_time ? ` · ${new Date(leg.flight.departure_time).toLocaleString('vi-VN')}` : ''}
                          </p>
                        </div>
                        <span className="font-mono text-slate-800 font-bold bg-white px-2.5 py-1 rounded border border-slate-200">
                          {legFare?.fare_name || 'Hạng Phổ Thông'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : passedFlight ? (
                <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-bold text-slate-900">
                      {passedFlight.airline?.name || 'Vietnam Airlines'} (
                      {passedFlight.flight_number})
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      {passedFlight.departure_airport?.city} → {passedFlight.arrival_airport?.city}
                    </p>
                  </div>
                  <span className="font-mono text-slate-800 font-bold bg-white px-2.5 py-1 rounded border border-slate-200">
                    {passedFare?.fare_name || 'Hạng Phổ Thông'}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Chuyến bay đã được ghi nhận trong đơn hàng số #{draftId?.substring(0, 8)}.
                </p>
              )}
            </Card>

            {/* Ancillaries */}
            {ancillaries?.available && ancillaries.available.length > 0 && (
              <Card className="bg-white p-5 rounded-2xl border-0 shadow-none space-y-4">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ShoppingBag className="w-4 h-4 text-[#0065eb]" /> Dịch Vụ Bổ Sung (Hành lý / Suất
                  ăn)
                </h2>
                <div className="divide-y divide-slate-100">
                  {ancillaries.available.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-slate-500 text-[11px]">
                          {item.ancillary_type || 'Dịch vụ nâng cao'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-800 font-semibold">
                          {item.price.toLocaleString('vi-VN')} VNĐ
                        </span>
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
            {/* Breakdown Summary */}
            {breakdown && (
              <Card className="bg-white p-5 rounded-2xl border-0 shadow-none space-y-3.5 text-xs">
                <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">
                  Tóm Tắt Bảng Giá
                </h2>
                <div className="flex justify-between text-slate-600">
                  <span>Tổng tiền vé chuyến bay</span>
                  <span className="font-mono">
                    {breakdown.fares_total.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                {breakdown.ancillary_total > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Dịch vụ & Bảo hiểm bổ sung</span>
                    <span className="font-mono">
                      {breakdown.ancillary_total.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                )}
                {breakdown.coupon_discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Giảm giá mã ưu đãi</span>
                    <span className="font-mono">
                      -{breakdown.coupon_discount.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Tổng tiền thanh toán</span>
                  <span className="text-[#0065eb] font-mono">
                    {breakdown.grand_total.toLocaleString('vi-VN')} VNĐ
                  </span>
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
