import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Info, Loader2, Heart, Scale, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompactTopSearchBar } from '@/components/flight-results/CompactTopSearchBar';
import { FlightFilterSidebar } from '@/components/flight-results/FlightFilterSidebar';
import { DatePriceMatrix } from '@/components/flight-results/DatePriceMatrix';
import { FlightCard, type FlightResultItem } from '@/components/flight-results/FlightCard';
import { SortDropdown } from '@/components/flight-results/SortDropdown';
import { FlightDetailDrawer } from '@/components/flight-results/FlightDetailDrawer';
import { flightService, type FlightOffer, type FareOption, type FareRule, type FareBaggage } from '@/services/flight';
import { useAuthStore } from '@/store/use-auth';
import { toast } from 'sonner';

export const FlightResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Support both parameter formats (origin/leavingFrom, destination/goingTo, etc.)
  const origin = searchParams.get('origin') || searchParams.get('leavingFrom') || 'SGN';
  const destination = searchParams.get('destination') || searchParams.get('goingTo') || 'HAN';
  const departureDate = searchParams.get('departure_date') || searchParams.get('startDate') || '';
  const returnDate = searchParams.get('return_date') || searchParams.get('endDate') || '';
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
        departure_date: departureDate || undefined,
        return_date: returnDate || undefined,
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

  const handleToggleSaveFlight = async (flightId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleOpenFareComparison = async (flightId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const fares = await flightService.getFareComparison(flightId);
      setFareComparisonModal(fares);
    } catch (err: any) {
      toast.error(err.message || 'Tải thông tin các hạng vé thất bại');
    }
  };

  const handleOpenFareRules = async (fareId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
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
                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mt-0.5">
                  <span>Tìm thấy {flightOffers.length} chuyến bay phù hợp</span>
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              <div className="self-start sm:self-center">
                <SortDropdown selectedKey={sortOption} onSelectSort={setSortOption} />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#0065eb] mb-3" />
                <p className="text-sm font-medium text-slate-600">Đang tìm kiếm chuyến bay thực tế từ hệ thống...</p>
              </div>
            ) : flightOffers.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border-0 shadow-none text-center flex flex-col items-center">
                <p className="text-base font-bold text-slate-800">Không tìm thấy chuyến bay phù hợp cho chặng bay này</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Vui lòng thử chọn ngày bay hoặc sân bay khác.</p>
                <Button onClick={() => navigate('/')} className="bg-[#0065eb] text-white font-normal text-xs rounded-lg px-5 shadow-none">
                  Tìm kiếm chuyến bay khác
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {flightResultItems.map((item, idx) => {
                  const rawOffer = flightOffers[idx];
                  const isSaved = savedFlightIds.includes(rawOffer.id);
                  const cheapestFare = rawOffer.fares?.[0];

                  return (
                    <div key={item.id} className="relative group">
                      <FlightCard
                        flight={item}
                        isSelected={selectedFlight?.id === item.id}
                        onSelect={handleFlightCardClick}
                      />

                      {/* Utility Action Overlay Bar */}
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-100/80 rounded-b-xl border-x border-b text-xs text-slate-600 font-normal -mt-1">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => handleOpenFareComparison(rawOffer.id, e)}
                            className="flex items-center gap-1 hover:text-[#0065eb] transition-colors cursor-pointer"
                          >
                            <Scale className="w-3.5 h-3.5" /> So sánh các hạng vé
                          </button>
                          {cheapestFare && (
                            <button
                              onClick={(e) => handleOpenFareRules(cheapestFare.id, e)}
                              className="flex items-center gap-1 hover:text-[#0065eb] transition-colors cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Quy định vé & Hành lý
                            </button>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleToggleSaveFlight(rawOffer.id, e)}
                          className={`flex items-center gap-1 font-normal transition-colors cursor-pointer ${
                            isSaved ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                          {isSaved ? 'Đã lưu' : 'Lưu chuyến bay'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Fare Comparison Modal */}
      {fareComparisonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto font-sans">
            <h2 className="text-base font-bold text-slate-900 mb-4">So Sánh Các Hạng Vé</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fareComparisonModal.map((fare) => (
                <div key={fare.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-800">{fare.fare_name}</span>
                    <span className="text-xs font-semibold text-[#0065eb] bg-blue-50 px-2 py-0.5 rounded-full">{fare.cabin_name || 'Phổ thông'}</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 font-mono">{(fare.base_price + fare.tax + fare.fees).toLocaleString('vi-VN')} VNĐ</p>
                  <div className="text-xs text-slate-600 space-y-1 mt-2">
                    <p>• Hành lý ký gửi: {fare.baggage_kg || 20} kg, xách tay {fare.carry_on_kg || 7} kg</p>
                    <p>• Cho phép hoàn vé: {fare.is_refundable ? 'Có' : 'Không'}</p>
                    <p>• Cho phép đổi vé: {fare.is_changeable ? `Có (phí ${fare.change_fee?.toLocaleString('vi-VN')} VNĐ)` : 'Không'}</p>
                    <p>• Số ghế còn lại: {fare.available_seats} ghế</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setFareComparisonModal(null)} className="bg-[#0065eb] text-white text-xs font-normal rounded-lg px-5 shadow-none">Đóng</Button>
            </div>
          </div>
        </div>
      )}

      {/* Fare Rules Modal */}
      {fareRulesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full font-sans">
            <h2 className="text-base font-bold text-slate-900 mb-4">Quy Định Vé & Tiêu Chuẩn Hành Lý</h2>
            {fareRulesModal.baggage && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
                <p className="font-bold">🧳 Tiêu chuẩn hành lý miễn cước:</p>
                <p>Hành lý ký gửi: {fareRulesModal.baggage.checked_baggage_kg} kg</p>
                <p>Hành lý xách tay: {fareRulesModal.baggage.carry_on_kg} kg</p>
              </div>
            )}
            <div className="space-y-2 mb-6">
              <p className="text-xs font-semibold text-slate-700">Điều khoản sử dụng vé:</p>
              {fareRulesModal.rules.map((r, i) => (
                <div key={i} className="text-xs p-2 bg-slate-100 rounded-lg">
                  <span className="font-semibold text-slate-800 uppercase">{r.rule_type}: </span>
                  <span className="text-slate-600">{r.description}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setFareRulesModal(null)} className="bg-[#0065eb] text-white text-xs font-normal rounded-lg px-5 shadow-none">Đóng</Button>
            </div>
          </div>
        </div>
      )}

      {/* Flight Detail Drawer */}
      <FlightDetailDrawer
        isOpen={isDrawerOpen}
        flight={selectedFlight}
        onClose={() => setIsDrawerOpen(false)}
        onSelectFare={handleConfirmFare}
      />
    </div>
  );
};
