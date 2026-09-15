import React from 'react';

export interface PriceDropProtectionCardProps {
  priceText?: string;
  subtext?: string;
  onAddClick?: () => void;
  onHowItWorksClick?: () => void;
}

export const PriceDropProtectionCard: React.FC<PriceDropProtectionCardProps> = ({
  priceText = '+96.000₫',
  subtext = 'Khứ hồi cho mỗi hành khách',
  onAddClick,
  onHowItWorksClick,
}) => {
  return (
    <div className="bg-transparent rounded-2xl border border-slate-200 p-5 sm:p-6 font-sans relative flex flex-col justify-between min-h-[160px]">
      
      {/* Top Main Section: Icon + Description */}
      <div className="flex items-start gap-4">
        {/* Shield Protection Icon */}
        <div className="w-10 h-10 rounded-xl bg-slate-100/70 flex items-center justify-center shrink-0">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 3L5 7V15C5 21.8 9.7 28.1 16 30C22.3 28.1 27 21.8 27 15V7L16 3Z" fill="#3b82f6" opacity="0.2" />
            <path d="M16 5L7 8.5V14.5C7 20.3 10.9 25.7 16 27.3C21.1 25.7 25 20.3 25 14.5V8.5L16 5Z" stroke="#0065eb" strokeWidth="2" strokeLinejoin="round" />
            <path d="M11 15L14.5 18.5L21 12" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Text Content */}
        <div className="flex flex-col text-left">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            Bảo vệ giá vé
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-normal mt-1 leading-relaxed max-w-md">
            Chúng tôi sẽ hoàn lại phần chênh lệch nếu giá vé giảm trước khi bạn bay.
          </p>
          <button
            onClick={onHowItWorksClick}
            className="text-xs font-semibold text-[#0065eb] hover:underline mt-1.5 self-start cursor-pointer"
          >
            Cách thức hoạt động
          </button>
        </div>
      </div>

      {/* Bottom Row: Add to flight Button (Left) & Price Tag (Right) */}
      <div className="flex items-end justify-between mt-6 pt-2">
        <button
          onClick={onAddClick}
          className="border border-[#0065eb] text-[#0065eb] hover:bg-blue-50 font-semibold text-xs sm:text-sm px-5 py-2 rounded-full transition-colors cursor-pointer"
        >
          Thêm vào chuyến bay
        </button>

        <div className="flex flex-col items-end text-right">
          <span className="text-lg sm:text-xl font-bold text-slate-900 leading-none">
            {priceText}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-500 font-normal mt-0.5">
            {subtext}
          </span>
        </div>
      </div>

    </div>
  );
};
