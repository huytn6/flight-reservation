import React from 'react';

interface TopNoticeProps {
  text: string;
  linkText: string;
  linkHref: string;
}

export const TopNotice: React.FC<TopNoticeProps> = ({ text, linkText, linkHref }) => {
  return (
    <div className="bg-[#2d3345] text-white text-xs py-1.5 px-4 font-normal tracking-tight">
      <div className="max-w-[1240px] mx-auto flex items-center justify-start gap-1">
        <span>{text}</span>
        <a href={linkHref} className="underline hover:text-gray-200 transition-colors font-medium">
          {linkText}
        </a>
        <span>.</span>
      </div>
    </div>
  );
};
