import { Button } from '@heroui/react';
import { Plane } from 'lucide-react';

export const PromotionBanner = () => {
  return (
    <div className="max-w-[1060px] mx-auto px-4 mb-12">
      <div className="bg-[#12182b] rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        
        {/* Left Icon & Text Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Plane className="w-6 h-6 text-blue-300 transform -rotate-45" />
          </div>

          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg sm:text-xl font-bold font-serif tracking-tight text-white">
              Summer flight deals: Up to 25% off
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-normal">
              Plan a quick getaway—find deals on last-minute flight tickets.
            </p>
          </div>
        </div>

        {/* Right Action Button */}
        <Button 
          className="bg-white hover:bg-gray-100 text-[#12182b] font-bold text-xs sm:text-sm rounded-full px-6 py-2.5 h-auto transition-colors shrink-0 self-start sm:self-center"
        >
          Book now
        </Button>

      </div>
    </div>
  );
};
