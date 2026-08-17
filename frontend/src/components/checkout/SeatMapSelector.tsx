import React, { useEffect, useState, useMemo } from 'react';
import { draftService, type SeatMapSeat, type SeatMapData, type SeatHold } from '@/services/draft';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Armchair, UserCheck, X, Check } from 'lucide-react';

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

  // Initial load: Fetch Seat Map (180 seats) and Active Holds ONCE
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (!segmentId) return;
      setInitialLoading(true);
      try {
        const [mapData, holdsData] = await Promise.all([
          draftService.getSeatMap(draftId, segmentId).catch(() => null),
          draftService.getSeatHolds(draftId).catch(() => []),
        ]);
        if (isMounted) {
          if (mapData) setSeatMap(mapData);
          if (holdsData) setActiveHolds(holdsData);
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [draftId, segmentId]);

  // Fast O(1) lookup map for active holds
  const activeHoldsMap = useMemo(() => {
    const map = new Map<string, SeatHold>();
    for (const h of activeHolds) {
      map.set(h.seat_id, h);
    }
    return map;
  }, [activeHolds]);

  // Pre-calculate structured rows with useMemo for 60fps instant render
  const structuredRows = useMemo(() => {
    if (!seatMap?.seats) return [];
    const rows: { [row: number]: { [col: string]: SeatMapSeat } } = {};
    for (const s of seatMap.seats) {
      const rowNum = s.seat_row ?? parseInt(s.seat_number, 10) ?? 1;
      const colLabel = s.column_label ?? s.seat_number.replace(/\d+/g, '') ?? 'A';
      if (!rows[rowNum]) rows[rowNum] = {};
      rows[rowNum][colLabel] = s;
    }
    return Object.keys(rows)
      .map(Number)
      .sort((a, b) => a - b)
      .map((rowNum) => ({
        rowNum,
        left: ['A', 'B', 'C'].map((col) => rows[rowNum][col] || null),
        right: ['D', 'E', 'F'].map((col) => rows[rowNum][col] || null),
      }));
  }, [seatMap]);

  const handleSeatClick = async (seat: SeatMapSeat) => {
    const existingHold = activeHoldsMap.get(seat.id);

    if (seat.status !== SeatStatusEnum.AVAILABLE && !seat.held_by_me && !existingHold) {
      toast.error(`Ghế ${seat.seat_number} đã có người đặt`);
      return;
    }

    const currentPax = selectedPaxIndex;

    // Instant 0ms Optimistic Update (No network delay, No Jitter)
    if (existingHold) {
      // Toggle off / deselect
      setActiveHolds((prev) => prev.filter((h) => h.seat_id !== seat.id));
      toast.info(`Đã bỏ chọn ghế ${seat.seat_number}`);

      // Background Sync Release
      try {
        if (existingHold.id && !existingHold.id.startsWith('temp-')) {
          await draftService.releaseSeatHold(draftId, existingHold.id);
        }
        onSeatHoldsChange?.();
      } catch {
        // Refresh holds on error
        const fresh = await draftService.getSeatHolds(draftId).catch(() => []);
        setActiveHolds(fresh);
      }
    } else {
      // Select new seat for current passenger (replaces any previous seat of this pax)
      const tempHoldId = `temp-${Date.now()}`;
      const newHold: SeatHold = {
        id: tempHoldId,
        draft_id: draftId,
        seat_id: seat.id,
        passenger_index: currentPax,
        expires_at: new Date(Date.now() + 900000).toISOString(),
      };

      setActiveHolds((prev) => [...prev.filter((h) => h.passenger_index !== currentPax), newHold]);

      // Auto advance to next passenger if available
      if (currentPax < passengerCount - 1) {
        setSelectedPaxIndex(currentPax + 1);
      }

      // Background Sync Hold
      try {
        const holdRes = await draftService.holdSeat(draftId, seat.id, currentPax);
        setActiveHolds((prev) =>
          prev.map((h) =>
            h.id === tempHoldId ? { ...h, id: holdRes.id, expires_at: holdRes.expires_at } : h
          )
        );
        onSeatHoldsChange?.();
      } catch (err: any) {
        toast.error(err.message || 'Không thể giữ ghế này');
        const fresh = await draftService.getSeatHolds(draftId).catch(() => []);
        setActiveHolds(fresh);
      }
    }
  };

  const handleReleaseHoldByPax = async (hold: SeatHold) => {
    setActiveHolds((prev) => prev.filter((h) => h.id !== hold.id));
    try {
      if (hold.id && !hold.id.startsWith('temp-')) {
        await draftService.releaseSeatHold(draftId, hold.id);
      }
      onSeatHoldsChange?.();
      toast.info('Đã hủy chọn ghế');
    } catch {
      const fresh = await draftService.getSeatHolds(draftId).catch(() => []);
      setActiveHolds(fresh);
    }
  };

  if (initialLoading) {
    return (
      <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-none text-xs text-slate-500 text-center font-sans min-h-[220px] flex items-center justify-center">
        Đang nạp sơ đồ ghế chuyến bay...
      </Card>
    );
  }

  if (!seatMap) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-2xl border-0 shadow-none flex flex-col gap-4 font-sans min-h-[360px]">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Chọn Ghế Ngồi Trực Quan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn vị trí ghế ngồi ưa thích cho từng hành khách:
          </p>
        </div>

        {/* Passenger Tabs */}
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#0065eb] text-white'
                    : heldSeat
                      ? 'bg-blue-50 text-[#0065eb] border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <span>HK {idx + 1}</span>
                {heldSeat ? (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-bold rounded font-mono ${
                      isSelected ? 'bg-white text-[#0065eb]' : 'bg-[#0065eb] text-white'
                    }`}
                  >
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
      <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2 text-xs">
        <div className="flex items-center justify-between font-semibold text-[#0065eb]">
          <span>Danh Sách Ghế Đã Chọn:</span>
          <span className="text-[11px] text-slate-500 font-normal">
            Đang chọn cho:{' '}
            <strong className="text-slate-800">
              Hành Khách {selectedPaxIndex + 1}{' '}
              {passengerNames[selectedPaxIndex] ? `(${passengerNames[selectedPaxIndex]})` : ''}
            </strong>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array.from({ length: passengerCount }).map((_, idx) => {
            const hold = activeHolds.find((h) => h.passenger_index === idx);
            const heldSeat = hold ? seatMap.seats.find((s) => s.id === hold.seat_id) : null;
            const paxName = passengerNames[idx] || `Hành Khách ${idx + 1}`;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200/60"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{paxName}:</span>
                  {heldSeat ? (
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-[#0065eb] border-blue-200 font-mono text-[11px] font-bold"
                      >
                        Ghế {heldSeat.seat_number}
                      </Badge>
                      <span className="text-[11px] text-slate-500">
                        {heldSeat.extra_fee > 0
                          ? `(+${heldSeat.extra_fee.toLocaleString('vi-VN')}đ)`
                          : '(0đ)'}
                      </span>
                    </div>
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
      <div className="flex flex-wrap items-center gap-4 text-xs font-normal text-slate-600 justify-center py-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-white border border-slate-200" />
          <span>Ghế tiêu chuẩn (0đ)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-blue-50 border border-blue-300" />
          <span>Ghế có phí (Cửa sổ / Thoát hiểm)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-[#0065eb] text-white flex items-center justify-center">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
          <span className="font-semibold text-slate-900">Ghế bạn đang chọn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-slate-200 opacity-60" />
          <span>Đã có người đặt</span>
        </div>
      </div>

      {/* Aircraft Cabin View with Row by Row Layout */}
      <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col items-center gap-3 overflow-x-auto max-h-[420px] overflow-y-auto">
        <div className="px-4 py-1 rounded-full bg-slate-200/80 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          Đầu Máy Bay (Khoang Lái)
        </div>

        {/* Column Labels Header */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 select-none">
          <div className="w-9 text-center">A</div>
          <div className="w-9 text-center">B</div>
          <div className="w-9 text-center">C</div>
          <div className="w-8 text-center text-[10px] text-slate-300">LỐI ĐI</div>
          <div className="w-9 text-center">D</div>
          <div className="w-9 text-center">E</div>
          <div className="w-9 text-center">F</div>
        </div>

        {/* Optimized Rows Rendering */}
        <div className="flex flex-col gap-1.5 w-fit">
          {structuredRows.map(({ rowNum, left, right }) => (
            <div key={rowNum} className="flex items-center gap-1">
              {/* Left 3 seats */}
              <div className="flex items-center gap-1">
                {left.map((seat, cIdx) => {
                  if (!seat) return <div key={cIdx} className="w-9 h-9 opacity-0" />;
                  const hold = activeHoldsMap.get(seat.id);
                  const isHeldByMe = !!hold;
                  const isBlocked = seat.status !== SeatStatusEnum.AVAILABLE && !isHeldByMe;
                  const paxIdx = hold ? hold.passenger_index : null;
                  const hasFee = seat.extra_fee > 0;

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={isBlocked}
                      onClick={() => handleSeatClick(seat)}
                      title={`Ghế ${seat.seat_number} (${seat.seat_type}) ${
                        hasFee
                          ? `- Phụ phí: +${seat.extra_fee.toLocaleString('vi-VN')} VNĐ`
                          : '- Miễn phí'
                      }`}
                      className={`w-9 h-9 rounded-lg font-mono text-xs flex flex-col items-center justify-center cursor-pointer select-none relative transition-colors ${
                        isHeldByMe
                          ? 'bg-[#0065eb] text-white font-bold ring-2 ring-[#0065eb] ring-offset-1 z-10'
                          : isBlocked
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50 font-normal'
                            : hasFee
                              ? 'bg-blue-50/70 border border-blue-200 text-blue-950 hover:border-[#0065eb] hover:bg-blue-100 font-semibold'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-[#0065eb] hover:bg-blue-50/50 font-medium'
                      }`}
                    >
                      <span className="leading-none">{seat.seat_number}</span>
                      {isHeldByMe && paxIdx !== null && (
                        <span className="text-[7px] font-black bg-white/25 px-1 rounded mt-0.5 leading-tight">
                          HK{paxIdx + 1}
                        </span>
                      )}
                      {!isHeldByMe && hasFee && (
                        <span className="text-[7px] font-bold text-[#0065eb] leading-tight">
                          +{Math.round(seat.extra_fee / 1000)}k
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Center Aisle with Row Number */}
              <div className="w-8 text-center text-[10px] font-mono font-bold text-slate-400 select-none">
                {rowNum}
              </div>

              {/* Right 3 seats */}
              <div className="flex items-center gap-1">
                {right.map((seat, cIdx) => {
                  if (!seat) return <div key={cIdx} className="w-9 h-9 opacity-0" />;
                  const hold = activeHoldsMap.get(seat.id);
                  const isHeldByMe = !!hold;
                  const isBlocked = seat.status !== SeatStatusEnum.AVAILABLE && !isHeldByMe;
                  const paxIdx = hold ? hold.passenger_index : null;
                  const hasFee = seat.extra_fee > 0;

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={isBlocked}
                      onClick={() => handleSeatClick(seat)}
                      title={`Ghế ${seat.seat_number} (${seat.seat_type}) ${
                        hasFee
                          ? `- Phụ phí: +${seat.extra_fee.toLocaleString('vi-VN')} VNĐ`
                          : '- Miễn phí'
                      }`}
                      className={`w-9 h-9 rounded-lg font-mono text-xs flex flex-col items-center justify-center cursor-pointer select-none relative transition-colors ${
                        isHeldByMe
                          ? 'bg-[#0065eb] text-white font-bold ring-2 ring-[#0065eb] ring-offset-1 z-10'
                          : isBlocked
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50 font-normal'
                            : hasFee
                              ? 'bg-blue-50/70 border border-blue-200 text-blue-950 hover:border-[#0065eb] hover:bg-blue-100 font-semibold'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-[#0065eb] hover:bg-blue-50/50 font-medium'
                      }`}
                    >
                      <span className="leading-none">{seat.seat_number}</span>
                      {isHeldByMe && paxIdx !== null && (
                        <span className="text-[7px] font-black bg-white/25 px-1 rounded mt-0.5 leading-tight">
                          HK{paxIdx + 1}
                        </span>
                      )}
                      {!isHeldByMe && hasFee && (
                        <span className="text-[7px] font-bold text-[#0065eb] leading-tight">
                          +{Math.round(seat.extra_fee / 1000)}k
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-1 rounded-full bg-slate-200/80 text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-2">
          Đuôi Máy Bay
        </div>
      </div>
    </div>
  );
};
