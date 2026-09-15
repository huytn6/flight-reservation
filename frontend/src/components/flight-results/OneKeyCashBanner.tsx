import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const OneKeyCashBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#131b31] rounded-2xl p-4 sm:p-5 text-white flex items-center justify-between gap-4 shadow-sm my-1">
      <div className="flex items-center gap-3.5">
        {/* Starburst Points Icon */}
        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-white animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>

        <span className="font-bold text-xs sm:text-sm text-white tracking-tight">
          Nhận thêm OneKeyCash cùng dặm bay khi bạn đăng nhập và đặt vé
        </span>
      </div>

      <Button
        onClick={() => navigate('/signin')}
        className="bg-[#0065eb] hover:bg-blue-700 text-white font-bold text-xs rounded-full px-5 py-2.5 shrink-0 self-start sm:self-center"
      >
        Đăng nhập
      </Button>
    </div>
  );
};
