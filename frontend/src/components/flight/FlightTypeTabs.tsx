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
    <Tabs value={selectedType} onValueChange={(v) => onChange(v as FlightType)} className="mb-4">
      <TabsList className="bg-slate-100/80 p-1 rounded-xl">
        <TabsTrigger value="roundtrip" className="rounded-lg text-xs sm:text-sm font-bold">
          Roundtrip
        </TabsTrigger>
        <TabsTrigger value="one-way" className="rounded-lg text-xs sm:text-sm font-bold">
          One-way
        </TabsTrigger>
        <TabsTrigger value="multi-city" className="rounded-lg text-xs sm:text-sm font-bold">
          Multi-city
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
