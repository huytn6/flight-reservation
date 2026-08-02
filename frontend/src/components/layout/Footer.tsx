import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f4f7fa] border-t border-slate-200/80 pt-10 pb-8 mt-16 font-sans">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        
        {/* Expedia Group Logo -> Navigate Home / */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 focus:outline-none cursor-pointer">
            <div className="w-5 h-5 bg-[#ffdb00] flex items-center justify-center rounded-md shadow-2xs font-bold text-slate-900">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#141d38] font-sans">
              expedia group
            </span>
          </Link>
        </div>

        {/* 4-Column Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-[11px] sm:text-[12px]">
          
          {/* Column 1: Company */}
          <div className="flex flex-col gap-1.5">
            <h4 className="font-bold text-[#141d38] text-xs sm:text-sm mb-1">Company</h4>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">About</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Jobs</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">List your property</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Partnerships</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Newsroom</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Investor Relations</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Advertising</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Affiliate Marketing</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Feedback</a>
          </div>

          {/* Column 2: Explore */}
          <div className="flex flex-col gap-1.5">
            <h4 className="font-bold text-[#141d38] text-xs sm:text-sm mb-1">Explore</h4>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">United States of America travel guide</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Hotels in United States of America</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Vacation rentals in United States of America</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Vacation packages in United States of America</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Domestic flights</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Car rentals in United States of America</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">All accommodation types</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Rewards with One Key</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">One Key credit cards</a>
          </div>

          {/* Column 3: Policies */}
          <div className="flex flex-col gap-1.5">
            <h4 className="font-bold text-[#141d38] text-xs sm:text-sm mb-1">Policies</h4>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Privacy</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Cookies</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Terms of use</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">One Key™ terms and conditions</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Vrbo terms and conditions</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Accessibility</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Your privacy choices</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Content guidelines and reporting content</a>
          </div>

          {/* Column 4: Help */}
          <div className="flex flex-col gap-1.5">
            <h4 className="font-bold text-[#141d38] text-xs sm:text-sm mb-1">Help</h4>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Support</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Cancel your hotel or vacation rental booking</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Cancel your flight</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Refund basics</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Use an Expedia coupon</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">International travel documents</a>
            <a href="#" className="text-[#0065eb] hover:underline transition-all leading-relaxed">Your rights as a flights traveler</a>
          </div>

        </div>

        {/* Bottom Copyright Notice */}
        <div className="border-t border-slate-200/90 mt-10 pt-6 text-center text-[10px] sm:text-[11px] text-slate-500 font-normal leading-relaxed">
          © 2026 Expedia, Inc., an Expedia Group company. All rights reserved. Expedia and the Expedia Logo are trademarks or registered trademarks of Expedia, Inc. CST# 2029030-50.
        </div>

      </div>
    </footer>
  );
};
