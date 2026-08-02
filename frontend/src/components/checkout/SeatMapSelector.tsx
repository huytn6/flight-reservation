import React, { useEffect, useState } from 'react';
import { draftService, type SeatMapSeat, type SeatMapData, type SeatHold } from '@/services/draft';
import { toast } from 'sonner';
import { Armchair } from 'lucide-react';


interface SeatMapSelectorProps {
  draftId: string;
  segmentId: string;
  passengerCount: number;
  onSeatHoldsChange?: () => void;
}

export const SeatMapSelector: React.FC<SeatMapSelectorProps> = ({
  draftId,
  segmentId,
  passengerCount,
  onSeatHoldsChange,
}) => {
  const [seatMap, setSeatMap] = useState<SeatMapData | null>(null);
  const [activeHolds, setActiveHolds] = useState<SeatHold[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaxIndex, setSelectedPaxIndex] = useState(0);

  useEffect(() => {
    loadSeatMapAndHolds();
  }, [draftId, segmentId]);

  const loadSeatMapAndHolds = async () => {
    setLoading(true);
    try {
      const [mapData, holdsData] = await Promise.all([
        draftService.getSeatMap(draftId, segmentId),
        draftService.getSeatHolds(draftId),
      ]);
      setSeatMap(mapData);
      setActiveHolds(holdsData || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load seat map');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = async (seat: SeatMapSeat) => {
    if (seat.status !== 'AVAILABLE' && !seat.held_by_me) {
      toast.error(`Seat ${seat.seat_number} is not available`);
      return;
    }

    try {
      const existingHold = activeHolds.find((h) => h.seat_id === seat.id);
      if (existingHold) {
        await draftService.releaseSeatHold(draftId, existingHold.id);
        toast.info(`Released seat ${seat.seat_number}`);
      } else {
        await draftService.holdSeat(draftId, seat.id, selectedPaxIndex);
        toast.success(`Selected seat ${seat.seat_number} for Passenger ${selectedPaxIndex + 1}`);
        if (selectedPaxIndex < passengerCount - 1) {
          setSelectedPaxIndex((prev) => prev + 1);
        }
      }
      await loadSeatMapAndHolds();
      onSeatHoldsChange?.();
    } catch (err: any) {
      toast.error(err.message || 'Seat selection failed');
    }
  };

  if (loading) {
    return <div className="p-6 text-xs text-slate-500 text-center">Loading seat map...</div>;
  }

  if (!seatMap) {
    return <div className="p-6 text-xs text-slate-500 text-center">Seat map not available for this segment</div>;
  }

  return (
    <div className="p-5 bg-white rounded-2xl border shadow-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Armchair className="w-5 h-5 text-blue-600" /> Choose Seats
          </h3>
          <p className="text-xs text-slate-500">Select seats for each passenger before checkout</p>
        </div>

        {/* Passenger selector tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {Array.from({ length: passengerCount }).map((_, idx) => {
            const hold = activeHolds.find((h) => h.passenger_index === idx);
            const isSelected = selectedPaxIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedPaxIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : hold
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pax {idx + 1} {hold ? '✓' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-medium text-slate-600 justify-center py-1">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-slate-200 border" /> Available
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">✓</div> Selected by You
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-slate-400 opacity-60" /> Unavailable
        </div>
      </div>

      {/* Aircraft Seat Layout */}
      <div className="p-4 bg-slate-50 rounded-xl border flex flex-col items-center gap-2 overflow-x-auto max-h-80 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Front of Aircraft (Cockpit)</div>
        <div className="grid grid-cols-6 gap-2">
          {seatMap.seats.map((seat) => {
            const isHeldByMe = seat.held_by_me || activeHolds.some((h) => h.seat_id === seat.id);
            const isBlocked = seat.status !== 'AVAILABLE' && !isHeldByMe;

            return (
              <button
                key={seat.id}
                disabled={isBlocked}
                onClick={() => handleSeatClick(seat)}
                className={`w-10 h-10 rounded-lg font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isHeldByMe
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : isBlocked
                    ? 'bg-slate-300 text-slate-400 cursor-not-allowed opacity-50'
                    : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <span>{seat.seat_number}</span>
                {seat.extra_fee > 0 && (
                  <span className="text-[8px] font-normal">+{Math.round(seat.extra_fee / 1000)}k</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
