"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateOfBirthPickerProps {
  value?: string; // Format: YYYY-MM-DD
  onChange: (val: string) => void;
  label?: string;
  className?: string;
  required?: boolean;
  error?: string;
}

export const DateOfBirthPicker: React.FC<DateOfBirthPickerProps> = ({
  value,
  onChange,
  label = "Ngày sinh",
  className = "",
  required = false,
  error,
}) => {
  const [open, setOpen] = React.useState(false);

  // Parse YYYY-MM-DD safely
  const parseDate = (val?: string): Date | undefined => {
    if (!val) return undefined;
    const parts = val.split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    return undefined;
  };

  const selectedDate = parseDate(value);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const yearStr = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      const iso = `${yearStr}-${monthStr}-${dayStr}`;
      onChange(iso);
      setOpen(false);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-[11px] font-medium text-slate-600 block mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            aria-required={required}
            aria-invalid={Boolean(error)}
            className={cn(
              "w-full justify-start text-left font-normal text-xs h-9 bg-white border-slate-200 shadow-none cursor-pointer",
              !selectedDate && "text-slate-400",
              error && "border-rose-400 focus-visible:ring-rose-300"
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400 shrink-0" />
            {selectedDate ? selectedDate.toLocaleDateString('vi-VN') : "Chọn ngày sinh"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0 bg-white border border-slate-200 shadow-xl rounded-xl" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            defaultMonth={selectedDate || new Date()}
            startMonth={new Date(1920, 0, 1)}
            endMonth={new Date()}
            captionLayout="dropdown"
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-[11px] text-rose-500 font-medium mt-1">{error}</p>}
    </div>
  );
};
