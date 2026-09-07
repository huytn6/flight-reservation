import React, { useEffect, useState } from 'react';
import { flightService } from '@/services/flight';

interface DatePriceMatrixProps {
  origin: string;
  destination: string;
  selectedDate: string; // ISO yyyy-mm-dd
  onSelectDate: (isoDate: string) => void;
}

interface DateOption {
  date: string;
  min_price: number | null;
}

const formatDayLabel = (iso: string): { dayName: string; date: string } => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return {
    dayName: dt.toLocaleDateString('vi-VN', { weekday: 'short' }),
    date: dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
  };
};

export const DatePriceMatrix: React.FC<DatePriceMatrixProps> = ({
  origin,
  destination,
  selectedDate,
  onSelectDate,
}) => {
  const [options, setOptions] = useState<DateOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!origin || !destination || !selectedDate) return;
    setLoading(true);
    flightService
      .getFlexibleDates(origin, destination, selectedDate)
      .then((res) => {
        if (!cancelled) setOptions(res);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, destination, selectedDate]);

  const lowestPrice = options.reduce<number | null>((min, opt) => {
    if (opt.min_price === null) return min;
    if (min === null || opt.min_price < min) return opt.min_price;
    return min;
  }, null);

  if (loading && options.length === 0) {
    return (
      <div className="w-full grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6 font-sans">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="h-[58px] rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (options.length === 0) return null;

  return (
    <div className="w-full grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6 font-sans">
      {options.map((item) => {
        const isSelected = item.date === selectedDate;
        const isLowest = item.min_price !== null && item.min_price === lowestPrice;
        const { dayName, date } = formatDayLabel(item.date);
        return (
          <button
            key={item.date}
            type="button"
            onClick={() => onSelectDate(item.date)}
            className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl transition-colors cursor-pointer ${
              isSelected
                ? 'bg-white border-2 border-[#0065eb]'
                : 'bg-white border border-slate-200 hover:border-slate-400'
            }`}
          >
            <span className={`text-xs font-normal leading-tight ${isSelected ? 'text-[#0065eb] font-semibold' : 'text-slate-700'}`}>
              {dayName}, {date}
            </span>
            <span
              className={`text-sm font-bold mt-0.5 leading-tight ${
                isSelected ? 'text-[#0065eb]' : isLowest ? 'text-emerald-600' : 'text-slate-900'
              }`}
            >
              {item.min_price !== null ? `${item.min_price.toLocaleString('vi-VN')}đ` : 'Hết vé'}
            </span>
          </button>
        );
      })}
    </div>
  );
};
