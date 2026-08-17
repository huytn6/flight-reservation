import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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

  const departureTime = flight?.departureTime || segment?.departureTime || '08:30';
  const arrivalTime = flight?.arrivalTime || segment?.arrivalTime || '10:45';

  const duration = flight?.duration || segment?.duration || '2h 15m';

  const dateText = segment?.dateText || 'Hôm nay';
  const timezone = 'ICT';

  const aircraft = 'Airbus A321';
  const cabin = 'Economy';
  const distance = '721 mi';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[640px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Chi tiết chuyến bay
          </DialogTitle>
          <DialogDescription>
            {airline} - Chuyến bay {flightNumber}
          </DialogDescription>
        </DialogHeader>

        {/* Clean Flight Itinerary Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
          
          {/* Airline Badge & Flight Number */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-600 text-white font-extrabold text-[8px] italic rounded flex items-center justify-center shrink-0 select-none">
              {flightNumber.slice(0, 2)}
            </div>
            <span className="text-xs font-bold text-slate-900">
              {airline} ({flightNumber})
            </span>
          </div>

          {/* Detailed Timeline Layout */}
          <div className="flex flex-col mt-1">
            
            {/* Departure Row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 tracking-tight leading-snug">
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
                <span className="text-base font-bold text-slate-900 tracking-tight leading-snug">
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
                Thời gian bay: {duration}
              </span>
            </div>

            {/* Arrival Row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 tracking-tight leading-snug">
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
                <span className="text-base font-bold text-slate-900 tracking-tight leading-snug">
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
        <div className="grid grid-cols-2 gap-y-3 px-1 text-xs sm:text-sm border-t border-slate-100 pt-3">
          <div className="text-slate-600 font-medium">Tàu bay (Aircraft)</div>
          <div className="text-slate-900 font-semibold text-right sm:text-left">{aircraft}</div>

          <div className="text-slate-600 font-medium">Hạng chỗ (Cabin)</div>
          <div className="text-slate-900 font-semibold text-right sm:text-left">{cabin}</div>

          <div className="text-slate-600 font-medium">Khoảng cách (Distance)</div>
          <div className="text-slate-900 font-semibold text-right sm:text-left">{distance}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
