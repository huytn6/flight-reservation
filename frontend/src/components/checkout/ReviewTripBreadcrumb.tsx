import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const ReviewTripBreadcrumb: React.FC = () => {
  return (
    <nav aria-label="Đường dẫn điều hướng" className="flex items-center gap-2 text-xs sm:text-sm font-sans mb-1">
      <Link to="/Flights-Search" className="font-bold text-slate-900 hover:text-[#0065eb] transition-colors">
        Chuyến bay của bạn
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
      <span className="text-slate-500 font-normal">
        Thanh toán
      </span>
    </nav>
  );
};
