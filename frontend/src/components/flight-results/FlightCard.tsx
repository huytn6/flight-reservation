import React from 'react';

export interface FlightResultItem {
  id: string;
  airline: string;
  airlineCode?: string;
  airlineLogoBg?: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  arrivalDayNext?: string; // e.g. "+1"
  departureAirportCode: string;
  arrivalAirportCode: string;
  departureCity: string;
  arrivalCity: string;
  duration: string;
  stops: string;
  price: number;
  seatsLeftText?: string; // e.g. "4 left at"
  roundtripLabel?: string;
}

interface FlightCardProps {
  flight: FlightResultItem;
  isSelected?: boolean;
  onSelect?: (flight: FlightResultItem) => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, isSelected = false, onSelect }) => {
  const airlineCode = flight.airlineCode || flight.airline.slice(0, 2).toUpperCase();
  const airlineBadge = {
    VN: { background: '#0b7891', color: '#f8c84e' },
    VJ: { background: '#d71920', color: '#ffe100' },
    QH: { background: '#157347', color: '#ffffff' },
    BL: { background: '#f58220', color: '#ffffff' },
    VU: { background: '#6f2da8', color: '#ffffff' },
    '9G': { background: '#13294b', color: '#f2c75c' },
    SQ: { background: '#1f2f5c', color: '#f5c542' },
    TG: { background: '#512b81', color: '#ffffff' },
    NH: { background: '#1261a6', color: '#ffffff' },
  }[airlineCode] || { background: '#475569', color: '#ffffff' };

  return (
    <div 
      onClick={() => onSelect && onSelect(flight)}
      className={`rounded-[16px] py-2 px-3 sm:px-3.5 transition-all cursor-pointer flex flex-col sm:flex-row items-start justify-between gap-2.5 group font-sans ${
        isSelected
          ? 'bg-blue-50/20 border border-[#0065eb] shadow-2xs'
          : 'bg-transparent border border-slate-300 hover:border-slate-400'
      }`}
    >
      {/* Left Column: Airline Logo & Flight Details */}
      <div className="flex items-start gap-2 flex-1 min-w-0">
        
        {/* Compact carrier badge; avoids showing every non-VN flight as Vietjet. */}
        <div
          aria-label={`${flight.airline} (${airlineCode})`}
          className="w-7 h-7 font-extrabold text-[9px] tracking-tight rounded-md flex items-center justify-center shrink-0 mt-0.5 select-none shadow-sm"
          style={airlineBadge}
        >
          {airlineCode}
        </div>

        <div className="flex flex-col min-w-0">
          {/* Departure & Arrival Times with Green Line */}
          <div className="flex items-center gap-1.5 font-bold text-[#141d38] text-xs sm:text-xs tracking-tight leading-none">
            <span>{flight.departureTime}</span>
            <span className="h-[1.5px] w-8 sm:w-10 bg-[#0f7535] rounded-full inline-block mx-0.5 shrink-0" />
            <span>{flight.arrivalTime}</span>
            {flight.arrivalDayNext && (
              <sup className="text-[9px] font-semibold text-slate-600 -ml-0.5">{flight.arrivalDayNext}</sup>
            )}
          </div>

          {/* Airport Route Subtext */}
          <div className="text-[11px] text-[#526077] font-normal truncate mt-0.5">
            {flight.departureCity} ({flight.departureAirportCode}) - {flight.arrivalCity} ({flight.arrivalAirportCode})
          </div>

          {/* Airline Name */}
          <div className="text-[11px] text-[#526077] font-normal">
            {flight.airline}
          </div>
        </div>

      </div>

      {/* Middle Column: Duration & Nonstop (Centered Horizontally, Top Aligned) */}
      <div className="flex-1 flex justify-center items-start pt-0.5 text-center">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#141d38]">
          <span className="font-bold">{flight.duration}</span>
          <span className="text-[#526077]">•</span>
          <span className="text-[#0f7535] font-bold">{flight.stops}</span>
        </div>
      </div>

      {/* Right Column: Urgency Badge, Price Diff, Total & Roundtrip (Top Aligned) */}
      <div className="flex-1 flex flex-col items-end shrink-0 ml-auto sm:ml-0 text-right">
        {flight.seatsLeftText && (
          <span className="text-[10px] font-normal text-red-700 tracking-tight leading-none mb-0.5">
            {flight.seatsLeftText}
          </span>
        )}

        <span className="text-xs sm:text-sm font-bold text-[#141d38] leading-tight">
          {flight.price.toLocaleString('vi-VN')} đ
        </span>

        <span className="text-[10px] text-[#526077] font-normal tracking-tight">
          {flight.roundtripLabel || 'Giá vé đã gồm thuế & phí'}
        </span>
      </div>

    </div>
  );
};
