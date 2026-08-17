import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeftRight } from 'lucide-react';
import type { Airport } from '../../types/airport';
import { useFlightSearch } from '../../hooks/use-flight-search';
import { FlightTypeTabs } from './FlightTypeTabs';
import { AirportSelectorPopover } from './AirportSelectorPopover';
import { DateRangePickerPopover } from './DateRangePickerPopover';
import { PassengerSelectorPopover } from './PassengerSelectorPopover';
import { useNavigate } from 'react-router-dom';

interface BookingSearchCardProps {
  airports?: Airport[];
  onSearch?: (searchParams: any) => void;
  isHero?: boolean;
}

export const BookingSearchCard: React.FC<BookingSearchCardProps> = ({
  airports = [],
  onSearch,
  isHero = true,
}) => {
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
    bundleStay,
    setBundleStay,
    handleSwap,
  } = useFlightSearch();

  // Popover open states
  const [leavingOpen, setLeavingOpen] = useState(false);
  const [goingOpen, setGoingOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [travelersOpen, setTravelersOpen] = useState(false);

  const handleSearchSubmit = () => {
    const searchData = {
      flightType,
      leavingFrom,
      goingTo,
      dateRange,
      passengers,
      bundleStay,
    };

    if (onSearch) {
      onSearch(searchData);
    }

    const queryParams = new URLSearchParams({
      trip: flightType,
      leavingFrom: leavingFrom.code,
      leavingFromCity: leavingFrom.city,
      goingTo: goingTo?.code || 'HAN',
      goingToCity: goingTo?.city || 'Hanoi',
      startDate: dateRange.startDate.toString(),
      endDate: dateRange.endDate.toString(),
      adults: passengers.adults.toString(),
      children: passengers.children.toString(),
      cabinClass: passengers.cabinClass,
    }).toString();

    navigate(`/Flights-Search?${queryParams}`);
  };

  return (
    <div
      className={`relative z-20 max-w-[1240px] mx-auto px-4 md:px-8 ${isHero ? '-mt-36 sm:-mt-44 md:-mt-48 mb-8' : 'mb-2'}`}
    >
      <Card
        className={`bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 sm:pb-8 ${isHero ? 'shadow-xl' : 'shadow-xs border-gray-200'}`}
      >
        {/* Flight Type Sub-tabs (Roundtrip / One-way / Multi-city) */}
        <FlightTypeTabs selectedType={flightType} onChange={setFlightType} />

        {/* Balanced Main Search Form Inputs Row */}
        <div className="flex flex-col lg:flex-row items-center gap-2 relative">
          {/* Equal Width Origin & Destination pair */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:flex-[2] relative">
            {/* Leaving from Field */}
            <div className="w-full flex-1">
              <AirportSelectorPopover
                label="Leaving from"
                placeholder="Leaving from"
                selectedAirport={leavingFrom}
                airports={airports}
                onSelect={setLeavingFrom}
                isOpen={leavingOpen}
                onOpenChange={setLeavingOpen}
              />
            </div>

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

            {/* Going to Field */}
            <div className="w-full flex-1">
              <AirportSelectorPopover
                label="Going to"
                placeholder="Going to"
                selectedAirport={goingTo}
                airports={airports}
                onSelect={setGoingTo}
                isOpen={goingOpen}
                onOpenChange={setGoingOpen}
              />
            </div>
          </div>

          {/* Equal Width Dates Field */}
          <div className="w-full lg:flex-1">
            <DateRangePickerPopover
              dateRange={dateRange}
              onChange={setDateRange}
              isOpen={dateOpen}
              onOpenChange={setDateOpen}
            />
          </div>

          {/* Equal Width Travelers & Cabin Class Field */}
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
          <div className="w-full lg:w-auto mt-2 lg:mt-0">
            <Button
              onClick={handleSearchSubmit}
              className="w-full lg:w-auto bg-[#0065eb] hover:bg-blue-700 text-white font-semibold rounded-full px-8 py-3 h-[56px] text-sm shadow-md transition-colors cursor-pointer"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Bottom Checkbox */}
        <div className="flex items-center gap-2 mt-5">
          <Checkbox 
            checked={bundleStay}
            onCheckedChange={(checked) => setBundleStay(!!checked)}
            id="bundleSave" 
          />
          <label htmlFor="bundleSave" className="text-xs sm:text-sm text-gray-700 font-medium select-none cursor-pointer">
            Add a stay to Bundle & Save*
          </label>
        </div>
      </Card>
    </div>
  );
};
