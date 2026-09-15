import React from 'react';
import { Select, type SelectOption } from '@/components/common/Select';

export const SORT_OPTIONS: SelectOption[] = [
  { value: 'Recommended', label: 'Đề xuất' },
  { value: 'price_asc', label: 'Giá: thấp đến cao' },
  { value: 'price_desc', label: 'Giá: cao đến thấp' },
  { value: 'duration_asc', label: 'Thời gian bay: ngắn nhất' },
  { value: 'duration_desc', label: 'Thời gian bay: dài nhất' },
  { value: 'departure_asc', label: 'Giờ khởi hành: sớm nhất' },
  { value: 'departure_desc', label: 'Giờ khởi hành: muộn nhất' },
  { value: 'arrival_asc', label: 'Giờ đến: sớm nhất' },
  { value: 'arrival_desc', label: 'Giờ đến: muộn nhất' },
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
        label="Sắp xếp theo"
        value={selectedKey}
        options={SORT_OPTIONS}
        onChange={(val) => {
          if (onSelectSort) {
            onSelectSort(val);
          }
        }}
        searchable={true}
        searchPlaceholder="Tìm kiểu sắp xếp..."
      />
    </div>
  );
};
