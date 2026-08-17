import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  User, 
  ArrowLeftRight,
  Building2,
  ChevronDown,
  Plus,
  Minus
} from 'lucide-react';
import { catalogService } from '@/services/catalog';
import type { Airport } from '@/types/airport';
import { useFlightStore } from '@/store/use-flight';

export const BookingSearchCard: React.FC = () => {
  const navigate = useNavigate();
  const { setLeavingFrom: setStoreLeaving, setGoingTo: setStoreGoing } = useFlightStore();

  const [flightType, setFlightType] = useState<'roundtrip' | 'one-way' | 'multi-city'>('roundtrip');

  // Form selections state
  const [leavingFrom, setLeavingFrom] = useState<Airport>({
    city: 'Ho Chi Minh City',
    code: 'SGN',
    name: 'Tan Son Nhat Intl.',
    sublabel: 'Vietnam',
  });
  const [goingTo, setGoingTo] = useState<Airport | null>({
    city: 'Ha Noi',
    code: 'HAN',
    name: 'Noi Bai Intl.',
    sublabel: 'Vietnam',
  });
  
  // Date state
  const [departureDate, setDepartureDate] = useState('2026-08-15');
  const [returnDate, setReturnDate] = useState('2026-08-22');
  
  // Travelers state
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infantsLap] = useState(0);
  const [infantsSeat] = useState(0);
  const [cabinClass, setCabinClass] = useState('Economy');

  // Popover open states
  const [leavingOpen, setLeavingOpen] = useState(false);
  const [goingOpen, setGoingOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [travelersOpen, setTravelersOpen] = useState(false);

  // Search input query and suggestions
  const [searchQuery, setSearchQuery] = useState('');
  const [airportSuggestions, setAirportSuggestions] = useState<Airport[]>([]);
  const [loadingAirports, setLoadingAirports] = useState(false);

  useEffect(() => {
    loadDefaultAirports();
  }, []);

  const loadDefaultAirports = async () => {
    try {
      const res = await catalogService.getAirports('', 1, 10);
      if (res.items && res.items.length > 0) {
        setAirportSuggestions(res.items.map((ap: any) => ({
          city: ap.city || ap.name,
          code: ap.iata_code || ap.code || '',
          name: ap.name,
          sublabel: `${ap.city || ''}, ${ap.country || ''}`,
        })));
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      loadDefaultAirports();
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingAirports(true);
      try {
        const results = await catalogService.autocompleteAirports(searchQuery);
        setAirportSuggestions(results.map((ap: any) => ({
          city: ap.city || ap.name,
          code: ap.iata_code || ap.code || '',
          name: ap.name,
          sublabel: `${ap.city || ''}, ${ap.country || ''}`,
        })));
      } catch {
        // ignore
      } finally {
        setLoadingAirports(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);


  const handleSwap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (goingTo) {
      const temp = leavingFrom;
      setLeavingFrom(goingTo);
      setGoingTo(temp);
    }
  };

  const handleSearch = () => {
    setStoreLeaving(leavingFrom);
    setStoreGoing(goingTo);

    const params = new URLSearchParams();
    params.set('trip_type', flightType === 'roundtrip' ? 'ROUND_TRIP' : 'ONE_WAY');
    params.set('origin', leavingFrom.code);
    if (goingTo) params.set('destination', goingTo.code);
    params.set('departure_date', departureDate);
    if (flightType === 'roundtrip') params.set('return_date', returnDate);
    params.set('passengers', String(adults + childrenCount));
    params.set('cabin_class', cabinClass.toUpperCase().replace(' ', '_'));

    navigate(`/flights/search?${params.toString()}`);
  };

  const totalTravelers = adults + childrenCount + infantsLap + infantsSeat;

  return (
    <div className="relative z-20 max-w-[1240px] mx-auto px-4 md:px-8 -mt-36 sm:-mt-44 md:-mt-48 mb-8">
      <Card className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
        
        {/* Flight Type Sub-tabs */}
        <div className="flex items-center gap-6 mb-5 border-b border-gray-100 pb-2 text-xs sm:text-sm">
          {[
            { id: 'roundtrip', label: 'Roundtrip' },
            { id: 'one-way', label: 'One-way' },
          ].map((type) => {
            const isSelected = flightType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setFlightType(type.id as any)}
                className={`pb-1.5 transition-colors font-medium relative cursor-pointer ${
                  isSelected ? 'text-[#0065eb] font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type.label}
                {isSelected && (
                  <div className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-[#0065eb]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Search Form Inputs Row */}
        <div className="flex flex-col lg:flex-row items-center gap-2.5 relative">
          
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:flex-1 relative">
            
            {/* Leaving from Popover */}
            <Popover open={leavingOpen} onOpenChange={setLeavingOpen}>
              <PopoverTrigger asChild className="w-full">
                <div className="w-full border border-gray-400 rounded-xl px-3 py-2 flex items-center gap-2.5 bg-white hover:border-gray-600 cursor-pointer min-h-[56px]">
                  <MapPin className="w-5 h-5 text-gray-600 shrink-0" />
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[11px] font-medium text-gray-500 leading-tight">Leaving from</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                      {leavingFrom.city} ({leavingFrom.code})
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-[380px] bg-white rounded-xl shadow-2xl border border-gray-200 p-0 overflow-hidden">
                <div className="p-2.5 border-b border-gray-100 bg-gray-50/50">
                  <Input 
                    placeholder="Search airport by city or IATA code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm"
                    autoFocus
                  />
                </div>
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {loadingAirports ? (
                    <div className="p-4 text-xs text-slate-500 text-center">Loading airports...</div>
                  ) : airportSuggestions.length === 0 ? (
                    <div className="p-4 text-xs text-slate-500 text-center">No airports found</div>
                  ) : (
                    airportSuggestions.map((ap) => (
                      <button
                        key={ap.code}
                        onClick={() => {
                          setLeavingFrom(ap);
                          setLeavingOpen(false);
                        }}
                        className="w-full text-left p-3 hover:bg-blue-50/60 transition-colors flex items-start gap-3 cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            {ap.city} ({ap.code})
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {ap.name} • {ap.sublabel}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Swap Button */}
            <Button 
              variant="outline"
              size="icon"
              onClick={handleSwap}
              className="w-8 h-8 rounded-full border border-gray-300 bg-white shadow-sm flex items-center justify-center shrink-0 hover:bg-gray-50 transition-colors sm:-mx-3 z-10 cursor-pointer min-w-0 p-0"
            >
              <ArrowLeftRight className="w-4 h-4 text-gray-700" />
            </Button>

            {/* Going to Popover */}
            <Popover open={goingOpen} onOpenChange={setGoingOpen}>
              <PopoverTrigger asChild className="w-full">
                <div className="w-full border border-gray-400 rounded-xl px-3 py-2 flex items-center gap-2.5 bg-white hover:border-gray-600 cursor-pointer min-h-[56px]">
                  <MapPin className="w-5 h-5 text-gray-600 shrink-0" />
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[11px] font-medium text-gray-500 leading-tight">Going to</span>
                    <span className={`text-xs sm:text-sm truncate ${goingTo ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>
                      {goingTo ? `${goingTo.city} (${goingTo.code})` : 'Select Destination'}
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-[380px] bg-white rounded-xl shadow-2xl border border-gray-200 p-0 overflow-hidden">
                <div className="p-2.5 border-b border-gray-100 bg-gray-50/50">
                  <Input 
                    placeholder="Search destination airport..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm"
                    autoFocus
                  />
                </div>
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {loadingAirports ? (
                    <div className="p-4 text-xs text-slate-500 text-center">Loading airports...</div>
                  ) : (
                    airportSuggestions.map((ap) => (
                      <button
                        key={ap.code}
                        onClick={() => {
                          setGoingTo(ap);
                          setGoingOpen(false);
                        }}
                        className="w-full text-left p-3 hover:bg-blue-50/60 transition-colors flex items-start gap-3 cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            {ap.city} ({ap.code})
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {ap.name} • {ap.sublabel}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

          </div>

          {/* Date & Travelers Inputs */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
            
            {/* Departure & Return Dates */}
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild className="w-full sm:w-56">
                <div className="w-full border border-gray-400 rounded-xl px-3 py-2 flex items-center gap-2.5 bg-white hover:border-gray-600 cursor-pointer min-h-[56px]">
                  <CalendarIcon className="w-5 h-5 text-gray-600 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-medium text-gray-500 leading-tight">Travel Dates</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                      {departureDate} {flightType === 'roundtrip' ? `→ ${returnDate}` : ''}
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex flex-col gap-3">
                <div className="text-xs font-bold text-gray-800">Select Departure Date</div>
                <Input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="text-xs"
                />
                {flightType === 'roundtrip' && (
                  <>
                    <div className="text-xs font-bold text-gray-800 mt-2">Select Return Date</div>
                    <Input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="text-xs"
                    />
                  </>
                )}
                <Button onClick={() => setDateOpen(false)} size="sm" className="bg-[#0065eb] text-white mt-2">Done</Button>
              </PopoverContent>
            </Popover>

            {/* Travelers & Cabin Class */}
            <Popover open={travelersOpen} onOpenChange={setTravelersOpen}>
              <PopoverTrigger asChild className="w-full sm:w-56">
                <div className="w-full border border-gray-400 rounded-xl px-3 py-2 flex items-center gap-2.5 bg-white hover:border-gray-600 cursor-pointer min-h-[56px]">
                  <User className="w-5 h-5 text-gray-600 shrink-0" />
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[11px] font-medium text-gray-500 leading-tight truncate">Travelers & Class</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                      {totalTravelers} traveler{totalTravelers > 1 ? 's' : ''}, {cabinClass}
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col gap-4">
                <div className="text-xs font-bold text-gray-700">Travelers and Cabin class</div>

                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-gray-900">Adults</span>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" disabled={adults <= 1} onClick={() => setAdults(Math.max(1, adults - 1))} className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300">
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-xs font-semibold w-3 text-center">{adults}</span>
                    <Button variant="outline" size="icon" onClick={() => setAdults(adults + 1)} className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-gray-900">Children</span>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" disabled={childrenCount <= 0} onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))} className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300">
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-xs font-semibold w-3 text-center">{childrenCount}</span>
                    <Button variant="outline" size="icon" onClick={() => setChildrenCount(childrenCount + 1)} className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex flex-col gap-1 border border-gray-400 rounded-xl px-3 py-1.5 bg-white relative">
                    <label className="text-[10px] font-medium text-gray-500">Cabin class</label>
                    <select
                      value={cabinClass}
                      onChange={(e) => setCabinClass(e.target.value)}
                      className="w-full text-xs font-semibold text-gray-900 bg-transparent outline-none cursor-pointer appearance-none pr-6"
                    >
                      <option value="Economy">Economy</option>
                      <option value="Premium Economy">Premium Economy</option>
                      <option value="Business">Business</option>
                      <option value="First">First Class</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={() => setTravelersOpen(false)} className="bg-[#0065eb] text-white text-xs px-6 py-2 rounded-full">
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

          </div>

          {/* Search Button */}
          <div className="w-full lg:w-auto mt-2 lg:mt-0">
            <Button 
              onClick={handleSearch}
              className="w-full lg:w-auto bg-[#0065eb] hover:bg-blue-700 text-white font-semibold rounded-full px-8 py-3 h-[56px] text-sm shadow-md transition-colors cursor-pointer"
            >
              Search
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-5">
          <Checkbox defaultChecked id="bundleSave" />
          <label htmlFor="bundleSave" className="text-xs sm:text-sm text-gray-700 font-medium select-none cursor-pointer">
            Add a stay to Bundle & Save*
          </label>
        </div>
      </Card>
    </div>
  );
};
