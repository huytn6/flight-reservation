import React from 'react';
import { X } from 'lucide-react';
import type { FlightResultItem } from './FlightCard';
import type { FlightSegmentData } from '../checkout/FlightSegment';

export interface FlightDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight?: FlightResultItem | null;
  segment?: FlightSegmentData | null;
}

const AIRPORT_NAMES: Record<string, string> = {
  SGN: 'Tan Son Nhat Intl. (SGN)',
  HAN: 'Noi Bai Intl. (HAN)',
  DAD: 'Da Nang Intl. (DAD)',
  PQC: 'Phu Quoc Intl. (PQC)',
  CXR: 'Cam Ranh Intl. (CXR)',
};

const CITY_NAMES: Record<string, string> = {
  SGN: 'Ho Chi Minh City',
  HAN: 'Hanoi',
  DAD: 'Da Nang',
  PQC: 'Phu Quoc',
  CXR: 'Nha Trang',
};

export const FlightDetailModal: React.FC<FlightDetailModalProps> = ({
  isOpen,
  onClose,
  flight,
  segment,
}) => {
  if (!isOpen) return null;

  // Extract variables with intelligent fallbacks matching Expedia screenshot
  const airline = flight?.airline || segment?.airline || 'Vietjet Air';
  const flightNumber = flight?.flightNumber || 'VJ146';
  
  const depCode = flight?.departureAirportCode || 'SGN';
  const arrCode = flight?.arrivalAirportCode || 'HAN';

  const departureCity = flight?.departureCity && !flight.departureCity.includes('...') 
    ? flight.departureCity 
    : (CITY_NAMES[depCode] || segment?.originCity || 'Ho Chi Minh City');

  const arrivalCity = flight?.arrivalCity && !flight.arrivalCity.includes('...') 
    ? flight.arrivalCity 
    : (CITY_NAMES[arrCode] || segment?.destinationCity || 'Hanoi');

  const departureAirportName = AIRPORT_NAMES[depCode] || `${departureCity} (${depCode})`;
  const arrivalAirportName = AIRPORT_NAMES[arrCode] || `${arrivalCity} (${arrCode})`;

  const departureTerminal = 'Terminal 1';
  const arrivalTerminal = 'Terminal 1';

  const departureTime = flight?.departureTime || segment?.departureTime || '4:45pm';
  const arrivalTime = flight?.arrivalTime || segment?.arrivalTime || '6:55pm';

  const duration = flight?.duration || segment?.duration || '2h 10m';

  const dateText = segment?.dateText || 'Fri, Aug 14';
  const timezone = 'ICT';

  const aircraft = 'Airbus A321';
  const cabin = 'Economy';
  const distance = '721 mi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog Content Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-[640px] shadow-2xl z-50 flex flex-col gap-6 relative animate-in zoom-in-95 duration-200">
        
        {/* Header bar: Close icon + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-slate-700 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Close flight details modal"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
          
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Flight details
          </h2>
        </div>

        {/* Light Gray Flight Itinerary Box */}
        <div className="bg-[#f0f3f6] rounded-[22px] p-5 sm:p-6 flex flex-col gap-4">
          
          {/* Airline Logo & Flight Number */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#e30613] text-white font-extrabold text-[7px] italic rounded flex items-center justify-center shrink-0 select-none">
              vj
            </div>
            <span className="text-xs font-bold text-slate-900">
              {airline} {flightNumber}
            </span>
          </div>

          {/* Detailed Timeline Layout */}
          <div className="flex flex-col mt-1">
            
            {/* Departure Row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                  {departureCity}
                </span>
                <span className="text-xs text-slate-600 font-normal leading-tight mt-0.5">
                  {departureAirportName}
                </span>
                <span className="text-xs text-slate-600 font-normal leading-tight mt-0.5">
                  {departureTerminal}
                </span>
              </div>

              <div className="flex flex-col items-end shrink-0 text-right">
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                  {departureTime}
                </span>
                <span className="text-xs text-slate-500 font-normal leading-tight mt-0.5">
                  {timezone}
                </span>
                <span className="text-xs text-slate-500 font-normal leading-tight mt-0.5">
                  {dateText}
                </span>
              </div>
            </div>

            {/* Travel Time Connecting Line */}
            <div className="relative pl-5 py-4 my-1">
              <div className="absolute left-[3px] top-0 bottom-0 w-[1.5px] bg-[#0065eb]" />
              <span className="text-xs text-slate-500 font-medium">
                Travel time: {duration}
              </span>
            </div>

            {/* Arrival Row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                  {arrivalCity}
                </span>
                <span className="text-xs text-slate-600 font-normal leading-tight mt-0.5">
                  {arrivalAirportName}
                </span>
                <span className="text-xs text-slate-600 font-normal leading-tight mt-0.5">
                  {arrivalTerminal}
                </span>
              </div>

              <div className="flex flex-col items-end shrink-0 text-right">
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                  {arrivalTime}
                </span>
                <span className="text-xs text-slate-500 font-normal leading-tight mt-0.5">
                  {timezone}
                </span>
                <span className="text-xs text-slate-500 font-normal leading-tight mt-0.5">
                  {dateText}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Details Grid (Aircraft, Cabin, Distance) */}
        <div className="grid grid-cols-2 gap-y-3 px-1 text-xs sm:text-sm">
          <div className="text-slate-600 font-medium">Aircraft</div>
          <div className="text-slate-900 font-semibold text-right sm:text-left">{aircraft}</div>

          <div className="text-slate-600 font-medium">Cabin</div>
          <div className="text-slate-900 font-semibold text-right sm:text-left">{cabin}</div>

          <div className="text-slate-600 font-medium">Distance</div>
          <div className="text-slate-900 font-semibold text-right sm:text-left">{distance}</div>
        </div>

      </div>
    </div>
  );
};
