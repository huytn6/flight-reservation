import React from 'react';

export interface CancellationPolicyCardProps {
  title?: string;
  description?: string;
}

export const CancellationPolicyCard: React.FC<CancellationPolicyCardProps> = ({
  title = 'Miễn phí hủy vé',
  description = "Không mất phí khi hủy trong vòng 24 giờ sau khi đặt.",
}) => {
  return (
    <div className="bg-transparent rounded-2xl border border-slate-200 p-5 font-sans flex items-center gap-3.5">
      {/* UITAir calendar shield visual */}
      <img
        src="https://a.travel-assets.com/travel-assets-manager/pictogram-bex/light__calendar_shield.svg"
        alt="Miễn phí hủy vé"
        className="w-10 h-10 shrink-0 object-contain" 
      />

      <div className="flex flex-col text-left">
        <span className="text-sm font-bold text-slate-900 leading-snug">
          {title}
        </span>
        <span className="text-xs text-slate-600 font-normal mt-0.5 leading-relaxed">
          {description}
        </span>
      </div>
    </div>
  );
};
