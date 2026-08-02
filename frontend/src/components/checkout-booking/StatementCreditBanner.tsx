import React from 'react';

export const StatementCreditBanner: React.FC = () => {
  return (
    <div className="rounded-md border border-slate-300 overflow-hidden font-sans bg-white shadow-2xs">
      
      {/* Top Banner Header Bar */}
      <div className="bg-[#dbe7f7] text-[#141d38] font-bold text-xs sm:text-sm py-1.5 px-3 text-center border-b border-slate-300">
        Get $100 back from this trip
      </div>

      {/* Main Body */}
      <div className="bg-white p-3.5 sm:p-4 flex flex-col md:flex-row items-start justify-between gap-4 sm:gap-5">
        
        {/* Left: Card Image & Info */}
        <div className="flex items-start gap-3.5">
          {/* Card Mockup Image */}
          <div className="flex flex-col items-center shrink-0">
            <img 
              src="/one-key-credit-card-front.webp" 
              alt="OneKey credit card" 
              className="w-16 sm:w-18 h-auto shrink-0 rounded-md object-contain shadow-2xs" 
            />
            <button className="text-xs text-[#0065eb] hover:underline font-normal mt-1 text-center cursor-pointer">
              No annual fee
            </button>
          </div>

          {/* Offer Title & Subtitle */}
          <div className="flex flex-col pt-0.5">
            <h3 className="text-sm sm:text-lg font-bold text-[#141d38] leading-snug tracking-tight">
              Get a $100 statement credit<br className="hidden sm:inline" /> + $150 in OneKeyCash*
            </h3>
            <span className="text-xs text-[#526077] font-normal mt-1">
              *after qualifying purchases. Terms apply.
            </span>
          </div>
        </div>

        {/* Right: Pricing Breakdown & CTA */}
        <div className="flex flex-col w-full md:w-auto min-w-[240px] md:min-w-[260px]">
          <div className="flex items-center justify-between text-xs sm:text-sm text-[#526077] font-normal py-0.5">
            <span>You pay</span>
            <span className="text-[#526077] font-normal">$120.20</span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#107038] py-0.5">
            <span>Statement credit</span>
            <span className="font-bold">-$100.00</span>
          </div>

          <div className="h-[1px] bg-slate-300 w-full my-1" />

          <div className="flex items-center justify-between text-xs sm:text-sm text-[#526077] font-normal py-0.5">
            <span>Total after statement credit</span>
            <span className="text-[#526077] font-normal">$20.20</span>
          </div>

          <button className="mt-2.5 w-full bg-[#0065eb] hover:bg-[#0054c7] text-white font-bold text-sm rounded-lg py-2 px-5 border border-[#0050bc] transition-colors cursor-pointer text-center shadow-2xs">
            Get started
          </button>

          <span className="text-xs text-[#526077] font-normal text-center mt-1.5 leading-tight">
            Check if you're approved with no impact to your credit.
          </span>
        </div>

      </div>

    </div>
  );
};
