import React from 'react';
import { Button } from '@heroui/react';
import { Search, Edit3 } from 'lucide-react';

interface FlightSearchHeaderProps {
  originCity?: string;
  originCode?: string;
  destCity?: string;
  destCode?: string;
  dateText?: string;
  travelerText?: string;
  onEditSearch?: () => void;
}

export const FlightSearchHeader: React.FC<FlightSearchHeaderProps> = ({
  originCity = 'Ho Chi Minh City',
  originCode = 'SGN',
  destCity = 'Da Nang',
  destCode = 'DAD',
  dateText = 'Aug 12 - Aug 19',
  travelerText = '1 traveler, Economy',
  onEditSearch,
}) => {
  return (
    <div className="bg-[#12182b] text-white py-4 px-4 shadow-md border-b border-slate-800">
      <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Search Summary Route & Meta */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0">
            <Search className="w-5 h-5 text-blue-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 font-bold text-base sm:text-lg tracking-tight">
              <span>{originCity} ({originCode})</span>
              <span>→</span>
              <span>{destCity} ({destCode})</span>
            </div>
            <div className="text-xs text-gray-300 font-medium flex items-center gap-3">
              <span>{dateText}</span>
              <span>•</span>
              <span>{travelerText}</span>
            </div>
          </div>
        </div>

        {/* Edit Search Action Button */}
        <Button
          onClick={onEditSearch}
          variant="outline"
          className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-full px-5 py-2 border border-white/30 transition-all flex items-center gap-2 self-stretch md:self-auto justify-center"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit search</span>
        </Button>

      </div>
    </div>
  );
};
