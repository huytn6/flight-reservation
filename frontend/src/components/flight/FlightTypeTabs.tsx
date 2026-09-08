import React from 'react';
import type { FlightType } from '../../types/flight';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FlightTypeTabsProps {
  selectedType: FlightType;
  onChange: (type: FlightType) => void;
}

export const FlightTypeTabs: React.FC<FlightTypeTabsProps> = ({ 
  selectedType, 
  onChange 
}) => {
  return (
    <Tabs value={selectedType} onValueChange={(v) => onChange(v as FlightType)} className="mb-5">
      <TabsList className="h-11 sm:h-12 bg-slate-100/90 p-1 rounded-2xl gap-1 w-max max-w-full inline-flex">
        <TabsTrigger
          value="one-way"
          className="rounded-xl px-4 sm:px-6 py-2 text-sm sm:text-base font-normal text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:font-semibold data-[state=active]:shadow-xs transition-all cursor-pointer"
        >
          Một Chiều
        </TabsTrigger>
        <TabsTrigger
          value="roundtrip"
          className="rounded-xl px-4 sm:px-6 py-2 text-sm sm:text-base font-normal text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:font-semibold data-[state=active]:shadow-xs transition-all cursor-pointer"
        >
          Khứ Hồi
        </TabsTrigger>
        <TabsTrigger 
          value="multi-city" 
          className="rounded-xl px-4 sm:px-6 py-2 text-sm sm:text-base font-normal text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:font-semibold data-[state=active]:shadow-xs transition-all cursor-pointer"
        >
          Nhiều Thành Phố
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
