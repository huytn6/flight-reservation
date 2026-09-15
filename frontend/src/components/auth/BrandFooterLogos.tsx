import React from 'react';

export const BrandFooterLogos: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-6 pt-6 opacity-80 select-none">
      {/* UITAir Logo */}
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 bg-[#ffdb00] flex items-center justify-center rounded-sm font-bold text-black text-[10px]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </div>
        <span className="text-base font-bold text-slate-900 font-sans tracking-tight">UITAir</span>
      </div>

      {/* Hotels.com Logo */}
      <div className="flex items-center gap-1">
        <div className="w-5 h-5 bg-[#d32f2f] text-white flex items-center justify-center rounded-xs text-[11px] font-extrabold">H</div>
        <span className="text-sm font-extrabold text-slate-900 font-sans tracking-tight">Hotels.com</span>
      </div>

      {/* Vrbo Logo */}
      <div className="flex items-center">
        <span className="text-lg font-black tracking-tighter text-[#36528d] font-serif italic">Vrbo</span>
      </div>
    </div>
  );
};
