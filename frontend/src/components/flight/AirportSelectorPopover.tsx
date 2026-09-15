import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { MapPin, Building2, Search } from 'lucide-react';
import type { Airport } from '../../types/airport';
import { catalogService } from '@/services/catalog';

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

interface AirportSelectorPopoverProps {
  label: string;
  placeholder: string;
  selectedAirport: Airport | null;
  airports?: Airport[];
  onSelect: (airport: Airport) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AirportSelectorPopover: React.FC<AirportSelectorPopoverProps> = ({
  label,
  placeholder,
  selectedAirport,
  airports: initialAirports,
  onSelect,
  isOpen,
  onOpenChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [airports, setAirports] = useState<Airport[]>(initialAirports || []);
  const requestIdRef = useRef(0);

  const loadAirports = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      if (searchQuery.trim()) {
        const autocompletes = await catalogService.autocompleteAirports(searchQuery);
        if (autocompletes && autocompletes.length > 0) {
          if (requestId === requestIdRef.current) {
            setAirports(
              autocompletes.map((ap: any) => ({
                code: ap.code || ap.iata_code,
                city: ap.city,
                name: ap.name,
                sublabel: `${ap.name}, ${ap.country || ''}`,
              }))
            );
          }
          return;
        }
      }
      const res = await catalogService.getAirports(searchQuery);
      const items = res.items || (Array.isArray(res) ? res : []);
      if (requestId === requestIdRef.current) {
        setAirports(
          items.map((ap: any) => ({
            code: ap.code || ap.iata_code,
            city: ap.city,
            name: ap.name,
            sublabel: `${ap.name}, ${ap.country || ''}`,
          }))
        );
      }
    } catch {
      // Keep initial fallback
    }
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      void loadAirports();
    }
  }, [isOpen, loadAirports]);

  const normalizedQuery = normalizeSearchText(searchQuery);
  const filteredAirports = airports.filter((airport) => {
    if (!normalizedQuery) return true;
    return [airport.city, airport.code, airport.name, airport.sublabel].some((value) =>
      normalizeSearchText(value).includes(normalizedQuery)
    );
  });

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild className="w-full">
        <div className="w-full border border-gray-400 rounded-xl px-3 py-2 flex items-center gap-2.5 bg-white hover:border-gray-600 cursor-pointer h-[56px]">
          <MapPin className="w-5 h-5 text-gray-600 shrink-0" />
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-[11px] font-medium text-gray-500 leading-tight">{label}</span>
            <span
              className={`text-xs sm:text-sm truncate whitespace-nowrap ${
                selectedAirport ? 'font-semibold text-gray-900' : 'text-gray-400'
              }`}
            >
              {selectedAirport ? `${selectedAirport.city} (${selectedAirport.code})` : placeholder}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-[380px] bg-white rounded-xl shadow-2xl border border-gray-200 p-0 overflow-hidden" align="start">
        <div className="p-2.5 border-b border-gray-100 bg-gray-50/50">
          <Input
            placeholder="Tìm sân bay hoặc thành phố..."
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
                <span className="text-[11px] text-gray-500">{ap.sublabel}</span>
              </div>
            </button>
          ))}
          {filteredAirports.length === 0 && (
            <div className="p-4 flex items-center justify-center gap-2 text-gray-500 text-xs sm:text-sm">
              <Search className="w-4 h-4 shrink-0" />
              <span>Không tìm thấy sân bay phù hợp</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
