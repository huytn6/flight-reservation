import React, { useState } from 'react';
import { X, CheckCircle2, DollarSign, Scale, ShieldCheck, Heart } from 'lucide-react';
import type { FlightResultItem } from './FlightCard';
import { FlightDetailModal } from './FlightDetailModal';
import type { FareOption } from '@/services/flight';

const CABIN_LABELS: Record<string, string> = {
  ECONOMY: 'Phổ thông',
  PREMIUM_ECONOMY: 'Phổ thông đặc biệt',
  BUSINESS: 'Thương gia',
  FIRST: 'Hạng nhất',
};

export interface FlightDetailDrawerProps {
  isOpen: boolean;
  flight: FlightResultItem | null;
  fare?: FareOption | null;
  onClose: () => void;
  onSelectFare: (flight: FlightResultItem) => void;
  onOpenFareComparison?: () => void;
  onOpenFareRules?: () => void;
  onToggleSave?: () => void;
  isSaved?: boolean;
  confirmLabel?: string;
}

export const FlightDetailDrawer: React.FC<FlightDetailDrawerProps> = ({
  isOpen,
  flight,
  fare,
  onClose,
  onSelectFare,
  onOpenFareComparison,
  onOpenFareRules,
  onToggleSave,
  isSaved = false,
  confirmLabel = 'Chọn',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isOpen || !flight) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 transition-opacity"
      />

      {/* Slide-over Right Sidebar Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-lg z-40 overflow-y-auto flex flex-col font-sans border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              Review fare to {flight.arrivalCity}
            </h2>
          </div>

          {onToggleSave && (
            <button
              onClick={onToggleSave}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isSaved
                  ? 'border-rose-200 bg-rose-50 text-rose-500'
                  : 'border-slate-200 bg-white text-slate-500 hover:text-rose-500 hover:border-rose-200'
              }`}
              title={isSaved ? 'Đã lưu chuyến bay' : 'Lưu chuyến bay'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 flex flex-col gap-5 flex-1">
          
          {/* Selected Flight Summary Header */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              <span>{flight.departureTime} - {flight.arrivalTime}</span>
              <span className="text-sm font-semibold text-slate-700">({flight.duration}, {flight.stops.toLowerCase()})</span>
              {flight.arrivalDayNext && (
                <sup className="text-xs font-bold text-red-600 -ml-1">{flight.arrivalDayNext}</sup>
              )}
            </div>

            {/* Airline Logo & Name */}
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-4 h-4 bg-[#e30613] text-white font-extrabold text-[7px] italic rounded flex items-center justify-center shrink-0 select-none">
                vj
              </div>
              <span className="text-xs font-bold text-slate-900">
                {flight.airline}
              </span>
            </div>

            {/* Links & Notice */}
            <div className="flex items-center gap-3 mt-1">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-[#0065eb] hover:underline font-medium cursor-pointer"
              >
                Flight details
              </button>
            </div>

            {/* Actions: So sánh các hạng vé & Quy định vé & Hành lý */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 mt-2">
              {onOpenFareComparison && (
                <button
                  onClick={onOpenFareComparison}
                  className="flex items-center gap-2 text-xs text-[#0065eb] hover:underline py-1 font-medium transition-colors cursor-pointer w-fit"
                >
                  <Scale className="w-3.5 h-3.5 shrink-0" />
                  <span>So sánh các hạng vé</span>
                </button>
              )}

              {onOpenFareRules && (
                <button
                  onClick={onOpenFareRules}
                  className="flex items-center gap-2 text-xs text-slate-700 hover:underline py-1 font-medium transition-colors cursor-pointer w-fit"
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Quy định vé & Hành lý</span>
                </button>
              )}
            </div>

            <span className="text-xs text-slate-500 font-normal leading-tight mt-1">
              All flights will be updated to match the fare you select.
            </span>
          </div>

          {/* Fare Card Container */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">

            {/* Total price & Subtext */}
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {flight.price.toLocaleString('vi-VN')} đ
              </span>
              <span className="text-xs text-slate-500 font-normal mt-0.5">
                {flight.roundtripLabel || 'Giá vé đã gồm thuế & phí'} · 1 hành khách
              </span>
            </div>

            {/* Cabin Class Title */}
            <div className="text-xs font-bold text-slate-900 border-t border-gray-100 pt-3">
              Hạng ghế: {CABIN_LABELS[fare?.cabin_code || 'ECONOMY'] || fare?.cabin_name || 'Phổ thông'}
            </div>

            {/* Included Benefits checklist */}
            <div className="flex flex-col gap-3 text-xs sm:text-sm text-slate-800 font-medium">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1b7b4a] shrink-0 stroke-[2.5]" />
                <span>Hành lý xách tay: {fare?.carry_on_kg ?? 7} kg</span>
              </div>

              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1b7b4a] shrink-0 stroke-[2.5]" />
                <span>Hành lý ký gửi: {fare?.baggage_kg ?? 0} kg</span>
              </div>

              <div className={`flex items-center gap-2.5 ${fare?.is_refundable ? 'text-slate-800' : 'text-slate-600'}`}>
                {fare?.is_refundable ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1b7b4a] shrink-0 stroke-[2.5]" />
                ) : (
                  <X className="w-4 h-4 text-slate-500 shrink-0 stroke-[2]" />
                )}
                <span>{fare?.is_refundable ? 'Được hoàn vé' : 'Không hoàn vé'}</span>
              </div>

              <div className="flex items-center justify-between gap-2 text-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <DollarSign className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Phí đổi vé:</span>
                </div>
                <span className="text-slate-900 font-bold">
                  {fare?.is_changeable
                    ? `${(fare?.change_fee ?? 0).toLocaleString('vi-VN')} đ`
                    : 'Không đổi được'}
                </span>
              </div>
            </div>

            {/* Primary Select Action Button */}
            <div className="mt-2 pt-1">
              <button
                onClick={() => onSelectFare(flight)}
                className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-bold rounded-full py-3 px-6 text-sm shadow-xs transition-colors cursor-pointer"
              >
                {confirmLabel}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Flight Detail Modal Popup */}
      <FlightDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        flight={flight}
      />
    </>
  );
};

