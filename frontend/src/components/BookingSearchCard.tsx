import React, { useState } from 'react';
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
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus
} from 'lucide-react';

interface Airport {
  city: string;
  code: string;
  name: string;
  sublabel: string;
}

const airports: Airport[] = [
  { city: 'Ho Chi Minh City', code: 'SGN', name: 'Tan Son Nhat Intl.', sublabel: 'Ho Chi Minh Municipality, Vietnam' },
  { city: 'Ha Noi', code: 'HAN', name: 'Noi Bai Intl.', sublabel: 'Ha Noi Municipality, Vietnam' },
  { city: 'Da Nang', code: 'DAD', name: 'Da Nang Intl.', sublabel: 'Da Nang City, Vietnam' },
  { city: 'Bangkok', code: 'BKK', name: 'Suvarnabhumi Intl.', sublabel: 'Bangkok, Thailand' },
  { city: 'Singapore', code: 'SIN', name: 'Changi Intl.', sublabel: 'Singapore' },
  { city: 'Tokyo', code: 'HND', name: 'Haneda Intl.', sublabel: 'Tokyo, Japan' },
  { city: 'Seoul', code: 'ICN', name: 'Incheon Intl.', sublabel: 'Seoul, South Korea' },
];

export const BookingSearchCard: React.FC = () => {
  const [flightType, setFlightType] = useState('roundtrip');

  // Form selections state
  const [leavingFrom, setLeavingFrom] = useState<Airport>(airports[0]);
  const [goingTo, setGoingTo] = useState<Airport | null>(null);
  
  // Date range state
  const [startDate, setStartDate] = useState(12);
  const [endDate, setEndDate] = useState(19);
  
  // Travelers state
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infantsLap, setInfantsLap] = useState(0);
  const [infantsSeat, setInfantsSeat] = useState(0);
  const [cabinClass, setCabinClass] = useState('Economy');

  // Popover open states
  const [leavingOpen, setLeavingOpen] = useState(false);
  const [goingOpen, setGoingOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [travelersOpen, setTravelersOpen] = useState(false);

  // Search input query
  const [searchQuery, setSearchQuery] = useState('');

  const handleSwap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (goingTo) {
      const temp = leavingFrom;
      setLeavingFrom(goingTo);
      setGoingTo(temp);
    }
  };

  const totalTravelers = adults + childrenCount + infantsLap + infantsSeat;

  // Calendar dates grid generator for August 2026
  const augustDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const septemberDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="relative z-20 max-w-[1240px] mx-auto px-4 md:px-8 -mt-36 sm:-mt-44 md:-mt-48 mb-8">
      <Card className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
        
        {/* Flight Type Sub-tabs (Roundtrip / One-way / Multi-city) */}
        <div className="flex items-center gap-6 mb-5 border-b border-gray-100 pb-2 text-xs sm:text-sm">
          {[
            { id: 'roundtrip', label: 'Roundtrip' },
            { id: 'one-way', label: 'One-way' },
            { id: 'multi-city', label: 'Multi-city' },
          ].map((type) => {
            const isSelected = flightType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setFlightType(type.id)}
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
          
          {/* Leaving from & Going to Inputs with Swap button */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:flex-1 relative">
            
            {/* Leaving from Popover */}
            <Popover open={leavingOpen} onOpenChange={setLeavingOpen}>
              <PopoverTrigger asChild className="w-full">
                <div className="w-full border border-gray-400 rounded-xl px-3 py-2 flex items-center gap-2.5 bg-white hover:border-gray-600 cursor-pointer min-h-[56px]">
                  <MapPin className="w-5 h-5 text-gray-600 shrink-0" />
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[11px] font-medium text-gray-500 leading-tight">Leaving from</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                      {leavingFrom.city} ({leavingFrom.code}-{leavingFrom.name.substring(0, 5)}...
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-[380px] bg-white rounded-xl shadow-2xl border border-gray-200 p-0 overflow-hidden">
                <div className="p-2.5 border-b border-gray-100 bg-gray-50/50">
                  <Input 
                    placeholder="Search airport or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm"
                    autoFocus
                  />
                </div>
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {airports.map((ap) => (
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
                          {ap.city} ({ap.code} - {ap.name})
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {ap.sublabel}
                        </span>
                      </div>
                    </button>
                  ))}
                  <div className="p-3 flex items-center gap-3 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 cursor-pointer">
                    <Search className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Search for "{leavingFrom.city} ({leavingFrom.code}-..."</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Swap Button */}
            <Button 
              variant="outline"
              size="icon"
              onClick={handleSwap}
              className="w-8 h-8 rounded-full border border-gray-300 bg-white shadow-sm flex items-center justify-center shrink-0 hover:bg-gray-50 transition-colors sm:-mx-3 z-10 cursor-pointer min-w-0 p-0"
              aria-label="Swap departure and destination"
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
                      {goingTo ? `${goingTo.city}, ${goingTo.code}` : 'Going to'}
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-[380px] bg-white rounded-xl shadow-2xl border border-gray-200 p-0 overflow-hidden">
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {airports.map((ap) => (
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
                          {ap.city} ({ap.code} - {ap.name})
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {ap.sublabel}
                        </span>
                      </div>
                    </button>
                  ))}
                  <div className="p-3 flex items-center gap-3 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 cursor-pointer">
                    <Search className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Search for destination...</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

          </div>

          {/* Date & Travelers Inputs */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
            
            {/* Dates Popover */}
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild className="w-full sm:w-52">
                <div className="w-full border border-gray-400 rounded-xl px-3 py-2 flex items-center gap-2.5 bg-white hover:border-gray-600 cursor-pointer min-h-[56px]">
                  <CalendarIcon className="w-5 h-5 text-gray-600 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-medium text-gray-500 leading-tight">Dates</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                      Wed, Aug {startDate} - Wed, Aug {endDate}
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[340px] sm:w-[580px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6">
                {/* Selected Range Header */}
                <div className="flex items-center gap-3 font-bold text-sm sm:text-base text-gray-900 border-b border-gray-200 pb-3 mb-4">
                  <span className="border-b-2 border-[#0065eb] pb-1">Wed, Aug {startDate}</span>
                  <span>→</span>
                  <span>Wed, Aug {endDate}</span>
                </div>

                {/* Dual Calendar View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* August 2026 */}
                  <div>
                    <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-gray-800 mb-3">
                      <Button variant="ghost" size="icon" className="w-7 h-7 p-1 rounded-full"><ChevronLeft className="w-4 h-4 text-blue-600" /></Button>
                      <span>August 2026</span>
                      <div className="w-4" />
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-500 mb-2">
                      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      <div className="col-span-6" />
                      {augustDays.map((day) => {
                        const isStart = day === startDate;
                        const isEnd = day === endDate;
                        const isInRange = day >= startDate && day <= endDate;
                        return (
                          <button
                            key={`aug-${day}`}
                            onClick={() => {
                              if (day < startDate) setStartDate(day);
                              else setEndDate(day);
                            }}
                            className={`h-8 w-8 rounded-full flex items-center justify-center font-medium cursor-pointer transition-colors ${
                              isStart || isEnd 
                                ? 'bg-[#0065eb] text-white font-bold' 
                                : isInRange 
                                ? 'bg-blue-50 text-blue-900' 
                                : 'hover:bg-gray-100 text-gray-800'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* September 2026 */}
                  <div className="hidden sm:block">
                    <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-gray-800 mb-3">
                      <div className="w-4" />
                      <span>September 2026</span>
                      <Button variant="ghost" size="icon" className="w-7 h-7 p-1 rounded-full"><ChevronRight className="w-4 h-4 text-blue-600" /></Button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-500 mb-2">
                      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      <div className="col-span-2" />
                      {septemberDays.slice(0, 28).map((day) => (
                        <button
                          key={`sep-${day}`}
                          className="h-8 w-8 rounded-full flex items-center justify-center font-medium text-gray-800 hover:bg-gray-100 cursor-pointer"
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
                  <Button 
                    onClick={() => setDateOpen(false)}
                    className="bg-[#0065eb] hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2 rounded-full"
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Travelers & Cabin Class Popover */}
            <Popover open={travelersOpen} onOpenChange={setTravelersOpen}>
              <PopoverTrigger asChild className="w-full sm:w-56">
                <div className="w-full border border-gray-400 rounded-xl px-3 py-2 flex items-center gap-2.5 bg-white hover:border-gray-600 cursor-pointer min-h-[56px]">
                  <User className="w-5 h-5 text-gray-600 shrink-0" />
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[11px] font-medium text-gray-500 leading-tight truncate">Travelers, Cabin class</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                      {totalTravelers} traveler{totalTravelers > 1 ? 's' : ''}, {cabinClass}
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col gap-4">
                <div className="text-xs font-bold text-gray-700">
                  Travelers and Cabin class
                </div>

                {/* Adults */}
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-gray-900">Adults</span>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline"
                      size="icon"
                      disabled={adults <= 1}
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600 disabled:opacity-30"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-xs font-semibold w-3 text-center">{adults}</span>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => setAdults(adults + 1)}
                      className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-medium text-gray-900">Children</span>
                    <span className="text-[10px] text-gray-500">Ages 2 to 17</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline"
                      size="icon"
                      disabled={childrenCount <= 0}
                      onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                      className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600 disabled:opacity-30"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-xs font-semibold w-3 text-center">{childrenCount}</span>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => setChildrenCount(childrenCount + 1)}
                      className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Infants on lap */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-medium text-gray-900">Infants on lap</span>
                    <span className="text-[10px] text-gray-500">Younger than 2</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline"
                      size="icon"
                      disabled={infantsLap <= 0}
                      onClick={() => setInfantsLap(Math.max(0, infantsLap - 1))}
                      className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600 disabled:opacity-30"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-xs font-semibold w-3 text-center">{infantsLap}</span>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => setInfantsLap(infantsLap + 1)}
                      className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Infants in seat */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-medium text-gray-900">Infants in seat</span>
                    <span className="text-[10px] text-gray-500">Younger than 2</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline"
                      size="icon"
                      disabled={infantsSeat <= 0}
                      onClick={() => setInfantsSeat(Math.max(0, infantsSeat - 1))}
                      className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600 disabled:opacity-30"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-xs font-semibold w-3 text-center">{infantsSeat}</span>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => setInfantsSeat(infantsSeat + 1)}
                      className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Cabin Class Select Box */}
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
                      <option value="First Class">First Class</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Done Button */}
                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={() => setTravelersOpen(false)}
                    className="bg-[#0065eb] hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2 rounded-full"
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

          </div>

          {/* Search Button */}
          <div className="w-full lg:w-auto mt-2 lg:mt-0">
            <Button 
              className="w-full lg:w-auto bg-[#0065eb] hover:bg-blue-700 text-white font-semibold rounded-full px-8 py-3 h-[56px] text-sm shadow-md transition-colors"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Bottom Checkbox using shadcn Checkbox component */}
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
