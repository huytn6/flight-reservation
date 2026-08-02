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
  { label: 'Flight', amountText: '$103.00', isIndent: true },
  { label: 'Taxes, fees, and charges', amountText: '$17.20', isIndent: true, hasInfoIcon: true },
];

export const PriceSummaryCard: React.FC<PriceSummaryCardProps> = ({
  title = 'Price details',
  travelerLabel = 'Traveler 1: Adult',
  travelerTotalText = '$120.20',
  breakdowns = DEFAULT_BREAKDOWNS,
  seatsLeftBadgeText = '4 left at',
  totalAmountText = '$120.20',
  currencySubtext = 'Rates are shown in US dollars',
  checkoutButtonLabel = 'Next: Checkout',
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
          Trip total
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
