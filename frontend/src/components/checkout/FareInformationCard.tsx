import React from 'react';
import { Check, X } from 'lucide-react';

export interface FareFeatureItem {
  text: string;
  included: boolean;
}

export interface FareInformationCardProps {
  cabinClassTitle?: string;
  features?: FareFeatureItem[];
}

const DEFAULT_FEATURES: FareFeatureItem[] = [
  { text: 'Bao gồm hành lý xách tay (7kg)', included: true },
  { text: 'Bao gồm 1 hành lý ký gửi (20kg)', included: true },
  { text: 'Không hoàn tiền', included: false },
  { text: 'Không được đổi vé', included: false },
];

export const FareInformationCard: React.FC<FareInformationCardProps> = ({
  cabinClassTitle = 'Phổ thông',
  features = DEFAULT_FEATURES,
}) => {
  return (
    <div className="bg-transparent rounded-2xl border border-slate-200 p-5 sm:p-6 font-sans flex flex-col gap-4">
      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
        Hạng vé của bạn: {cabinClassTitle}
      </h3>

      <div className="flex flex-col gap-3.5">
        {features.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm">
            {item.included ? (
              <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            ) : (
              <div className="w-4 h-4 flex items-center justify-center shrink-0 text-slate-500">
                <X className="w-4 h-4 stroke-[2]" />
              </div>
            )}
            <span className="text-slate-800 font-medium">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
