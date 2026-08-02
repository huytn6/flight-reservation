import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar as CalendarIcon, User, ArrowLeftRight, Building2 } from 'lucide-react';
import { useFlightSearch } from '@/hooks/use-flight-search';
import { catalogService } from '@/services/catalog';
import type { Airport } from '@/types/airport';

export const CompactTopSearchBar: React.FC = () => {
  const {
    flightType,
    setFlightType,
    leavingFrom,
    setLeavingFrom,
    goingTo,
    setGoingTo,
    dateRange,
    passengers,
    handleSwap,
  } = useFlightSearch();

  const [leavingOpen, setLeavingOpen] = useState(false);
  const [goingOpen, setGoingOpen] = useState(false);
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

  const totalTravelers = passengers.adults + passengers.children + passengers.infantsLap + passengers.infantsSeat;

  const filteredAirports = airports.filter(
    (a) =>
      a.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 pt-4 pb-2 font-sans">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-3">
        
        {/* Flight Type Sub-tabs (Roundtrip / One-way / Multi-city) */}
        <div className="flex items-center gap-6 border-b border-gray-100 pb-2 text-xs font-bold">
          <button
            onClick={() => setFlightType('roundtrip')}
            className={`pb-2 transition-all cursor-pointer ${
              flightType === 'roundtrip'
                ? 'text-[#0065eb] border-b-2 border-[#0065eb]'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Roundtrip
          </button>
          <button
            onClick={() => setFlightType('one-way')}
            className={`pb-2 transition-all cursor-pointer ${
              flightType === 'one-way'
                ? 'text-[#0065eb] border-b-2 border-[#0065eb]'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            One-way
          </button>
          <button
            onClick={() => setFlightType('multi-city')}
            className={`pb-2 transition-all cursor-pointer ${
              flightType === 'multi-city'
                ? 'text-[#0065eb] border-b-2 border-[#0065eb]'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Multi-city
          </button>
        </div>

        {/* Compact Form Inputs Row */}
        <div className="flex flex-col lg:flex-row items-center gap-2">
          
          {/* Origin & Destination pair */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:flex-[2] relative">
            
            {/* Leaving from Popover */}
            <Popover open={leavingOpen} onOpenChange={setLeavingOpen}>
              <PopoverTrigger asChild className="w-full flex-1">
                <div className="w-full border border-gray-400 rounded-xl px-3 py-1.5 flex items-center gap-2 bg-transparent hover:border-gray-600 cursor-pointer h-[48px]">
                  <MapPin className="w-4 h-4 text-slate-700 shrink-0" />
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[10px] font-medium text-gray-500 leading-tight">Leaving from</span>
                    <span className="text-xs font-semibold text-slate-900 truncate whitespace-nowrap">
                      {leavingFrom ? `${leavingFrom.city} (${leavingFrom.code})` : 'Ho Chi Minh City (SGN)'}
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-[360px] bg-white rounded-xl shadow-2xl border border-gray-200 p-0 overflow-hidden" align="start">
                <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                  <Input 
                    placeholder="Search airport..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {filteredAirports.map((ap) => (
                    <button
                      key={ap.code}
                      onClick={() => {
                        setLeavingFrom(ap);
                        setLeavingOpen(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-blue-50/60 transition-colors flex items-start gap-2.5 cursor-pointer text-xs"
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

            {/* Swap Button */}
            <Button 
              variant="outline"
              size="icon"
              onClick={handleSwap}
              className="w-7 h-7 rounded-full border border-gray-300 bg-white shadow-xs flex items-center justify-center shrink-0 hover:bg-gray-50 transition-colors sm:-mx-3 z-10 cursor-pointer min-w-0 p-0"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-gray-700" />
            </Button>

            {/* Going to Popover */}
            <Popover open={goingOpen} onOpenChange={setGoingOpen}>
              <PopoverTrigger asChild className="w-full flex-1">
                <div className="w-full border border-gray-400 rounded-xl px-3 py-1.5 flex items-center gap-2 bg-transparent hover:border-gray-600 cursor-pointer h-[48px]">
                  <MapPin className="w-4 h-4 text-slate-700 shrink-0" />
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[10px] font-medium text-gray-500 leading-tight">Going to</span>
                    <span className="text-xs font-semibold text-slate-900 truncate whitespace-nowrap">
                      {goingTo ? `${goingTo.city} (${goingTo.code})` : 'Hanoi (HAN)'}
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-[360px] bg-white rounded-xl shadow-2xl border border-gray-200 p-0 overflow-hidden" align="start">
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {filteredAirports.map((ap) => (
                    <button
                      key={ap.code}
                      onClick={() => {
                        setGoingTo(ap);
                        setGoingOpen(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-blue-50/60 transition-colors flex items-start gap-2.5 cursor-pointer text-xs"
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

          {/* Dates Input */}
          <div className="w-full lg:flex-1">
            <div className="w-full border border-gray-400 rounded-xl px-3 py-1.5 flex items-center gap-2 bg-transparent hover:border-gray-600 cursor-pointer h-[48px]">
              <CalendarIcon className="w-4 h-4 text-slate-700 shrink-0" />
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-[10px] font-medium text-gray-500 leading-tight">Dates</span>
                <span className="text-xs font-semibold text-slate-900 truncate whitespace-nowrap">
                  Wed, Aug {dateRange.startDate} - Wed, Aug {dateRange.endDate}
                </span>
              </div>
            </div>
          </div>

          {/* Travelers & Cabin Class Input */}
          <div className="w-full lg:flex-1">
            <div className="w-full border border-gray-400 rounded-xl px-3 py-1.5 flex items-center gap-2 bg-transparent hover:border-gray-600 cursor-pointer h-[48px]">
              <User className="w-4 h-4 text-slate-700 shrink-0" />
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-[10px] font-medium text-gray-500 leading-tight">Travelers, Cabin class</span>
                <span className="text-xs font-semibold text-slate-900 truncate whitespace-nowrap">
                  {totalTravelers} traveler, {passengers.cabinClass}
                </span>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="w-full lg:w-auto shrink-0">
            <Button
              className="w-full lg:w-auto bg-[#0065eb] hover:bg-blue-700 text-white font-bold rounded-full px-7 h-[48px] text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              Search
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
};
