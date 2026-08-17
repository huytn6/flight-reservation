import React, { useState } from 'react';

interface DatePriceItem {
  dayName: string;
  date: string;
  price: number;
  isLowest?: boolean;
}

const DATES_DATA: DatePriceItem[] = [
  { dayName: 'Sun', date: 'Aug 9', price: 121 },
  { dayName: 'Mon', date: 'Aug 10', price: 122 },
  { dayName: 'Tue', date: 'Aug 11', price: 123 },
  { dayName: 'Wed', date: 'Aug 12', price: 111, isLowest: true },
  { dayName: 'Thu', date: 'Aug 13', price: 111, isLowest: true },
  { dayName: 'Fri', date: 'Aug 14', price: 121 },
  { dayName: 'Sat', date: 'Aug 15', price: 144 },
];

export const DatePriceMatrix: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(3); // Wed, Aug 12

  return (
    <div className="w-full grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6 font-sans">
      {DATES_DATA.map((item, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl transition-colors cursor-pointer ${
              isSelected
                ? 'bg-white border-2 border-[#0065eb]'
                : 'bg-white border border-slate-200 hover:border-slate-400'
            }`}
          >
            <span className={`text-xs font-normal leading-tight ${isSelected ? 'text-[#0065eb] font-semibold' : 'text-slate-700'}`}>
              {item.dayName}, {item.date}
            </span>
            <span
              className={`text-sm font-bold mt-0.5 leading-tight ${
                isSelected ? 'text-[#0065eb]' : 'text-slate-900'
              }`}
            >
              ${item.price}
            </span>
          </button>
        );
      })}
    </div>
  );
};
