import React from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase, Info } from 'lucide-react';

export const BundleSaveBanner: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-1">
      <div className="flex items-center gap-3.5">
        {/* Suitcase with Dollar Icon */}
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center relative shrink-0">
          <Briefcase className="w-6 h-6 text-slate-800" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 font-extrabold text-[10px] text-slate-900 flex items-center justify-center border border-white">
            $
          </div>
        </div>

        <div className="flex flex-col">
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
            Đặt trọn gói tại Hà Nội để tiết kiệm hơn!
          </h4>
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium mt-0.5">
            <span>Tiết kiệm đến 22.700.000₫ khi đặt vé máy bay cùng chỗ ở</span>
            <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </div>
        </div>
      </div>

      <Button
        className="w-full sm:w-auto bg-[#0065eb] hover:bg-blue-700 text-white font-bold rounded-full px-5 py-2.5 text-xs sm:text-sm shadow-xs transition-colors shrink-0 cursor-pointer"
      >
        Xem vé máy bay + chỗ ở
      </Button>
    </div>
  );
};
