import React from 'react';
import type { FlightType } from '../../types/flight';

interface FlightTypeTabsProps {
  selectedType: FlightType;
  onChange: (type: FlightType) => void;
}

export const FlightTypeTabs: React.FC<FlightTypeTabsProps> = ({ 
  selectedType, 
  onChange 
}) => {
  const tabs: { id: FlightType; label: string }[] = [
    { id: 'roundtrip', label: 'Roundtrip' },
    { id: 'one-way', label: 'One-way' },
    { id: 'multi-city', label: 'Multi-city' },
  ];

  return (
    <div className="flex items-center gap-6 mb-5 border-b border-gray-100 pb-2 text-xs sm:text-sm">
      {tabs.map((type) => {
        const isSelected = selectedType === type.id;
        return (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={`pb-1.5 transition-colors font-medium relative cursor-pointer ${
              isSelected ? 'text-[#0065eb] font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {type.label}
            {isSelected && (
              <div className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-[#0065eb]" />
            )}
          </button>
        );
      })}
    </div>
  );
};
