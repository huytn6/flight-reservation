import React from 'react';
import { Button } from '@/components/ui/button';
import { Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FlightDealsSectionProps {
  title?: string;
  onExploreClick?: () => void;
}

export const FlightDealsSection: React.FC<FlightDealsSectionProps> = ({
  title = 'Ưu Đãi Vé Máy Bay Từ TP. Hồ Chí Minh',
  onExploreClick,
}) => {
  const navigate = useNavigate();

  const handleExplore = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      navigate('/flights/search');
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 mb-16 font-sans">
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-[#141d38] mb-4 tracking-tight">
        {title}
      </h2>

      {/* Real Map Box */}
      <div className="relative w-full h-[340px] sm:h-[380px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-[#50cadf] select-none">
        
        {/* Real Interactive Google Map */}
        <iframe
          title="Bản đồ ưu đãi chuyến bay"
          src="https://maps.google.com/maps?q=Vietnam&t=m&z=3&ie=UTF-8&iwloc=&output=embed"
          className="absolute inset-0 w-full h-full border-0 saturate-[1.1] brightness-[1.02] opacity-90 pointer-events-auto"
          loading="lazy"
        />

        {/* Overlay Flight Routes & Dashed Equator */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 400" preserveAspectRatio="none">
          <line x1="0" y1="230" x2="1000" y2="230" stroke="#1b253b" strokeWidth="1.5" strokeDasharray="8,6" opacity="0.35" />
          <path d="M535,0 L535,190 L630,220 L630,400" stroke="#1b253b" strokeWidth="1.5" strokeDasharray="8,6" fill="none" opacity="0.35" />
          <path d="M260,180 Q380,210 500,230" stroke="#1b253b" strokeWidth="2" strokeDasharray="5,5" fill="none" opacity="0.5" />
        </svg>

        {/* Location Flight Marker Pin over Vietnam region */}
        <div className="absolute top-[38%] left-[24%] sm:left-[25%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-[#1b253b] text-white flex items-center justify-center shadow-xl border-2 border-white group-hover:scale-110 transition-transform">
            <Plane className="w-5 h-5 text-white transform -rotate-45" />
          </div>
        </div>

        {/* Center CTA Button "Khám Phá Tất Cả Ưu Đãi Chuyến Bay" */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <Button 
            onClick={handleExplore}
            className="pointer-events-auto bg-[#29425a] hover:bg-[#1c3044] text-white text-xs sm:text-sm font-semibold rounded-full px-6 py-3 shadow-xl transition-all border border-slate-600/30 cursor-pointer"
          >
            Khám Phá Tất Cả Ưu Đãi Chuyến Bay
          </Button>
        </div>

        {/* Google Logo Bottom Left */}
        <div className="absolute bottom-3 left-4 z-20 flex items-center gap-0.5 select-none pointer-events-none bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
          <span className="text-base font-bold tracking-tighter text-[#4285F4]">G</span>
          <span className="text-base font-bold tracking-tighter text-[#EA4335]">o</span>
          <span className="text-base font-bold tracking-tighter text-[#FBBC05]">o</span>
          <span className="text-base font-bold tracking-tighter text-[#4285F4]">g</span>
          <span className="text-base font-bold tracking-tighter text-[#34A853]">l</span>
          <span className="text-base font-bold tracking-tighter text-[#EA4335]">e</span>
        </div>
      </div>
    </div>
  );
};
