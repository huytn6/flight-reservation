import React from 'react';
import type { DatePriceOption } from '@/types/flightResult';

const DEFAULT_DATE_PRICES: DatePriceOption[] = [
  { dayName: 'Th 2', date: '10 Th8', price: 145 },
  { dayName: 'Th 3', date: '11 Th8', price: 132 },
  { dayName: 'Th 4', date: '12 Th8', price: 128, isSelected: true },
  { dayName: 'Th 5', date: '13 Th8', price: 135 },
  { dayName: 'Th 6', date: '14 Th8', price: 160 },
  { dayName: 'Th 7', date: '15 Th8', price: 175 },
  { dayName: 'CN', date: '16 Th8', price: 150 },
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
