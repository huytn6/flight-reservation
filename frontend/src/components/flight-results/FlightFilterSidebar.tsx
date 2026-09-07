import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sun, Sunset, Moon, Sunrise } from 'lucide-react';
import type { FlightOffer } from '@/services/flight';

export type DepartureSlot = 'earlyMorning' | 'morning' | 'afternoon' | 'evening';

export interface FlightFilters {
  nonstopOnly: boolean;
  airlines: string[];
  depSlot: DepartureSlot | null;
  maxPrice: number | null;
}

export const DEFAULT_FLIGHT_FILTERS: FlightFilters = {
  nonstopOnly: false,
  airlines: [],
  depSlot: null,
  maxPrice: null,
};

export const getDepartureSlot = (isoDateTime?: string): DepartureSlot | null => {
  if (!isoDateTime) return null;
  const hour = new Date(isoDateTime).getHours();
  if (hour < 5) return 'earlyMorning';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

export const applyFlightFilters = (flights: FlightOffer[], filters: FlightFilters): FlightOffer[] =>
  flights.filter((f) => {
    if (filters.nonstopOnly && f.stops !== 0) return false;
    if (filters.airlines.length > 0 && !filters.airlines.includes(f.airline?.iata_code || '')) return false;
    if (filters.depSlot && getDepartureSlot(f.departure_time) !== filters.depSlot) return false;
    if (filters.maxPrice !== null && (f.cheapest_total ?? 0) > filters.maxPrice) return false;
    return true;
  });

interface FlightFilterSidebarProps {
  flights: FlightOffer[];
  filters: FlightFilters;
  onChange: (filters: FlightFilters) => void;
}

const formatVnd = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

export const FlightFilterSidebar: React.FC<FlightFilterSidebarProps> = ({ flights, filters, onChange }) => {
  const nonstopFlights = flights.filter((f) => f.stops === 0);
  const nonstopFrom = nonstopFlights.length
    ? Math.min(...nonstopFlights.map((f) => f.cheapest_total ?? Infinity))
    : null;

  const airlineMap = new Map<string, { name: string; count: number; from: number }>();
  for (const f of flights) {
    const code = f.airline?.iata_code || '?';
    const price = f.cheapest_total ?? Infinity;
    const existing = airlineMap.get(code);
    if (existing) {
      existing.count += 1;
      existing.from = Math.min(existing.from, price);
    } else {
      airlineMap.set(code, { name: f.airline?.name || code, count: 1, from: price });
    }
  }
  const airlineOptions = Array.from(airlineMap.entries()).sort((a, b) => a[1].from - b[1].from);

  const depSlotStats = (slot: DepartureSlot) => {
    const matching = flights.filter((f) => getDepartureSlot(f.departure_time) === slot);
    return {
      count: matching.length,
      from: matching.length ? Math.min(...matching.map((f) => f.cheapest_total ?? Infinity)) : null,
    };
  };

  const prices = flights.map((f) => f.cheapest_total ?? 0).filter((p) => p > 0);
  const cheapest = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  // When every result costs the same, cheapest === maxPrice leaves the track with a
  // zero-width range and the handle simply cannot move. Open the low end down to a
  // rounded floor so the control still works on single-price routes.
  const minPrice =
    cheapest < maxPrice ? cheapest : Math.max(0, Math.floor((cheapest * 0.5) / 100_000) * 100_000);
  const priceStep = Math.max(1_000, Math.round((maxPrice - minPrice) / 40 / 1_000) * 1_000);
  const currentMax = Math.min(Math.max(filters.maxPrice ?? maxPrice, minPrice), maxPrice);

  const toggleAirline = (code: string) => {
    const next = filters.airlines.includes(code)
      ? filters.airlines.filter((c) => c !== code)
      : [...filters.airlines, code];
    onChange({ ...filters, airlines: next });
  };

  const toggleDepSlot = (slot: DepartureSlot) => {
    onChange({ ...filters, depSlot: filters.depSlot === slot ? null : slot });
  };

  const depSlotButton = (slot: DepartureSlot, label: string, hint: string, Icon: React.ElementType) => {
    const stats = depSlotStats(slot);
    return (
      <button
        type="button"
        onClick={() => toggleDepSlot(slot)}
        disabled={stats.count === 0}
        className={`rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5 text-center cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
          filters.depSlot === slot
            ? 'bg-[#0065eb]/10 border-2 border-[#141d38] shadow-xs'
            : 'bg-transparent border border-slate-400 hover:border-slate-600'
        }`}
      >
        <Icon className="w-4 h-4 text-[#141d38] stroke-[1.5]" />
        <span className="text-xs font-bold text-[#141d38]">{label}</span>
        <span className="text-[10px] text-[#526077] font-normal">{hint}</span>
        {stats.from !== null && (
          <span className="text-[10px] text-[#0065eb] font-semibold">Từ {formatVnd(stats.from)}</span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-full lg:w-64 flex flex-col gap-6 self-start shrink-0 text-[#141d38] font-sans select-none">
      <h3 className="font-bold text-[#141d38] text-xl sm:text-2xl tracking-tight -mb-1">
        Bộ lọc
      </h3>

      {/* Stops */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#141d38]">
          <span>Điểm dừng</span>
        </div>
        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onChange({ ...filters, nonstopOnly: !filters.nonstopOnly })}>
            <Checkbox id="nonstop" checked={filters.nonstopOnly} onCheckedChange={(c) => onChange({ ...filters, nonstopOnly: !!c })} />
            <label htmlFor="nonstop" className="text-xs text-[#141d38] font-normal cursor-pointer">
              Bay thẳng ({nonstopFlights.length})
            </label>
          </div>
          {nonstopFrom !== null && <span className="text-xs font-bold text-[#141d38]">Từ {formatVnd(nonstopFrom)}</span>}
        </div>
      </div>

      {/* Airlines */}
      {airlineOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#141d38]">
            <span>Hãng hàng không</span>
          </div>
          <div className="flex flex-col gap-2">
            {airlineOptions.map(([code, info]) => (
              <div key={code} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleAirline(code)}>
                  <Checkbox id={`air-${code}`} checked={filters.airlines.includes(code)} onCheckedChange={() => toggleAirline(code)} />
                  <label htmlFor={`air-${code}`} className="text-xs text-[#141d38] font-normal cursor-pointer">
                    {info.name} ({info.count})
                  </label>
                </div>
                <span className="text-xs font-bold text-[#141d38]">Từ {formatVnd(info.from)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      {maxPrice > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#141d38]">
            <span>Giá tối đa</span>
            <span className="text-[#0065eb]">{formatVnd(currentMax)}</span>
          </div>
          <Slider
            min={minPrice}
            max={maxPrice}
            step={priceStep}
            value={[currentMax]}
            onValueChange={([next]) => onChange({ ...filters, maxPrice: next })}
            aria-label="Giá tối đa"
            className="py-1.5"
          />
          <div className="flex justify-between text-[10px] text-[#526077]">
            <span>{formatVnd(minPrice)}</span>
            <span>{formatVnd(maxPrice)}</span>
          </div>
        </div>
      )}

      {/* Departure time */}
      <div className="flex flex-col gap-2">
        <span className="text-xs sm:text-sm font-bold text-[#141d38]">Giờ khởi hành</span>
        <div className="grid grid-cols-2 gap-2">
          {depSlotButton('morning', 'Sáng', '(5:00 - 11:59)', Sun)}
          {depSlotButton('afternoon', 'Chiều/Tối', '(12:00 - 17:59)', Sunset)}
          {depSlotButton('evening', 'Tối muộn', '(18:00 - 23:59)', Moon)}
          {depSlotButton('earlyMorning', 'Đêm khuya', '(0:00 - 4:59)', Sunrise)}
        </div>
      </div>
    </aside>
  );
};
