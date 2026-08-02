import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent, Input } from '@heroui/react';
import { MapPin, Building2, Search } from 'lucide-react';
import type { Airport } from '../../types/airport';

interface AirportSelectorPopoverProps {
  label: string;
  placeholder: string;
  selectedAirport: Airport | null;
  airports: Airport[];
  onSelect: (airport: Airport) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AirportSelectorPopover: React.FC<AirportSelectorPopoverProps> = ({
  label,
  placeholder,
  selectedAirport,
  airports,
  onSelect,
  isOpen,
  onOpenChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAirports = airports.filter(a => 
    a.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover isOpen={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger className="w-full">
        <div className="w-full border border-gray-400 rounded-xl px-3 py-2 flex items-center gap-2.5 bg-white hover:border-gray-600 cursor-pointer h-[56px]">
          <MapPin className="w-5 h-5 text-gray-600 shrink-0" />
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-[11px] font-medium text-gray-500 leading-tight">{label}</span>
            <span className={`text-xs sm:text-sm truncate whitespace-nowrap ${selectedAirport ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>
              {selectedAirport ? `${selectedAirport.city} (${selectedAirport.code})` : placeholder}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-[380px] bg-white rounded-xl shadow-2xl border border-gray-200 p-0 overflow-hidden">
        <div className="p-2.5 border-b border-gray-100 bg-gray-50/50">
          <Input 
            placeholder="Search airport or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm"
            autoFocus
          />
        </div>
        <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
          {filteredAirports.map((ap) => (
            <button
              key={ap.code}
              onClick={() => {
                onSelect(ap);
                onOpenChange(false);
              }}
              className="w-full text-left p-3 hover:bg-blue-50/60 transition-colors flex items-start gap-3 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {ap.city} ({ap.code} - {ap.name})
                </span>
                <span className="text-[11px] text-gray-500">
                  {ap.sublabel}
                </span>
              </div>
            </button>
          ))}
          <div className="p-3 flex items-center gap-3 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 cursor-pointer">
            <Search className="w-4 h-4 text-gray-500 shrink-0" />
            <span>Search for destination...</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
