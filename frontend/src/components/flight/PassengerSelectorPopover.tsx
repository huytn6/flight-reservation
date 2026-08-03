import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { User, ChevronDown, Plus, Minus } from 'lucide-react';
import type { PassengerState } from '../../types/flight';

interface PassengerSelectorPopoverProps {
  passengers: PassengerState;
  onUpdateAdults: (delta: number) => void;
  onUpdateChildren: (delta: number) => void;
  onUpdateInfantsLap: (delta: number) => void;
  onUpdateInfantsSeat: (delta: number) => void;
  onSetCabinClass: (cabinClass: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PassengerSelectorPopover: React.FC<PassengerSelectorPopoverProps> = ({
  passengers,
  onUpdateAdults,
  onUpdateChildren,
  onUpdateInfantsLap,
  onUpdateInfantsSeat,
  onSetCabinClass,
  isOpen,
  onOpenChange,
}) => {
  const totalTravelers = passengers.adults + passengers.children + passengers.infantsLap + passengers.infantsSeat;

  const getCabinClassLabel = (cc: string) => {
    switch (cc) {
      case 'Economy': return 'Phổ thông';
      case 'Premium Economy': return 'Phổ thông đặc biệt';
      case 'Business': return 'Thương gia';
      case 'First Class': return 'Hạng nhất';
      default: return cc;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild className="w-full">
        <div className="w-full border border-gray-400 rounded-xl px-3 py-2 flex items-center gap-2.5 bg-white hover:border-gray-600 cursor-pointer h-[56px]">
          <User className="w-5 h-5 text-gray-600 shrink-0" />
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-[11px] font-medium text-gray-500 leading-tight truncate whitespace-nowrap">Hành khách, Hạng ghế</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate whitespace-nowrap">
              {totalTravelers} hành khách, {getCabinClassLabel(passengers.cabinClass)}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col gap-4" align="start">
        <div className="text-xs font-bold text-gray-700">
          Số lượng hành khách & Hạng ghế
        </div>

        {/* Adults */}
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-gray-900">Người lớn</span>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              size="icon"
              disabled={passengers.adults <= 1}
              onClick={() => onUpdateAdults(-1)}
              className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600 disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-xs font-semibold w-3 text-center">{passengers.adults}</span>
            <Button 
              variant="outline"
              size="icon"
              onClick={() => onUpdateAdults(1)}
              className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-medium text-gray-900">Trẻ em</span>
            <span className="text-[10px] text-gray-500">Từ 2 đến 17 tuổi</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              size="icon"
              disabled={passengers.children <= 0}
              onClick={() => onUpdateChildren(-1)}
              className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600 disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-xs font-semibold w-3 text-center">{passengers.children}</span>
            <Button 
              variant="outline"
              size="icon"
              onClick={() => onUpdateChildren(1)}
              className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Infants on lap */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-medium text-gray-900">Em bé (Ngồi lòng)</span>
            <span className="text-[10px] text-gray-500">Dưới 2 tuổi</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              size="icon"
              disabled={passengers.infantsLap <= 0}
              onClick={() => onUpdateInfantsLap(-1)}
              className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600 disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-xs font-semibold w-3 text-center">{passengers.infantsLap}</span>
            <Button 
              variant="outline"
              size="icon"
              onClick={() => onUpdateInfantsLap(1)}
              className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Infants in seat */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-medium text-gray-900">Em bé (Ghế riêng)</span>
            <span className="text-[10px] text-gray-500">Dưới 2 tuổi</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              size="icon"
              disabled={passengers.infantsSeat <= 0}
              onClick={() => onUpdateInfantsSeat(-1)}
              className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600 disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-xs font-semibold w-3 text-center">{passengers.infantsSeat}</span>
            <Button 
              variant="outline"
              size="icon"
              onClick={() => onUpdateInfantsSeat(1)}
              className="w-7 h-7 min-w-0 p-0 rounded-full border-gray-300 text-gray-600 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Cabin Class Select Box */}
        <div className="pt-2">
          <div className="flex flex-col gap-1 border border-gray-400 rounded-xl px-3 py-1.5 bg-white relative">
            <label className="text-[10px] font-medium text-gray-500">Hạng ghế</label>
            <select
              value={passengers.cabinClass}
              onChange={(e) => onSetCabinClass(e.target.value)}
              className="w-full text-xs font-semibold text-gray-900 bg-transparent outline-none cursor-pointer appearance-none pr-6"
            >
              <option value="Economy">Phổ thông (Economy)</option>
              <option value="Premium Economy">Phổ thông đặc biệt (Premium Economy)</option>
              <option value="Business">Thương gia (Business)</option>
              <option value="First Class">Hạng nhất (First Class)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Done Button */}
        <div className="flex justify-end pt-2">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-[#0065eb] hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2 rounded-full cursor-pointer shadow-none"
          >
            Hoàn Tất
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
