import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { MapPin, ArrowLeftRight, Building2 } from 'lucide-react';
import { useFlightSearch } from '@/hooks/use-flight-search';
import { catalogService } from '@/services/catalog';
import type { Airport } from '@/types/airport';
import { DateRangePickerPopover } from '@/components/flight/DateRangePickerPopover';
import { PassengerSelectorPopover } from '@/components/flight/PassengerSelectorPopover';

export const CompactTopSearchBar: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    flightType,
    setFlightType,
    leavingFrom,
    setLeavingFrom,
    goingTo,
    setGoingTo,
    dateRange,
    setDateRange,
    passengers,
    updateAdults,
    updateChildren,
    updateInfantsLap,
    updateInfantsSeat,
    setCabinClass,
    handleSwap,
  } = useFlightSearch();

  const [leavingOpen, setLeavingOpen] = useState(false);
  const [goingOpen, setGoingOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [travelersOpen, setTravelersOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);

  useEffect(() => {
    catalogService.getAirports().then((res) => {
      const items = res.items || (Array.isArray(res) ? res : []);
      if (items.length > 0) {
        setAirports(
          items.map((ap: any) => ({
            code: ap.code || ap.iata_code,
            city: ap.city,
            name: ap.name,
            sublabel: `${ap.name}, ${ap.country || ''}`,
          }))
        );
      }
    }).catch(() => {});
  }, []);

  // Sync state from URL query params when page loads or URL changes
  useEffect(() => {
    const originCode = searchParams.get('origin') || searchParams.get('leavingFrom');
    const originCity = searchParams.get('leavingFromCity');
    const destCode = searchParams.get('destination') || searchParams.get('goingTo');
    const destCity = searchParams.get('goingToCity');
    const startD = searchParams.get('startDate');
    const endD = searchParams.get('endDate');
    const trip = searchParams.get('trip') || searchParams.get('trip_type');
    const cabin = searchParams.get('cabinClass');

    if (trip) {
      if (trip.toLowerCase().includes('one')) setFlightType('one-way');
      else setFlightType('roundtrip');
    }

    if (originCode) {
      setLeavingFrom({
        code: originCode,
        city: originCity || originCode,
        name: `Sân bay ${originCity || originCode}`,
        sublabel: `${originCode}, Việt Nam`,
      });
    }
    if (destCode) {
      setGoingTo({
        code: destCode,
        city: destCity || destCode,
        name: `Sân bay ${destCity || destCode}`,
        sublabel: `${destCode}, Việt Nam`,
      });
    }
    if (startD && endD) {
      setDateRange({
        ...dateRange,
        startDate: startD,
        endDate: endD,
      });
    }
    if (cabin) {
      setCabinClass(cabin);
    }
  }, [searchParams]);

  const handleSearchSubmit = () => {
    const queryParams = new URLSearchParams({
      trip: flightType,
      leavingFrom: leavingFrom?.code || 'SGN',
      leavingFromCity: leavingFrom?.city || 'Thành phố Hồ Chí Minh',
      goingTo: goingTo?.code || 'HAN',
      goingToCity: goingTo?.city || 'Hà Nội',
      startDate: dateRange.startDate.toString(),
      adults: passengers.adults.toString(),
      children: passengers.children.toString(),
      cabinClass: passengers.cabinClass,
    });
    if (flightType === 'roundtrip') {
      queryParams.set('endDate', dateRange.endDate.toString());
    }

    navigate(`/Flights-Search?${queryParams.toString()}`);
  };

  const filteredAirports = airports.filter(
    (a) =>
      a.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border-b border-slate-100 pt-4 pb-3 font-sans">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-3">
        
        {/* Flight Type Sub-tabs (Một Chiều / Khứ Hồi) */}
        <div className="flex items-center gap-6 border-b border-slate-100 pb-2 text-sm sm:text-base font-normal">
          <button
            onClick={() => setFlightType('one-way')}
            className={`pb-2 transition-all cursor-pointer ${
              flightType === 'one-way'
                ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 font-normal'
            }`}
          >
            Một Chiều
          </button>
          <button
            onClick={() => setFlightType('roundtrip')}
            className={`pb-2 transition-all cursor-pointer ${
              flightType === 'roundtrip'
                ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 font-normal'
            }`}
          >
            Khứ Hồi
          </button>
        </div>

        {/* Compact Form Inputs Row */}
        <div className="flex flex-col lg:flex-row items-center gap-2">
          
          {/* Origin & Destination pair */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:flex-[2] relative">
            
            {/* Điểm khởi hành */}
            <Popover open={leavingOpen} onOpenChange={setLeavingOpen}>
              <PopoverTrigger asChild className="w-full flex-1">
                <div className="w-full border border-slate-300 rounded-xl px-3 py-1.5 flex items-center gap-2 bg-white hover:border-slate-500 cursor-pointer h-[48px]">
                  <MapPin className="w-4 h-4 text-slate-700 shrink-0" />
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[10px] font-medium text-slate-500 leading-tight">Điểm khởi hành</span>
                    <span className="text-xs font-semibold text-slate-900 truncate whitespace-nowrap">
                      {leavingFrom ? `${leavingFrom.city} (${leavingFrom.code})` : 'Thành phố Hồ Chí Minh (SGN)'}
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-[360px] bg-white rounded-xl shadow-lg border border-slate-200 p-0 overflow-hidden" align="start">
                <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                  <Input 
                    placeholder="Tìm sân bay..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {filteredAirports.map((ap) => (
                    <button
                      key={ap.code}
                      onClick={() => {
                        setLeavingFrom(ap);
                        setLeavingOpen(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer text-xs"
                    >
                      <Building2 className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{ap.city} ({ap.code})</span>
                        <span className="text-[10px] text-slate-500">{ap.sublabel}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Swap Button */}
            <Button 
              variant="outline"
              size="icon"
              onClick={handleSwap}
              className="w-7 h-7 rounded-full border border-slate-200 bg-white shadow-none flex items-center justify-center shrink-0 hover:bg-slate-50 transition-colors sm:-mx-3 z-10 cursor-pointer min-w-0 p-0"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-700" />
            </Button>

            {/* Điểm đến */}
            <Popover open={goingOpen} onOpenChange={setGoingOpen}>
              <PopoverTrigger asChild className="w-full flex-1">
                <div className="w-full border border-slate-300 rounded-xl px-3 py-1.5 flex items-center gap-2 bg-white hover:border-slate-500 cursor-pointer h-[48px]">
                  <MapPin className="w-4 h-4 text-slate-700 shrink-0" />
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[10px] font-medium text-slate-500 leading-tight">Điểm đến</span>
                    <span className="text-xs font-semibold text-slate-900 truncate whitespace-nowrap">
                      {goingTo ? `${goingTo.city} (${goingTo.code})` : 'Hà Nội (HAN)'}
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-[360px] bg-white rounded-xl shadow-lg border border-slate-200 p-0 overflow-hidden" align="start">
                <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                  <Input 
                    placeholder="Tìm sân bay..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {filteredAirports.map((ap) => (
                    <button
                      key={ap.code}
                      onClick={() => {
                        setGoingTo(ap);
                        setGoingOpen(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer text-xs"
                    >
                      <Building2 className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{ap.city} ({ap.code})</span>
                        <span className="text-[10px] text-gray-500">{ap.sublabel}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

          </div>

          {/* Interactive Dates Field using DateRangePickerPopover */}
          <div className="w-full lg:flex-1">
            <DateRangePickerPopover
              dateRange={dateRange}
              onChange={setDateRange}
              isOpen={dateOpen}
              onOpenChange={setDateOpen}
              singleDate={flightType === 'one-way'}
            />
          </div>

          {/* Interactive Travelers & Cabin Class Field using PassengerSelectorPopover */}
          <div className="w-full lg:flex-1">
            <PassengerSelectorPopover
              passengers={passengers}
              onUpdateAdults={updateAdults}
              onUpdateChildren={updateChildren}
              onUpdateInfantsLap={updateInfantsLap}
              onUpdateInfantsSeat={updateInfantsSeat}
              onSetCabinClass={setCabinClass}
              isOpen={travelersOpen}
              onOpenChange={setTravelersOpen}
            />
          </div>

          {/* Search Button */}
          <div className="w-full lg:w-auto shrink-0">
            <Button
              onClick={handleSearchSubmit}
              className="w-full lg:w-auto bg-[#0065eb] hover:bg-blue-700 text-white font-bold rounded-full px-7 h-[48px] text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              Tìm chuyến bay
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
};
