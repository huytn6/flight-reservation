import React from 'react';
import { FlightSegment, type FlightSegmentData } from './FlightSegment';

export interface FlightSummaryCardProps {
  noticeText?: string;
  segments: FlightSegmentData[];
  onFlightDetailsClick?: (id: string) => void;
  onChangeFlightClick?: (id: string) => void;
}

export const FlightSummaryCard: React.FC<FlightSummaryCardProps> = ({
  noticeText = 'All flights have been updated to Economy.',
  segments,
  onFlightDetailsClick,
  onChangeFlightClick,
}) => {
  return (
    <div className="bg-transparent rounded-2xl border border-slate-200 p-5 sm:p-6 font-sans flex flex-col gap-4">
      {noticeText && (
        <div className="text-xs text-slate-600 font-normal">
          {noticeText}
        </div>
      )}

      <div className="flex flex-col divide-y divide-slate-200">
        {segments.map((seg) => (
          <div key={seg.id} className="first:pt-0 last:pb-0 py-4">
            <FlightSegment
              segment={seg}
              onFlightDetailsClick={onFlightDetailsClick}
              onChangeFlightClick={onChangeFlightClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
