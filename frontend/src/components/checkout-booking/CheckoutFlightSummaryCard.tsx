import React from 'react';
import { Check, ChevronDown } from 'lucide-react';

export const CheckoutFlightSummaryCard: React.FC = () => {
  return (
    <div className="bg-white rounded-md border border-slate-200 p-5 font-sans flex flex-col gap-3.5 shadow-2xs sticky top-6">
      
      {/* Header */}
      <div className="flex flex-col">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Roundtrip flight
        </h3>
        <span className="text-xs text-slate-500 font-normal mt-0.5">
          1 ticket: 1 adult
        </span>
      </div>

      <div className="h-[1px] bg-slate-100 w-full" />

      {/* Departure Segment */}
      <div className="flex flex-col gap-0.5">
        <div className="text-xs sm:text-sm font-bold text-slate-900">
          Ho Chi Minh City (SGN) to Hanoi (HAN)
        </div>
        <div className="text-xs text-slate-700 font-semibold mt-0.5">
          Fri, Aug 14
        </div>
        <div className="text-xs text-slate-500 font-normal">
          4:45pm - 6:55pm (2h 10m)
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-3.5 h-3.5 bg-[#e30613] text-white font-extrabold text-[6px] italic rounded flex items-center justify-center shrink-0">
            VJ
          </div>
          <span className="text-xs text-slate-700 font-normal">Vietjet Air 146</span>
        </div>
      </div>

      <div className="h-[1px] bg-slate-100 w-full" />

      {/* Returning Segment */}
      <div className="flex flex-col gap-0.5">
        <div className="text-xs sm:text-sm font-bold text-slate-900">
          Hanoi (HAN) to Ho Chi Minh City (SGN)
        </div>
        <div className="text-xs text-slate-700 font-semibold mt-0.5">
          Fri, Aug 21
        </div>
        <div className="text-xs text-slate-500 font-normal">
          11:25pm - 1:35am <sup>+1</sup> (2h 10m)
        </div>
        <span className="text-xs font-semibold text-red-600">
          Arrives Sat, Aug 22
        </span>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-3.5 h-3.5 bg-[#e30613] text-white font-extrabold text-[6px] italic rounded flex items-center justify-center shrink-0">
            VJ
          </div>
          <span className="text-xs text-slate-700 font-normal">Vietjet Air 169</span>
        </div>
      </div>

      <div className="h-[1px] bg-slate-100 w-full" />

      {/* Smart Choice Notice */}
      <div className="flex items-start gap-2 text-xs text-emerald-800 font-medium leading-tight py-0.5">
        <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5] mt-0.5" />
        <span>Smart choice! Prices may change, so secure your booking soon.</span>
      </div>

      <div className="h-[1px] bg-slate-100 w-full" />

      {/* Your price summary */}
      <div className="flex flex-col gap-2.5 pt-0.5">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
          Your price summary
        </h4>

        <div className="flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-1 text-[#0065eb] cursor-pointer hover:underline">
            <span>Traveler 1: Adult</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
          <span className="text-slate-900 font-semibold">$120.20</span>
        </div>

        <div className="h-[1px] bg-slate-100 w-full my-1" />

        <div className="flex items-center justify-between text-sm font-bold text-slate-900">
          <span>Total (USD)</span>
          <span>$120.20</span>
        </div>
      </div>

    </div>
  );
};
