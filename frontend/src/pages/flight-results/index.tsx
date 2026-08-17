import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Info, Loader2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CompactTopSearchBar } from '@/components/flight-results/CompactTopSearchBar';
import { FlightFilterSidebar } from '@/components/flight-results/FlightFilterSidebar';
import { DatePriceMatrix } from '@/components/flight-results/DatePriceMatrix';
import { FlightCard, type FlightResultItem } from '@/components/flight-results/FlightCard';
import { SortDropdown } from '@/components/flight-results/SortDropdown';
import { FlightDetailDrawer } from '@/components/flight-results/FlightDetailDrawer';
import { flightService, type FlightOffer, type FareOption, type FareRule, type FareBaggage } from '@/services/flight';
import { useAuthStore } from '@/store/use-auth';
import { toast } from 'sonner';

// Helper to sanitize & format URL date parameters into strict YYYY-MM-DD
const sanitizeIsoDate = (inputStr: string | null, fallbackOffsetDays = 1): string => {
  if (!inputStr) {
    const d = new Date();
    d.setDate(d.getDate() + fallbackOffsetDays);
    return d.toISOString().split('T')[0];
  }
  // Exact YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(inputStr)) {
    return inputStr;
  }
  // Single/double digit day number like "12" or "19"
  const dayNum = parseInt(inputStr, 10);
  if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
    const d = new Date();
    d.setDate(dayNum);
    return d.toISOString().split('T')[0];
  }
  // Generic date string parsing
  const parsed = new Date(inputStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  const d = new Date();
  d.setDate(d.getDate() + fallbackOffsetDays);
  return d.toISOString().split('T')[0];
};

