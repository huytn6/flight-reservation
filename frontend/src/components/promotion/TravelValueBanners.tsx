import React from 'react';
import { Plane, Luggage, DollarSign, ShoppingBag, Sparkles } from 'lucide-react';

export const TravelValueBanners: React.FC = () => {
  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 space-y-6 mb-16">
      
      {/* Top Section: 3-column Light Background Feature Banner */}
      <div className="bg-[#f2f6fa] rounded-3xl p-8 sm:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 text-center">
          
          {/* Column 1: Bundle & Save */}
          <div className="flex flex-col items-center">
            {/* Icon */}
            <div className="relative mb-4 flex items-center justify-center h-14">
              <Luggage className="w-10 h-10 text-[#2b437e]" strokeWidth={1.8} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0065eb] border-2 border-[#f2f6fa] flex items-center justify-center shadow-xs">
                <DollarSign className="w-3.5 h-3.5 text-white stroke-[3]" />
              </div>
            </div>
            
            {/* Title */}
            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2 tracking-tight">
              Bundle &amp; Save
            </h3>
            
            {/* Description */}
            <p className="text-slate-600 text-xs sm:text-sm max-w-[240px] mb-6 leading-relaxed">
              Save whether you book your trip all at once, or over time
            </p>
            
            {/* CTA Button */}
            <button className="mt-auto border border-[#0065eb] text-[#0065eb] hover:bg-blue-50 font-semibold text-xs sm:text-sm px-5 py-2 rounded-full transition-colors cursor-pointer">
              Get started
            </button>
          </div>

          {/* Column 2: One-stop travel shop */}
          <div className="flex flex-col items-center">
            {/* Icon */}
            <div className="relative mb-4 flex items-center justify-center h-14">
              <div className="relative flex items-center justify-center">
                <Luggage className="w-9 h-9 text-[#2b437e] translate-x-1" strokeWidth={1.8} />
                <Plane className="w-6 h-6 text-[#2b437e] absolute -top-3 -left-3 transform -rotate-45" strokeWidth={2} />
                <ShoppingBag className="w-5 h-5 text-[#3b5998] absolute -bottom-1 -left-2" strokeWidth={1.8} />
              </div>
            </div>
            
            {/* Title */}
            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2 tracking-tight">
              One-stop travel shop
            </h3>
            
            {/* Description */}
            <p className="text-slate-600 text-xs sm:text-sm max-w-[260px] mb-6 leading-relaxed">
              Book flights, hotels, homes, cars and more - all in one place
            </p>
            
            {/* CTA Button */}
            <button className="mt-auto border border-[#0065eb] text-[#0065eb] hover:bg-blue-50 font-semibold text-xs sm:text-sm px-5 py-2 rounded-full transition-colors cursor-pointer">
              Start planning
            </button>
          </div>

          {/* Column 3: One Key rewards */}
          <div className="flex flex-col items-center">
            {/* Icon: OneKey Starburst Ring */}
            <div className="relative mb-4 flex items-center justify-center h-14">
              <div className="relative w-11 h-11 flex items-center justify-center">
                {/* Ring of 8 yellow diamond specs */}
                <div className="grid grid-cols-3 gap-1 rotate-45">
                  <div className="w-2 h-2 bg-[#f59e0b] rounded-xs"></div>
                  <div className="w-2 h-2 bg-[#f59e0b] rounded-xs"></div>
                  <div className="w-2 h-2 bg-[#f59e0b] rounded-xs"></div>
                  <div className="w-2 h-2 bg-[#f59e0b] rounded-xs"></div>
                  <div className="w-2 h-2 bg-transparent"></div>
                  <div className="w-2 h-2 bg-[#f59e0b] rounded-xs"></div>
                  <div className="w-2 h-2 bg-[#f59e0b] rounded-xs"></div>
                  <div className="w-2 h-2 bg-[#f59e0b] rounded-xs"></div>
                </div>
                <Sparkles className="w-4 h-4 text-[#f59e0b] absolute" />
              </div>
            </div>
            
            {/* Title */}
            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2 tracking-tight">
              One Key rewards
            </h3>
            
            {/* Description */}
            <p className="text-slate-600 text-xs sm:text-sm max-w-[260px] mb-6 leading-relaxed">
              Unlock instant savings and earn OneKeyCash to spend on future travel
            </p>
            
            {/* CTA Button */}
            <button className="mt-auto border border-[#0065eb] text-[#0065eb] hover:bg-blue-50 font-semibold text-xs sm:text-sm px-5 py-2 rounded-full transition-colors cursor-pointer">
              Join for free
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Section: 2-column Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: 15% off activities */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between items-start shadow-2xs hover:shadow-md transition-shadow">
          <div>
            {/* Yellow Badge */}
            <span className="inline-block bg-[#ffdb00] text-slate-900 font-bold text-[11px] sm:text-xs px-2.5 py-1 rounded-md mb-3">
              Featured
            </span>
            
            {/* Title */}
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              15% off activities
            </h3>
            
            {/* Description */}
            <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
              Complete your trip. Save an average of 15% on activities with Member Prices.
            </p>
          </div>

          {/* CTA Button */}
          <button className="border border-[#0065eb] text-[#0065eb] hover:bg-blue-50 font-semibold text-xs sm:text-sm px-5 py-2 rounded-full transition-colors cursor-pointer">
            Book now
          </button>
        </div>

        {/* Card 2: Popular city breaks */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between items-start shadow-2xs hover:shadow-md transition-shadow">
          <div>
            {/* Yellow Badge */}
            <span className="inline-block bg-[#ffdb00] text-slate-900 font-bold text-[11px] sm:text-xs px-2.5 py-1 rounded-md mb-3">
              Promotion
            </span>
            
            {/* Title */}
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              Popular city breaks
            </h3>
            
            {/* Description */}
            <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
              Save on hotels most loved by travelers like you
            </p>
          </div>

          {/* CTA Button */}
          <button className="border border-[#0065eb] text-[#0065eb] hover:bg-blue-50 font-semibold text-xs sm:text-sm px-5 py-2 rounded-full transition-colors cursor-pointer">
            See all deals
          </button>
        </div>

      </div>

    </div>
  );
};
