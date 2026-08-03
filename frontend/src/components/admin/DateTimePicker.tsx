import React, { useState } from 'react';
import { format, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = "Chọn ngày & giờ...",
  className,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);

  const dateValue = value ? new Date(value) : undefined;
  const isDateValid = dateValue && isValid(dateValue);

  const hours = isDateValid ? String(dateValue.getHours()).padStart(2, '0') : '08';
  const minutes = isDateValid ? String(dateValue.getMinutes()).padStart(2, '0') : '00';

  const handleSelectDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    const updated = new Date(selectedDate);
    updated.setHours(Number(hours));
    updated.setMinutes(Number(minutes));

    const year = updated.getFullYear();
    const month = String(updated.getMonth() + 1).padStart(2, '0');
    const day = String(updated.getDate()).padStart(2, '0');
    const h = String(updated.getHours()).padStart(2, '0');
    const m = String(updated.getMinutes()).padStart(2, '0');

    onChange(`${year}-${month}-${day}T${h}:${m}`);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', val: string) => {
    const baseDate = isDateValid ? new Date(dateValue) : new Date();
    if (type === 'hours') {
      baseDate.setHours(Number(val));
    } else {
      baseDate.setMinutes(Number(val));
    }

    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    const h = String(baseDate.getHours()).padStart(2, '0');
    const m = String(baseDate.getMinutes()).padStart(2, '0');

    onChange(`${year}-${month}-${day}T${h}:${m}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full h-9 justify-start text-left font-sans text-xs border-slate-200 bg-white hover:bg-slate-50 cursor-pointer font-normal",
            !value && "text-slate-400",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-500" />
          {isDateValid ? (
            <span className="font-mono text-slate-800">
              {format(dateValue, 'dd/MM/yyyy HH:mm', { locale: vi })}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border-slate-200 shadow-md rounded-lg" align="start">
        <Calendar
          mode="single"
          selected={isDateValid ? dateValue : undefined}
          onSelect={handleSelectDate}
          locale={vi}
        />
        <div className="p-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Thời gian:</span>
          </div>
          <div className="flex items-center gap-1">
            <select
              value={hours}
              onChange={(e) => handleTimeChange('hours', e.target.value)}
              className="h-7 text-xs font-mono bg-white border border-slate-200 rounded px-1.5 cursor-pointer focus:outline-none focus:border-[#0065eb]"
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const val = String(i).padStart(2, '0');
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
            <span className="text-xs text-slate-400 font-mono">:</span>
            <select
              value={minutes}
              onChange={(e) => handleTimeChange('minutes', e.target.value)}
              className="h-7 text-xs font-mono bg-white border border-slate-200 rounded px-1.5 cursor-pointer focus:outline-none focus:border-[#0065eb]"
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const val = String(i * 5).padStart(2, '0');
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
