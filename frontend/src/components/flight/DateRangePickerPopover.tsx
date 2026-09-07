import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DateRangeState } from '../../types/flight';

interface DateRangePickerPopoverProps {
  dateRange: DateRangeState;
  onChange: (range: DateRangeState) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** One-way trips: only let the traveler pick a single date, no return date. */
  singleDate?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad2 = (n: number) => String(n).padStart(2, '0');

const toIso = (year: number, monthIndex: number, day: number) =>
  `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;

const parseIso = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const formatShort = (iso: string): string => {
  if (!iso) return '';
  return parseIso(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatTriggerLabel = (iso: string): string => {
  if (!iso) return '';
  return parseIso(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const monthLabel = (year: number, monthIndex: number): string =>
  new Date(year, monthIndex, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

/** Builds a 7-column grid (with leading blanks) for the given month. */
const buildMonthCells = (year: number, monthIndex: number): (number | null)[] => {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  return cells;
};

const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const DateRangePickerPopover: React.FC<DateRangePickerPopoverProps> = ({
  dateRange,
  onChange,
  isOpen,
  onOpenChange,
  singleDate = false,
}) => {
  const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');

  const startParsed = dateRange.startDate ? parseIso(dateRange.startDate) : new Date();
  const [viewYear, setViewYear] = useState(startParsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(startParsed.getMonth());

  const today = startOfToday();
  const isCurrentMonthOrEarlier =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  const goPrevMonth = () => {
    if (isCurrentMonthOrEarlier) return;
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const goNextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  // Second calendar always shows the month right after the first one
  const secondMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const secondYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  const handleDayClick = (dayIso: string) => {
    if (singleDate) {
      onChange({ ...dateRange, startDate: dayIso, endDate: dayIso });
      return;
    }
    if (activeTab === 'start') {
      if (dayIso > dateRange.endDate) {
        onChange({ ...dateRange, startDate: dayIso, endDate: dayIso });
      } else {
        onChange({ ...dateRange, startDate: dayIso });
      }
      setActiveTab('end');
    } else {
      if (dayIso < dateRange.startDate) {
        onChange({ ...dateRange, startDate: dayIso, endDate: dayIso });
      } else {
        onChange({ ...dateRange, endDate: dayIso });
      }
    }
  };

  const renderMonth = (year: number, monthIndex: number, showPrev: boolean, showNext: boolean) => {
    const cells = buildMonthCells(year, monthIndex);
    return (
      <div>
        <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-gray-800 mb-3">
          {showPrev ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={goPrevMonth}
              disabled={isCurrentMonthOrEarlier}
              className="w-7 h-7 p-1 rounded-full disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 text-blue-600" />
            </Button>
          ) : (
            <div className="w-7 h-7" />
          )}
          <span>{monthLabel(year, monthIndex)}</span>
          {showNext ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={goNextMonth}
              className="w-7 h-7 p-1 rounded-full"
            >
              <ChevronRight className="w-4 h-4 text-blue-600" />
            </Button>
          ) : (
            <div className="w-7 h-7" />
          )}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-500 mb-2">
          {WEEKDAYS.map((wd) => (
            <span key={wd}>{wd}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`blank-${idx}`} />;
            const dayIso = toIso(year, monthIndex, day);
            const isPast = parseIso(dayIso) < today;
            const isStart = dayIso === dateRange.startDate;
            const isEnd = dayIso === dateRange.endDate;
            const isInRange = dayIso >= dateRange.startDate && dayIso <= dateRange.endDate;
            return (
              <button
                key={dayIso}
                type="button"
                disabled={isPast}
                onClick={() => handleDayClick(dayIso)}
                className={`h-8 w-8 rounded-full flex items-center justify-center font-medium transition-colors ${
                  isPast
                    ? 'text-gray-300 cursor-not-allowed'
                    : isStart || isEnd
                    ? 'bg-[#0065eb] text-white font-bold cursor-pointer'
                    : isInRange
                    ? 'bg-blue-50 text-blue-900 font-semibold cursor-pointer'
                    : 'hover:bg-gray-100 text-gray-800 cursor-pointer'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild className="w-full">
        <div className="w-full border border-gray-400 rounded-xl px-3 py-2 flex items-center gap-2.5 bg-white hover:border-gray-600 cursor-pointer h-[56px]">
          <CalendarIcon className="w-5 h-5 text-gray-600 shrink-0" />
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-[11px] font-medium text-gray-500 leading-tight">Dates</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate whitespace-nowrap">
              {singleDate
                ? formatTriggerLabel(dateRange.startDate)
                : `${formatTriggerLabel(dateRange.startDate)} - ${formatTriggerLabel(dateRange.endDate)}`}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] sm:w-[580px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6" align="start">
        {/* Selected Date Header — single tab for one-way, two tabs for round-trip */}
        <div className="flex items-center gap-3 font-bold text-sm sm:text-base text-gray-900 border-b border-gray-200 pb-3 mb-4">
          {singleDate ? (
            <span className="pb-1 border-b-2 border-[#0065eb] text-[#0065eb]">
              {formatShort(dateRange.startDate)}
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('start')}
                className={`pb-1 transition-all cursor-pointer ${
                  activeTab === 'start'
                    ? 'border-b-2 border-[#0065eb] text-[#0065eb]'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {formatShort(dateRange.startDate)}
              </button>
              <span className="text-gray-400">→</span>
              <button
                type="button"
                onClick={() => setActiveTab('end')}
                className={`pb-1 transition-all cursor-pointer ${
                  activeTab === 'end'
                    ? 'border-b-2 border-[#0065eb] text-[#0065eb]'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {formatShort(dateRange.endDate)}
              </button>
            </>
          )}
        </div>

        {/* Dual Calendar View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {renderMonth(viewYear, viewMonth, true, true)}
          <div className="hidden sm:block">{renderMonth(secondYear, secondMonth, false, false)}</div>
        </div>

        <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#0065eb] hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2 rounded-full cursor-pointer"
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
