import React from 'react';
import { PriceRow } from './PriceRow';
import { CheckoutButton } from './CheckoutButton';

export interface PriceBreakdownItem {
  label: string;
  amountText: string;
  isIndent?: boolean;
  hasInfoIcon?: boolean;
}

export interface PriceSummaryCardProps {
  title?: string;
  travelerLabel?: string;
  travelerTotalText?: string;
  breakdowns?: PriceBreakdownItem[];
  seatsLeftBadgeText?: string;
  totalAmountText?: string;
  currencySubtext?: string;
  checkoutButtonLabel?: string;
  onCheckout?: () => void;
}

const DEFAULT_BREAKDOWNS: PriceBreakdownItem[] = [
  { label: 'Chuyến bay', amountText: '2.400.000₫', isIndent: true },
  { label: 'Thuế, phí và lệ phí', amountText: '400.000₫', isIndent: true, hasInfoIcon: true },
];

export const PriceSummaryCard: React.FC<PriceSummaryCardProps> = ({
  title = 'Chi tiết giá',
  travelerLabel = 'Hành khách 1: Người lớn',
  travelerTotalText = '2.800.000₫',
  breakdowns = DEFAULT_BREAKDOWNS,
  seatsLeftBadgeText = 'Còn 4 chỗ với giá',
  totalAmountText = '2.800.000₫',
  currencySubtext = 'Giá hiển thị bằng đồng Việt Nam',
  checkoutButtonLabel = 'Tiếp theo: Thanh toán',
  onCheckout,
}) => {
  return (
    <div className="bg-transparent rounded-2xl border border-slate-200 p-5 sm:p-6 font-sans flex flex-col gap-4">
      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
        {title}
      </h3>

      {/* Traveler Summary & Breakdown */}
      <div className="flex flex-col gap-2">
        <PriceRow label={travelerLabel} amountText={travelerTotalText} isBold={true} />

        {breakdowns.map((item, idx) => (
          <PriceRow
            key={idx}
            label={item.label}
            amountText={item.amountText}
            isIndent={item.isIndent}
            hasInfoIcon={item.hasInfoIcon}
          />
        ))}
      </div>

      {/* Urgency Badge */}
      {seatsLeftBadgeText && (
        <div className="mt-1">
          <span className="bg-[#b91c1c] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md inline-block">
            {seatsLeftBadgeText}
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="h-[1px] bg-slate-200/80 w-full my-0.5" />

      {/* Trip Total */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-base sm:text-lg font-bold text-slate-900">
          Tổng chuyến đi
        </span>
        <span className="text-xl sm:text-2xl font-bold text-slate-900">
          {totalAmountText}
        </span>
      </div>

      {/* Subtext */}
      {currencySubtext && (
        <div className="text-[11px] text-slate-500 font-normal -mt-2">
          {currencySubtext}
        </div>
      )}

      {/* Checkout Button */}
      <div className="mt-2">
        <CheckoutButton label={checkoutButtonLabel} onClick={onCheckout} />
      </div>
    </div>
  );
};
