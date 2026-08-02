import React from 'react';
import { Info } from 'lucide-react';

export interface PriceRowProps {
  label: string;
  amountText: string;
  hasInfoIcon?: boolean;
  isIndent?: boolean;
  isBold?: boolean;
}

export const PriceRow: React.FC<PriceRowProps> = ({
  label,
  amountText,
  hasInfoIcon = false,
  isIndent = false,
  isBold = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-2 text-xs sm:text-sm font-sans ${
        isIndent ? 'pl-3 text-slate-700 font-normal' : isBold ? 'font-bold text-slate-900' : 'text-slate-800 font-medium'
      }`}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {hasInfoIcon && <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 cursor-pointer hover:text-slate-800" />}
      </div>
      <span className={isBold ? 'text-slate-900 font-bold' : 'text-slate-900 font-normal'}>
        {amountText}
      </span>
    </div>
  );
};
