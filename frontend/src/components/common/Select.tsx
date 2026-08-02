import React, { useState, useRef, useEffect, useId } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ChevronDown, Search, X, Check, AlertCircle, Loader2 } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  className?: string;
  searchPlaceholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Select an option...',
  value,
  options = [],
  onChange,
  searchable = true,
  clearable = false,
  disabled = false,
  loading = false,
  error,
  helperText,
  fullWidth = false,
  className = '',
  searchPlaceholder = 'Search options...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionListRef = useRef<HTMLDivElement>(null);
  const containerId = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(query) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(query))
    );
  });

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setHighlightedIndex(0);
    }
  }, [isOpen, searchable]);

  // Scroll highlighted item into view during keyboard navigation
  useEffect(() => {
    if (isOpen && optionListRef.current) {
      const activeEl = optionListRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Keyboard Navigation Handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex] && !filteredOptions[highlightedIndex].disabled) {
        handleSelect(filteredOptions[highlightedIndex].value);
      }
    }
  };

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div
      className={`flex flex-col gap-1 font-sans ${fullWidth ? 'w-full' : 'w-auto'} ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
      onKeyDown={handleKeyDown}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        {/* Trigger Button - Vercel / Linear Minimal Style */}
        <PopoverTrigger asChild>
          <div
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={`${containerId}-listbox`}
            tabIndex={disabled ? -1 : 0}
            className={`flex items-center justify-between gap-3 bg-white/90 hover:bg-slate-50/80 border rounded-xl px-3.5 py-2 min-h-[44px] cursor-pointer transition-all duration-150 outline-none select-none ${
              error
                ? 'border-red-400 focus:ring-2 focus:ring-red-500/10'
                : isOpen
                ? 'border-slate-800 ring-2 ring-slate-900/5 shadow-xs'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            {/* Label & Value */}
            <div className="flex flex-col text-left overflow-hidden flex-1 min-w-0">
              {label && (
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-0.5 truncate">
                  {label}
                </span>
              )}

              <div className="flex items-center gap-2 truncate">
                {selectedOption?.icon && (
                  <span className="shrink-0 text-slate-600">{selectedOption.icon}</span>
                )}
                <span
                  className={`text-xs truncate ${
                    selectedOption ? 'font-medium text-slate-900' : 'text-slate-400 font-normal'
                  }`}
                >
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {loading && <Loader2 className="w-4 h-4 animate-spin text-[#0065eb]" />}

              {clearable && value && !loading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-4 h-4 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-slate-700' : ''
                }`}
              />
            </div>
          </div>
        </PopoverTrigger>

        {/* Dropdown Menu Popover Window - Modern Soft Shadow & High Whitespace */}
        <PopoverContent align="start" className="w-full min-w-[220px] max-w-[340px] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-1.5 overflow-hidden font-sans z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex flex-col max-h-72">
            
            {/* Sticky Modern Search Bar (Height: 40px) */}
            {searchable && (
              <div className="p-1.5 mb-1 sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <div className="relative flex items-center bg-slate-50/80 border border-slate-200/70 rounded-xl px-2.5 h-[40px] focus-within:border-slate-400 focus-within:bg-white transition-all">
                  <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List Container */}
            <div
              ref={optionListRef}
              id={`${containerId}-listbox`}
              role="listbox"
              className="overflow-y-auto space-y-0.5 max-h-56 pr-0.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => {
                  const isSelected = opt.value === value;
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={opt.disabled}
                      onClick={() => !opt.disabled && handleSelect(opt.value)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`flex items-center justify-between px-3 h-[40px] rounded-xl text-xs cursor-pointer transition-all duration-150 ${
                        opt.disabled ? 'opacity-40 cursor-not-allowed' : ''
                      } ${
                        isSelected
                          ? 'bg-slate-100 text-slate-900 font-semibold'
                          : isHighlighted
                          ? 'bg-slate-50 text-slate-900 font-medium'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-normal'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {opt.icon && <span className="shrink-0 text-slate-500">{opt.icon}</span>}
                        <div className="flex flex-col truncate">
                          <span className="truncate">{opt.label}</span>
                          {opt.sublabel && (
                            <span className="text-[10px] text-slate-400 font-normal truncate">
                              {opt.sublabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Checkmark Badge */}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5] text-blue-600 ml-2" />
                      )}
                    </div>
                  );
                })
              ) : (
                /* Empty State */
                <div className="py-8 px-4 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Search className="w-5 h-5 text-slate-300 stroke-[1.5]" />
                  <span>No options found</span>
                </div>
              )}
            </div>

          </div>
        </PopoverContent>
      </Popover>

      {/* Error & Helper Text */}
      {(error || helperText) && (
        <div className="flex items-center gap-1 text-[11px] px-1 mt-0.5">
          {error ? (
            <>
              <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
              <span className="text-red-500 font-medium">{error}</span>
            </>
          ) : (
            <span className="text-slate-400 font-normal">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
};
