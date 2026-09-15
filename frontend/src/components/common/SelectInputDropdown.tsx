import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  key: string;
  label: string;
}

export interface SelectInputDropdownProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (key: string) => void;
  className?: string;
  minWidth?: string;
}

export const SelectInputDropdown: React.FC<SelectInputDropdownProps> = ({
  label = 'Chọn',
  value,
  options,
  onChange,
  className = '',
  minWidth = 'min-w-[170px]',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.key === value) || options[0];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex flex-col text-left bg-transparent border rounded-xl px-3 py-1.5 ${minWidth} h-[48px] justify-center cursor-pointer transition-colors outline-none select-none ${
            isOpen ? 'border-[#0065eb] border-2 shadow-xs' : 'border-[#707994] hover:border-slate-800'
          } ${className}`}
        >
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-[10px] text-slate-600 font-normal leading-none">{label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-700 shrink-0" />
          </div>
          <span className="text-xs font-bold text-slate-900 leading-tight mt-0.5 truncate">
            {selectedOption?.label}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="min-w-[180px] bg-white rounded-lg border border-gray-400 p-0 shadow-xl overflow-hidden font-sans">
        <div className="flex flex-col divide-y divide-gray-100">
          {options.map((opt) => {
            const isSelected = opt.key === selectedOption?.key;
            return (
              <button
                key={opt.key}
                onClick={() => {
                  onChange(opt.key);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#0065eb] text-white font-medium'
                    : 'bg-white text-slate-900 hover:bg-gray-100 font-normal'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
