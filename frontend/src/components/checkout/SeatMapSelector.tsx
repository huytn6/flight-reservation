import React, { useEffect, useState, useCallback } from 'react';
import { draftService, type SeatMapSeat, type SeatMapData, type SeatHold } from '@/services/draft';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Armchair, UserCheck, X } from 'lucide-react';

import { SeatStatusEnum } from '@/types/enums';

interface SeatMapSelectorProps {
  draftId: string;
  segmentId: string;
  passengerCount: number;
  passengerNames?: string[];
  onSeatHoldsChange?: () => void;
}

export const SeatMapSelector: React.FC<SeatMapSelectorProps> = ({
  draftId,
  segmentId,
  passengerCount,
  passengerNames = [],
  onSeatHoldsChange,
}) => {
  const [seatMap, setSeatMap] = useState<SeatMapData | null>(null);
  const [activeHolds, setActiveHolds] = useState<SeatHold[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedPaxIndex, setSelectedPaxIndex] = useState(0);

  const silentFetchData = useCallback(async () => {
    if (!segmentId) return;
    try {
      const [mapData, holdsData] = await Promise.all([
        draftService.getSeatMap(draftId, segmentId).catch(() => null),
        draftService.getSeatHolds(draftId).catch(() => []),
      ]);
      if (mapData) setSeatMap(mapData);
      if (holdsData) setActiveHolds(holdsData);
    } catch {
      // ignore silent fetch error
    }
  }, [draftId, segmentId]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setInitialLoading(true);
      await silentFetchData();
      if (isMounted) setInitialLoading(false);
    };
    init();
    return () => { isMounted = false; };
  }, [silentFetchData]);

  const handleSeatClick = async (seat: SeatMapSeat) => {
    if (seat.status !== SeatStatusEnum.AVAILABLE && !seat.held_by_me) {
      toast.error(`Ghế ${seat.seat_number} đã có người đặt`);
      return;
    }

    const existingHold = activeHolds.find((h) => h.seat_id === seat.id);

    // Optimistic Local State Update for 0ms Instant UI Response (No Jitter)
    if (existingHold) {
      setActiveHolds((prev) => prev.filter((h) => h.id !== existingHold.id));
      setSeatMap((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          seats: prev.seats.map((s) => s.id === seat.id ? { ...s, held_by_me: false } : s),
        };
      });
      toast.info(`Đã bỏ chọn ghế ${seat.seat_number}`);
    } else {
      const tempHoldId = `temp-${Date.now()}`;
      setActiveHolds((prev) => [...prev.filter((h) => h.passenger_index !== selectedPaxIndex), {
        id: tempHoldId,
        draft_id: draftId,
        seat_id: seat.id,
        passenger_index: selectedPaxIndex,
        expires_at: new Date(Date.now() + 600000).toISOString(),
      }]);
      setSeatMap((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          seats: prev.seats.map((s) => s.id === seat.id ? { ...s, held_by_me: true } : s),
        };
      });

      // Auto advance to next passenger if available
      if (selectedPaxIndex < passengerCount - 1) {
        setSelectedPaxIndex((prev) => prev + 1);
      }
    }

    // Silent background sync with server
    try {
      if (existingHold && existingHold.id && !existingHold.id.startsWith('temp-')) {
        await draftService.releaseSeatHold(draftId, existingHold.id);
      } else if (!existingHold) {
        await draftService.holdSeat(draftId, seat.id, selectedPaxIndex);
      }
      await silentFetchData();
      onSeatHoldsChange?.();
    } catch {
      await silentFetchData(); // Rollback on error
    }
  };

  const handleReleaseHoldByPax = async (hold: SeatHold) => {
    try {
      setActiveHolds((prev) => prev.filter((h) => h.id !== hold.id));
      if (hold.id && !hold.id.startsWith('temp-')) {
        await draftService.releaseSeatHold(draftId, hold.id);
      }
      await silentFetchData();
      onSeatHoldsChange?.();
      toast.info('Đã hủy chọn ghế');
    } catch {
      // ignore
    }
  };

  if (initialLoading) {
    return (
      <Card className="p-6 bg-white rounded-2xl border-0 shadow-none text-xs text-slate-500 text-center font-sans min-h-[220px] flex items-center justify-center">
        Đang nạp sơ đồ ghế chuyến bay...
      </Card>
    );
  }

  if (!seatMap) {
    return null;
  }

  return (
    <Card className="p-5 bg-white rounded-2xl border-0 shadow-none flex flex-col gap-4 font-sans min-h-[360px]">
      
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Armchair className="w-4 h-4 text-[#0065eb]" /> Chọn Ghế Ngồi Trực Quan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Chọn ví trí ghế ưa thích cho từng hành khách dưới đây:</p>
        </div>

        {/* Passenger Tabs with Assigned Seat Number Badges */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl flex-wrap">
          {Array.from({ length: passengerCount }).map((_, idx) => {
            const hold = activeHolds.find((h) => h.passenger_index === idx);
            const heldSeat = hold ? seatMap.seats.find((s) => s.id === hold.seat_id) : null;
            const isSelected = selectedPaxIndex === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPaxIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0065eb] text-white shadow-none'
                    : heldSeat
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <span>HK {idx + 1}</span>
                {heldSeat ? (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded font-mono ${isSelected ? 'bg-white text-[#0065eb]' : 'bg-emerald-600 text-white'}`}>
                    {heldSeat.seat_number}
                  </span>
                ) : (
                  <span className="text-[10px] opacity-70">(Chưa chọn)</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Seat Assignment Summary Banner */}
      <div className="p-3 bg-blue-50/70 border border-blue-100/80 rounded-xl space-y-2 text-xs">
        <div className="flex items-center justify-between font-semibold text-[#0065eb]">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" /> Danh Sách Ghế Đã Chọn Cho Đơn Hàng:
          </span>
          <span className="text-[11px] text-slate-500 font-normal">
            Đang chọn cho: <strong className="text-slate-800">Hành Khách {selectedPaxIndex + 1} {passengerNames[selectedPaxIndex] ? `(${passengerNames[selectedPaxIndex]})` : ''}</strong>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array.from({ length: passengerCount }).map((_, idx) => {
            const hold = activeHolds.find((h) => h.passenger_index === idx);
            const heldSeat = hold ? seatMap.seats.find((s) => s.id === hold.seat_id) : null;
            const paxName = passengerNames[idx] || `Hành Khách ${idx + 1}`;

            return (
              <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{paxName}</span>
                  {heldSeat ? (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[11px] font-bold">
                      Ghế {heldSeat.seat_number}
                    </Badge>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Chưa chọn ghế</span>
                  )}
                </div>
                {hold && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReleaseHoldByPax(hold)}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-normal text-slate-600 justify-center py-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-white border border-slate-200" /> Ghế trống
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
            const hold = activeHolds.find((h) => h.seat_id === seat.id);
            const isHeldByMe = seat.held_by_me || !!hold;
            const isBlocked = seat.status !== SeatStatusEnum.AVAILABLE && !isHeldByMe;
            const paxIdx = hold ? hold.passenger_index : null;

            return (
              <button
                key={seat.id}
                type="button"
                disabled={isBlocked}
                onClick={() => handleSeatClick(seat)}
                className={`w-10 h-10 rounded-lg font-mono text-xs flex flex-col items-center justify-center transition-all cursor-pointer select-none relative ${
                  isHeldByMe
                    ? 'bg-[#0065eb] text-white shadow-none font-bold'
                    : isBlocked
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50 font-normal'
                    : 'bg-white border border-slate-200/80 text-slate-700 hover:border-[#0065eb] hover:bg-blue-50/50 font-medium'
                }`}
              >
                <span>{seat.seat_number}</span>
                {isHeldByMe && paxIdx !== null && (
                  <span className="text-[8px] font-bold bg-white/20 px-1 rounded mt-0.5">
                    HK{paxIdx + 1}
                  </span>
                )}
                {!isHeldByMe && seat.extra_fee > 0 && (
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
