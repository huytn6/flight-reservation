import React from 'react';

export interface FlightSegmentData {
  id: string;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
  airline: string;
  dateText: string;
  airlineLogoText?: string;
}

export interface FlightSegmentProps {
  segment: FlightSegmentData;
  onFlightDetailsClick?: (id: string) => void;
  onChangeFlightClick?: (id: string) => void;
}

export const FlightSegment: React.FC<FlightSegmentProps> = ({
  segment,
  onFlightDetailsClick,
  onChangeFlightClick,
}) => {
  return (
    <div className="flex flex-col gap-1 font-sans py-2">
      {/* City Route Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
        {segment.originCity} to {segment.destinationCity}
      </h3>

      {/* Times & Duration */}
      <div className="text-xs sm:text-sm text-slate-700 font-medium">
        {segment.departureTime} - {segment.arrivalTime} ({segment.duration}, {segment.stops})
      </div>

      {/* Airline Logo & Date */}
      <div className="flex items-center gap-1.5 mt-0.5">
        <div className="w-4 h-4 bg-[#e30613] text-white font-extrabold text-[7px] italic rounded flex items-center justify-center shrink-0 select-none">
          VJ
        </div>
        <span className="text-xs text-slate-700 font-medium">
          {segment.airline} <span className="font-normal text-slate-600">• {segment.dateText}</span>
        </span>
      </div>

      {/* Action Links */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <button
          onClick={() => onFlightDetailsClick && onFlightDetailsClick(segment.id)}
          className="text-[#0065eb] hover:underline font-normal cursor-pointer"
        >
          Flight details
        </button>

        <button
          onClick={() => onChangeFlightClick && onChangeFlightClick(segment.id)}
          className="text-[#0065eb] hover:underline font-normal cursor-pointer"
        >
          Change flight
        </button>
      </div>
    </div>
  );
};
