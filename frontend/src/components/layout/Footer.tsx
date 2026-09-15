import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f4f7fa] border-t border-slate-200/80 pt-10 pb-8 mt-16 font-sans">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        
        {/* Expedia Logo */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 focus:outline-none cursor-pointer">
            <div className="w-5 h-5 bg-[#0065eb] flex items-center justify-center rounded-md font-bold text-white">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
              expedia group
            </span>
          </Link>
        </div>

        {/* 4-Column Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-[11px] sm:text-[12px]">
          
          {/* Column 1: Công ty */}
          <div className="flex flex-col gap-1.5">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">Về Chúng Tôi</h4>
            <Link to="/maintenance" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Giới thiệu UITAir</Link>
            <Link to="/maintenance" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Cơ hội nghề nghiệp</Link>
            <Link to="/maintenance" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Truyền thông & Tin tức</Link>
            <Link to="/maintenance" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Đối tác đối soát hãng bay</Link>
          </div>

          {/* Column 2: Khám phá & Tiện ích */}
          <div className="flex flex-col gap-1.5">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">Dịch Vụ Bay</h4>
            <Link to="/check-in" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Check-in trực tuyến 24h</Link>
            <Link to="/flight-status" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Tra cứu tình trạng chuyến bay</Link>
            <Link to="/my-bookings" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Quản lý vé & Chuyến đi</Link>
            <Link to="/price-alerts" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Cảnh báo giá rẻ tự động</Link>
          </div>

          {/* Column 3: Điều khoản & Chính sách */}
          <div className="flex flex-col gap-1.5">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">Chính Sách</h4>
            <Link to="/pages/privacy" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Chính sách bảo mật</Link>
            <Link to="/pages/terms" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Điều khoản sử dụng dịch vụ</Link>
            <Link to="/maintenance" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Quy định về Cookie</Link>
            <Link to="/maintenance" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Quy định hành lý & Hoàn vé</Link>
          </div>

          {/* Column 4: Trợ giúp */}
          <div className="flex flex-col gap-1.5">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">Trung Tâm Trợ Giúp</h4>
            <Link to="/support" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Gửi yêu cầu hỗ trợ (Support Desk)</Link>
            <Link to="/booking-lookup" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Tra cứu mã đặt chỗ PNR</Link>
            <Link to="/maintenance" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Hướng dẫn hoàn tiền</Link>
          </div>

        </div>

        {/* Bottom Copyright Notice */}
        <div className="border-t border-slate-200/90 mt-10 pt-6 text-center text-[10px] sm:text-[11px] text-slate-500 font-normal leading-relaxed">
          <p className="font-semibold text-slate-700">Hệ thống đặt vé máy bay trực tuyến – Đồ án Nhóm 2</p>
          <p>© 2026 TRẦN NGỌC HUY (25410232) • ĐẶNG VĂN HẬU (25410203) • NGUYỄN THANH DUY (25410194) • NGUYỄN THỊ HỒNG MINH (25410256)</p>
        </div>

      </div>
    </footer>
  );
};