export const FlightResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Support both parameter formats (origin/leavingFrom, destination/goingTo, etc.)
  const origin = searchParams.get('origin') || searchParams.get('leavingFrom') || 'SGN';
  const destination = searchParams.get('destination') || searchParams.get('goingTo') || 'HAN';
  
  const rawDep = searchParams.get('departure_date') || searchParams.get('startDate');
  const rawRet = searchParams.get('return_date') || searchParams.get('endDate');

  const departureDate = sanitizeIsoDate(rawDep, 1);
  const returnDate = rawRet ? sanitizeIsoDate(rawRet, 5) : undefined;
  
  const tripParam = searchParams.get('trip_type') || searchParams.get('trip') || '';
  const tripType = tripParam.toUpperCase().includes('ROUND') || returnDate ? 'ROUND_TRIP' : 'ONE_WAY';

  const [sortOption, setSortOption] = useState('price');
  const [loading, setLoading] = useState(true);
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([]);

  // Selected item for drawer
  const [selectedFlight, setSelectedFlight] = useState<FlightResultItem | null>(null);
  const [selectedRawOffer, setSelectedRawOffer] = useState<FlightOffer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fare Comparison Modal State
  const [fareComparisonModal, setFareComparisonModal] = useState<FareOption[] | null>(null);
  const [fareRulesModal, setFareRulesModal] = useState<{ rules: FareRule[]; baggage: FareBaggage | null } | null>(null);

  // Saved flights
  const [savedFlightIds, setSavedFlightIds] = useState<string[]>([]);

  useEffect(() => {
    fetchFlights();
  }, [searchParams, sortOption]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSavedFlights();
    }
  }, [isAuthenticated]);

  const loadSavedFlights = async () => {
    try {
      const saved = await flightService.getSavedFlights();
      setSavedFlightIds(saved.map((s) => s.flight_id));
    } catch {
      // ignore
    }
  };

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const res = await flightService.searchFlights({
        trip_type: tripType as any,
        origin,
        destination,
        departure_date: departureDate,
        return_date: returnDate,
        sort: sortOption as any,
      });

      // Normalize flights list from backend real API response
      const rawList: FlightOffer[] = Array.isArray(res) 
        ? res 
        : res.outbound?.flights || res.legs?.[0]?.flights || (res as any).items || [];
      setFlightOffers(rawList);
    } catch (err: any) {
      toast.error(err.message || 'Tải danh sách chuyến bay thất bại');
      setFlightOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSaveFlight = async (flightId: string, e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu chuyến bay');
      navigate('/signin');
      return;
    }
    const isSaved = savedFlightIds.includes(flightId);
    try {
      if (isSaved) {
        const list = await flightService.getSavedFlights();
        const found = list.find((s) => s.flight_id === flightId);
        if (found) {
          await flightService.unsaveFlight(found.id);
          setSavedFlightIds((prev) => prev.filter((id) => id !== flightId));
          toast.success('Đã bỏ lưu chuyến bay');
        }
      } else {
        await flightService.saveFlight(flightId);
        setSavedFlightIds((prev) => [...prev, flightId]);
        toast.success('Đã lưu chuyến bay vào danh sách yêu thích!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi thao tác lưu chuyến bay');
    }
  };

  const handleOpenFareComparison = async (flightId: string, e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    try {
      const fares = await flightService.getFareComparison(flightId);
      setFareComparisonModal(fares);
    } catch (err: any) {
      toast.error(err.message || 'Tải thông tin các hạng vé thất bại');
    }
  };

  const handleOpenFareRules = async (fareId: string, e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    try {
      const [rules, baggage] = await Promise.all([
        flightService.getFareRules(fareId),
        flightService.getFareBaggage(fareId),
      ]);
      setFareRulesModal({ rules, baggage });
    } catch (err: any) {
      toast.error(err.message || 'Tải quy định vé thất bại');
    }
  };

  const handleFlightCardClick = (flight: FlightResultItem) => {
    const raw = flightOffers.find((f) => f.id === flight.id);
    setSelectedFlight(flight);
    setSelectedRawOffer(raw || null);
    setIsDrawerOpen(true);
  };

  const handleConfirmFare = (_flight: FlightResultItem) => {
    setIsDrawerOpen(false);
    if (selectedRawOffer) {
      const selectedFare = selectedRawOffer.fares?.[0];
      navigate('/review-trip', {
        state: {
          flight: selectedRawOffer,
          fare: selectedFare,
        },
      });
    } else {
      navigate('/review-trip');
    }
  };

  // Convert real API FlightOffer -> FlightResultItem
  const flightResultItems: FlightResultItem[] = flightOffers.map((f) => {
    const depTimeStr = f.departure_time ? new Date(f.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '08:30';
    const arrTimeStr = f.arrival_time ? new Date(f.arrival_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '10:45';
    const durationHours = Math.floor((f.duration_minutes || 120) / 60);
    const durationMins = (f.duration_minutes || 120) % 60;

    return {
      id: f.id,
      airline: f.airline?.name || 'Hãng hàng không',
      flightNumber: f.flight_number,
      departureTime: depTimeStr,
      arrivalTime: arrTimeStr,
      departureAirportCode: f.departure_airport?.iata_code || origin,
      arrivalAirportCode: f.arrival_airport?.iata_code || destination,
      departureCity: f.departure_airport?.city || origin,
      arrivalCity: f.arrival_airport?.city || destination,
      duration: `${durationHours}h ${durationMins}m`,
      stops: f.stops === 0 ? 'Bay thẳng' : `${f.stops} điểm dừng`,
      price: f.cheapest_total || 1500000,
      seatsLeftText: f.fares?.[0]?.available_seats ? `Còn ${f.fares[0].available_seats} ghế` : 'Còn ghế',
      roundtripLabel: 'Giá vé đã gồm thuế & phí',
    };
  });

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      <CompactTopSearchBar />

      <div className="max-w-[1240px] mx-auto px-4 md:px-8 mt-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <FlightFilterSidebar />

          <main className="flex-1 flex flex-col gap-4 min-w-0">
            <DatePriceMatrix />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-1">
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Chuyến Bay {origin} → {destination}
                </h1>
                <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
                  <span>Tìm thấy {flightOffers.length} chuyến bay phù hợp ({departureDate})</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              <div className="self-start sm:self-center">
                <SortDropdown selectedKey={sortOption} onSelectSort={setSortOption} />
              </div>
            </div>

            {loading ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#0065eb] mb-2" />
                <p className="text-xs text-slate-600 font-medium">Đang tìm kiếm chuyến bay tốt nhất cho bạn...</p>
              </div>
            ) : flightOffers.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center">
                <p className="text-base font-bold text-slate-800">Không tìm thấy chuyến bay phù hợp cho chặng bay này</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Vui lòng thử chọn ngày bay hoặc sân bay khác.</p>
                <Button onClick={() => navigate('/')} className="bg-[#0065eb] text-white text-xs font-normal rounded-lg px-5 shadow-none">
                  Tìm kiếm chuyến bay khác
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {flightResultItems.map((item) => (
                  <FlightCard
                    key={item.id}
                    flight={item}
                    isSelected={selectedFlight?.id === item.id}
                    onSelect={handleFlightCardClick}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Fare Comparison Modal using shadcn Dialog */}
      <Dialog open={Boolean(fareComparisonModal)} onOpenChange={(open) => !open && setFareComparisonModal(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>So Sánh Các Hạng Vé</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về tiện ích và quyền lợi của từng gói hạng vé
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            {fareComparisonModal?.map((fare) => (
              <div key={fare.id} className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-800">{fare.fare_name}</span>
                  <span className="text-xs font-medium text-[#0065eb] border border-blue-100 bg-blue-50/50 px-2 py-0.5 rounded-md">
                    {fare.cabin_name || 'Phổ thông'}
                  </span>
                </div>
                <p className="text-lg font-bold text-slate-900 font-mono">
                  {(fare.base_price + fare.tax + fare.fees).toLocaleString('vi-VN')} VNĐ
                </p>
                <div className="text-xs text-slate-600 space-y-1.5 mt-2 border-t border-slate-100 pt-2">
                  <p>Hành lý ký gửi: {fare.baggage_kg || 20} kg, xách tay: {fare.carry_on_kg || 7} kg</p>
                  <p>Hoàn vé: {fare.is_refundable ? 'Có hỗ trợ' : 'Không hỗ trợ'}</p>
                  <p>Đổi vé: {fare.is_changeable ? `Có hỗ trợ (phí ${fare.change_fee?.toLocaleString('vi-VN')} VNĐ)` : 'Không hỗ trợ'}</p>
                  <p>Số ghế còn lại: {fare.available_seats} ghế</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setFareComparisonModal(null)} className="bg-[#0065eb] text-white text-xs font-normal rounded-lg px-5 shadow-none">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fare Rules Modal using shadcn Dialog */}
      <Dialog open={Boolean(fareRulesModal)} onOpenChange={(open) => !open && setFareRulesModal(null)}>
        <DialogContent className="sm:max-w-lg bg-white border border-slate-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>Quy Định Vé & Tiêu Chuẩn Hành Lý</DialogTitle>
            <DialogDescription>
              Chi tiết quy định áp dụng cho gói vé đã chọn
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {fareRulesModal?.baggage && (
              <div className="p-3.5 border border-slate-200 rounded-xl text-xs space-y-1.5 bg-white">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Briefcase className="w-4 h-4 text-[#0065eb]" />
                  <span>Tiêu chuẩn hành lý miễn cước:</span>
                </div>
                <p className="pl-6 text-slate-600">Hành lý ký gửi: {fareRulesModal.baggage.checked_baggage_kg} kg</p>
                <p className="pl-6 text-slate-600">Hành lý xách tay: {fareRulesModal.baggage.carry_on_kg} kg</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700">Điều khoản sử dụng vé:</p>
              {fareRulesModal?.rules && fareRulesModal.rules.length > 0 ? (
                fareRulesModal.rules.map((r, i) => (
                  <div key={i} className="text-xs p-2.5 border border-slate-100 rounded-lg bg-white">
                    <span className="font-semibold text-slate-800 uppercase">{r.rule_type}: </span>
                    <span className="text-slate-600">{r.description}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">Áp dụng theo điều kiện biểu giá tiêu chuẩn của hãng vận chuyển.</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setFareRulesModal(null)} className="bg-[#0065eb] text-white text-xs font-normal rounded-lg px-5 shadow-none">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flight Detail Drawer */}
      <FlightDetailDrawer
        isOpen={isDrawerOpen}
        flight={selectedFlight}
        onClose={() => setIsDrawerOpen(false)}
        onSelectFare={handleConfirmFare}
        onOpenFareComparison={() => selectedRawOffer && handleOpenFareComparison(selectedRawOffer.id)}
        onOpenFareRules={() => selectedRawOffer?.fares?.[0] && handleOpenFareRules(selectedRawOffer.fares[0].id)}
        onToggleSave={() => selectedRawOffer && handleToggleSaveFlight(selectedRawOffer.id)}
        isSaved={Boolean(selectedRawOffer && savedFlightIds.includes(selectedRawOffer.id))}
      />
    </div>
  );
};
