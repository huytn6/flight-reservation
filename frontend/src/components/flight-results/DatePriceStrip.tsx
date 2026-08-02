import React from 'react';
import type { DatePriceOption } from '@/types/flightResult';
import { MOCK_DATE_PRICES } from '@/constants/mockFlightResults';

interface DatePriceStripProps {
  options?: DatePriceOption[];
  onSelectDate?: (date: DatePriceOption) => void;
}

export const DatePriceStrip: React.FC<DatePriceStripProps> = ({
  options = MOCK_DATE_PRICES,
  onSelectDate,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 p-2 shadow-xs mb-6 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 min-w-[600px]">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectDate && onSelectDate(opt)}
            className={`flex-1 flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
              opt.isSelected
                ? 'bg-blue-50 border-[#0065eb] text-[#0065eb] shadow-xs'
                : 'border-transparent hover:border-gray-200 hover:bg-gray-50 text-slate-700'
            }`}
          >
            <span className="text-[11px] font-medium text-gray-500">{opt.dayName}, {opt.date}</span>
            <span className="text-sm font-bold mt-0.5">${opt.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
