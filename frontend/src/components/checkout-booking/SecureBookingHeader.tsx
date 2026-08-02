import React from 'react';
import { ChevronRight } from 'lucide-react';

export const SecureBookingHeader: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
        Secure booking - only takes a few minutes!
      </h1>

      {/* Free cancellation Banner */}
      <div className="bg-white rounded-md border border-slate-200 p-4 sm:p-4.5 flex items-center gap-3.5 shadow-2xs">
        <img 
          src="https://a.travel-assets.com/travel-assets-manager/pictogram-bex/light__calendar_shield.svg" 
          alt="Free cancellation" 
          className="w-10 h-10 shrink-0 object-contain" 
        />
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-slate-900 leading-snug">
            Free cancellation if plans change
          </span>
          <span className="text-xs text-slate-600 font-normal mt-0.5 leading-relaxed">
            There's no fee to cancel within 24 hours of booking.
          </span>
        </div>
      </div>

      {/* Unlock Member Prices Black Banner */}
      <div className="bg-[#182232] hover:bg-[#121a28] rounded-md p-3.5 sm:p-4 text-white flex items-center justify-between cursor-pointer transition-colors shadow-2xs">
        <div className="flex items-center gap-3.5">
          {/* OneKey Starburst Icon */}
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <div className="grid grid-cols-3 gap-0.5 rotate-45">
              <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
              <div className="w-1.5 h-1.5 bg-transparent"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
            </div>
          </div>

          <span className="text-xs sm:text-sm font-semibold tracking-tight">
            Unlock Member Prices and more when you sign in or create an account
          </span>
        </div>

        <ChevronRight className="w-5 h-5 text-white shrink-0 stroke-[2.5]" />
      </div>

    </div>
  );
};
