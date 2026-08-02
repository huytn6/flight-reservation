import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DateRangeState } from '../../types/flight';

interface DateRangePickerPopoverProps {
  dateRange: DateRangeState;
  onChange: (range: DateRangeState) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DateRangePickerPopover: React.FC<DateRangePickerPopoverProps> = ({
  dateRange,
  onChange,
  isOpen,
  onOpenChange,
}) => {
  const augustDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const septemberDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild className="w-full">
        <div className="w-full border border-gray-400 rounded-xl px-3 py-2 flex items-center gap-2.5 bg-white hover:border-gray-600 cursor-pointer h-[56px]">
          <CalendarIcon className="w-5 h-5 text-gray-600 shrink-0" />
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-[11px] font-medium text-gray-500 leading-tight">Dates</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate whitespace-nowrap">
              Aug {dateRange.startDate} - Aug {dateRange.endDate}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] sm:w-[580px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6" align="start">
        {/* Selected Range Header */}
        <div className="flex items-center gap-3 font-bold text-sm sm:text-base text-gray-900 border-b border-gray-200 pb-3 mb-4">
          <span className="border-b-2 border-[#0065eb] pb-1">Wed, Aug {dateRange.startDate}</span>
          <span>→</span>
          <span>Wed, Aug {dateRange.endDate}</span>
        </div>

        {/* Dual Calendar View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Month 1 */}
          <div>
            <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-gray-800 mb-3">
              <Button variant="ghost" size="icon" className="w-7 h-7 p-1 rounded-full"><ChevronLeft className="w-4 h-4 text-blue-600" /></Button>
              <span>{dateRange.startMonthName}</span>
              <div className="w-4" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-500 mb-2">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              <div className="col-span-6" />
              {augustDays.map((day) => {
                const isStart = day === dateRange.startDate;
                const isEnd = day === dateRange.endDate;
                const isInRange = day >= dateRange.startDate && day <= dateRange.endDate;
                return (
                  <button
                    key={`aug-${day}`}
                    onClick={() => {
                      if (day < dateRange.startDate) {
                        onChange({ ...dateRange, startDate: day });
                      } else {
                        onChange({ ...dateRange, endDate: day });
                      }
                    }}
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-medium cursor-pointer transition-colors ${
                      isStart || isEnd 
                        ? 'bg-[#0065eb] text-white font-bold' 
                        : isInRange 
                        ? 'bg-blue-50 text-blue-900' 
                        : 'hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Month 2 */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-gray-800 mb-3">
              <div className="w-4" />
              <span>{dateRange.endMonthName}</span>
              <Button variant="ghost" size="icon" className="w-7 h-7 p-1 rounded-full"><ChevronRight className="w-4 h-4 text-blue-600" /></Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-500 mb-2">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              <div className="col-span-2" />
              {septemberDays.slice(0, 28).map((day) => (
                <button
                  key={`sep-${day}`}
                  className="h-8 w-8 rounded-full flex items-center justify-center font-medium text-gray-800 hover:bg-gray-100 cursor-pointer"
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-[#0065eb] hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2 rounded-full"
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
