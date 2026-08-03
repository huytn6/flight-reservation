import React, { useEffect, useState } from 'react';
import { draftService, type SeatMapSeat, type SeatMapData, type SeatHold } from '@/services/draft';
import { Card } from '@/components/ui/card';
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
    if (!segmentId) return;
    setLoading(true);
    try {
      const [mapData, holdsData] = await Promise.all([
        draftService.getSeatMap(draftId, segmentId).catch(() => null),
        draftService.getSeatHolds(draftId).catch(() => []),
      ]);
      setSeatMap(mapData);
      setActiveHolds(holdsData || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = async (seat: SeatMapSeat) => {
    if (seat.status !== 'AVAILABLE' && !seat.held_by_me) {
      toast.error(`Ghế ${seat.seat_number} đã có người đặt`);
      return;
    }

    try {
      const existingHold = activeHolds.find((h) => h.seat_id === seat.id);
      if (existingHold) {
        await draftService.releaseSeatHold(draftId, existingHold.id);
        toast.info(`Đã bỏ chọn ghế ${seat.seat_number}`);
      } else {
        await draftService.holdSeat(draftId, seat.id, selectedPaxIndex);
        toast.success(`Đã chọn ghế ${seat.seat_number} cho Hành khách ${selectedPaxIndex + 1}`);
        if (selectedPaxIndex < passengerCount - 1) {
          setSelectedPaxIndex((prev) => prev + 1);
        }
      }
      await loadSeatMapAndHolds();
      onSeatHoldsChange?.();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi chọn ghế');
    }
  };

  if (loading) {
    return <div className="p-6 text-xs text-slate-500 text-center font-sans">Đang nạp sơ đồ ghế chuyến bay...</div>;
  }

  if (!seatMap) {
    return null;
  }

  return (
    <Card className="p-5 bg-white rounded-2xl border-0 shadow-none flex flex-col gap-4 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Armchair className="w-4 h-4 text-[#0065eb]" /> Chọn Ghế Ngồi Trực Quan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Chọn vị trí ghế ưa thích cho từng hành khách trước khi thanh toán.</p>
        </div>

        {/* Passenger selector tabs */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg">
          {Array.from({ length: passengerCount }).map((_, idx) => {
            const hold = activeHolds.find((h) => h.passenger_index === idx);
            const isSelected = selectedPaxIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPaxIndex(idx)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0065eb] text-white shadow-none'
                    : hold
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Hành khách {idx + 1} {hold ? '✓' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-normal text-slate-600 justify-center py-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200" /> Ghế trống
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-[#0065eb] text-white flex items-center justify-center text-[9px] font-bold">✓</div> Ghế bạn chọn
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-slate-300 opacity-60" /> Đã có người
        </div>
      </div>

      {/* Aircraft Seat Layout */}
      <div className="p-4 bg-slate-50/80 rounded-xl flex flex-col items-center gap-2 overflow-x-auto max-h-80 overflow-y-auto">
        <div className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-2">Đầu Máy Bay (Khoang Lái)</div>
        <div className="grid grid-cols-6 gap-2">
          {seatMap.seats.map((seat) => {
            const isHeldByMe = seat.held_by_me || activeHolds.some((h) => h.seat_id === seat.id);
            const isBlocked = seat.status !== 'AVAILABLE' && !isHeldByMe;

            return (
              <button
                key={seat.id}
                type="button"
                disabled={isBlocked}
                onClick={() => handleSeatClick(seat)}
                className={`w-9 h-9 rounded-lg font-mono font-medium text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isHeldByMe
                    ? 'bg-[#0065eb] text-white shadow-none'
                    : isBlocked
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                    : 'bg-white border border-slate-200/80 text-slate-700 hover:border-[#0065eb] hover:bg-blue-50/50'
                }`}
              >
                <span>{seat.seat_number}</span>
                {seat.extra_fee > 0 && (
                  <span className="text-[8px] font-normal text-slate-400">+{Math.round(seat.extra_fee / 1000)}k</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mt-2">Đuôi Máy Bay</div>
      </div>
    </Card>
  );
};
