import React from 'react';
import { Plane, Luggage, DollarSign, ShoppingBag, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TravelValueBanners: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 space-y-6 mb-16 font-sans">
      
      {/* Top Section: 3-column Light Background Feature Banner */}
      <div className="bg-[#f2f6fa] rounded-3xl p-8 sm:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 text-center">
          
          {/* Column 1: Bundle & Save */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4 flex items-center justify-center h-14">
              <Luggage className="w-10 h-10 text-[#2b437e]" strokeWidth={1.8} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0065eb] border-2 border-[#f2f6fa] flex items-center justify-center shadow-xs">
                <DollarSign className="w-3.5 h-3.5 text-white stroke-[3]" />
              </div>
            </div>
            
            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2 tracking-tight">
              Đặt Trọn Gói &amp; Tiết Kiệm
            </h3>
            
            <p className="text-slate-600 text-xs sm:text-sm max-w-[240px] mb-6 leading-relaxed">
              Tiết kiệm chi phí tối đa dù bạn đặt vé từng chặng hay chọn trọn gói dịch vụ
            </p>
            
            <button 
              onClick={() => navigate('/flights/search')}
              className="mt-auto border border-[#0065eb] text-[#0065eb] hover:bg-blue-50 font-semibold text-xs sm:text-sm px-5 py-2 rounded-full transition-colors cursor-pointer"
            >
              Bắt đầu ngay
            </button>
          </div>

          {/* Column 2: One-stop travel shop */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4 flex items-center justify-center h-14">
              <div className="relative flex items-center justify-center">
                <Luggage className="w-9 h-9 text-[#2b437e] translate-x-1" strokeWidth={1.8} />
                <Plane className="w-6 h-6 text-[#2b437e] absolute -top-3 -left-3 transform -rotate-45" strokeWidth={2} />
                <ShoppingBag className="w-5 h-5 text-[#3b5998] absolute -bottom-1 -left-2" strokeWidth={1.8} />
              </div>
            </div>
            
            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2 tracking-tight">
              Tất-Cả-Trong-Một
            </h3>
            
            <p className="text-slate-600 text-xs sm:text-sm max-w-[260px] mb-6 leading-relaxed">
              Đặt vé máy bay, quản lý hành lý và dịch vụ chuyến bay tại một hệ thống duy nhất
            </p>
            
            <button 
              onClick={() => navigate('/flights/search')}
              className="mt-auto border border-[#0065eb] text-[#0065eb] hover:bg-blue-50 font-semibold text-xs sm:text-sm px-5 py-2 rounded-full transition-colors cursor-pointer"
            >
              Lên kế hoạch
            </button>
          </div>

          {/* Column 3: One Key rewards */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4 flex items-center justify-center h-14">
              <div className="relative w-11 h-11 flex items-center justify-center">
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
            
            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2 tracking-tight">
              Điểm Thưởng Thành Viên
            </h3>
            
            <p className="text-slate-600 text-xs sm:text-sm max-w-[260px] mb-6 leading-relaxed">
              Tích lũy điểm thưởng thành viên trực tiếp trên từng vé máy bay đã đặt
            </p>
            
            <button 
              onClick={() => navigate('/register')}
              className="mt-auto border border-[#0065eb] text-[#0065eb] hover:bg-blue-50 font-semibold text-xs sm:text-sm px-5 py-2 rounded-full transition-colors cursor-pointer"
            >
              Đăng ký miễn phí
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Section: 2-column Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: 15% off activities */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between items-start shadow-2xs hover:shadow-md transition-shadow">
          <div>
            <span className="inline-block bg-[#ffdb00] text-slate-900 font-bold text-[11px] sm:text-xs px-2.5 py-1 rounded-md mb-3">
              Nổi Bật
            </span>
            
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              Ưu đãi giảm 15% dịch vụ
            </h3>
            
            <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
              Hoàn thiện chuyến đi của bạn. Tiết kiệm trung bình 15% cho hành lý và dịch vụ đi kèm.
            </p>
          </div>

          <button 
            onClick={() => navigate('/flights/search')}
            className="border border-[#0065eb] text-[#0065eb] hover:bg-blue-50 font-semibold text-xs sm:text-sm px-5 py-2 rounded-full transition-colors cursor-pointer"
          >
            Đặt ngay
          </button>
        </div>

        {/* Card 2: Popular city breaks */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between items-start shadow-2xs hover:shadow-md transition-shadow">
          <div>
            <span className="inline-block bg-[#ffdb00] text-slate-900 font-bold text-[11px] sm:text-xs px-2.5 py-1 rounded-md mb-3">
              Khuyến Mãi
            </span>
            
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              Điểm Đến Hàng Đầu
            </h3>
            
            <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
              Khám phá các chặng bay nội địa &amp; quốc tế được khách hàng lựa chọn nhiều nhất
            </p>
          </div>

          <button 
            onClick={() => navigate('/flights/search')}
            className="border border-[#0065eb] text-[#0065eb] hover:bg-blue-50 font-semibold text-xs sm:text-sm px-5 py-2 rounded-full transition-colors cursor-pointer"
          >
            Xem tất cả ưu đãi
          </button>
        </div>

      </div>

    </div>
  );
};
