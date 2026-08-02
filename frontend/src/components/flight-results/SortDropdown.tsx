import React from 'react';
import { Select, type SelectOption } from '@/components/common/Select';

export const SORT_OPTIONS: SelectOption[] = [
  { value: 'Recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'duration_asc', label: 'Shortest duration' },
  { value: 'duration_desc', label: 'Longest duration' },
  { value: 'departure_asc', label: 'Earliest departure' },
  { value: 'departure_desc', label: 'Latest departure' },
  { value: 'arrival_asc', label: 'Earliest arrival' },
  { value: 'arrival_desc', label: 'Latest arrival' },
];

interface SortDropdownProps {
  selectedKey?: string;
  onSelectSort?: (key: string) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  selectedKey = 'Recommended',
  onSelectSort,
}) => {
  return (
    <div className="w-[180px]">
      <Select
        label="Sort by"
        value={selectedKey}
        options={SORT_OPTIONS}
        onChange={(val) => {
          if (onSelectSort) {
            onSelectSort(val);
          }
        }}
        searchable={true}
        searchPlaceholder="Search sort options..."
      />
    </div>
  );
};
