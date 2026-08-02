import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export const WatchPricesWidget: React.FC = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-4 shadow-xs flex items-center justify-between gap-3 text-slate-900">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#dbebff] text-[#0065eb] flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900 leading-tight">Watch prices</span>
          <span className="text-[11px] text-slate-600 font-normal leading-tight mt-0.5">
            Get notified when prices change
          </span>
        </div>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-10 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
          enabled ? 'bg-[#0065eb] justify-end' : 'bg-slate-400 justify-start'
        }`}
      >
        <div className="w-5 h-5 rounded-full bg-white shadow-xs flex items-center justify-center text-[10px] font-bold text-slate-500">
          {enabled ? '' : '✕'}
        </div>
      </button>
    </div>
  );
};
