import React from 'react';
import type { DatePriceOption } from '@/types/flightResult';

const DEFAULT_DATE_PRICES: DatePriceOption[] = [
  { dayName: 'Mon', date: 'Aug 10', price: 145 },
  { dayName: 'Tue', date: 'Aug 11', price: 132 },
  { dayName: 'Wed', date: 'Aug 12', price: 128, isSelected: true },
  { dayName: 'Thu', date: 'Aug 13', price: 135 },
  { dayName: 'Fri', date: 'Aug 14', price: 160 },
  { dayName: 'Sat', date: 'Aug 15', price: 175 },
  { dayName: 'Sun', date: 'Aug 16', price: 150 },
];

interface DatePriceStripProps {
  options?: DatePriceOption[];
  onSelectDate?: (date: DatePriceOption) => void;
}

export const DatePriceStrip: React.FC<DatePriceStripProps> = ({
  options = DEFAULT_DATE_PRICES,
  onSelectDate,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-2 mb-6 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 min-w-[600px]">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectDate && onSelectDate(opt)}
            className={`flex-1 flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
              opt.isSelected
                ? 'bg-blue-50 border-[#0065eb] text-[#0065eb]'
                : 'border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <span className="text-[11px] font-medium text-slate-500">{opt.dayName}, {opt.date}</span>
            <span className="text-sm font-bold mt-0.5">${opt.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
