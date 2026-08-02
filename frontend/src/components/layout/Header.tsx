import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';
import { User } from 'lucide-react';
import type { HeaderProps } from '../../types/navigation';

export const Header: React.FC<HeaderProps> = ({
  brandName = 'Expedia',
  signInLabel = 'Sign in',
  onSignInClick,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Expedia Brand Logo -> Navigate Home / */}
        <Link to="/" className="flex items-center gap-2 group focus:outline-none cursor-pointer">
          <div className="w-7 h-7 bg-[#ffdb00] flex items-center justify-center rounded-lg shadow-xs font-bold text-slate-900 group-hover:scale-105 transition-transform">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 font-sans">{brandName}</span>
        </Link>

        {/* Clean Essential Links & Sign In */}
        <div className="flex items-center gap-5 text-xs sm:text-sm font-semibold text-slate-800">
          <a href="#" className="hover:text-[#0065eb] transition-colors">
            Support
          </a>

          <a href="#" className="hover:text-[#0065eb] transition-colors">
            Trips
          </a>

          {/* Sign in Button */}
          <Button
            onClick={onSignInClick}
            size="sm"
            variant="primary"
            className="bg-[#0065eb] hover:bg-blue-700 text-white font-bold transition-all rounded-full px-5 py-2"
          >
            <User className="w-3.5 h-3.5 mr-1" />
            <span>{signInLabel}</span>
          </Button>
        </div>

      </div>
    </header>
  );
};
