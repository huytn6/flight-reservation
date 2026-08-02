import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, MessageSquare, User } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side Logo & Shop Travel Dropdown */}
        <div className="flex items-center gap-6">
          {/* Expedia Logo -> Navigate Home / */}
          <Link to="/" className="flex items-center gap-2 group focus:outline-none cursor-pointer">
            <div className="w-7 h-7 bg-[#ffdb00] flex items-center justify-center rounded-lg shadow-xs font-bold text-slate-900 group-hover:scale-105 transition-transform">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 font-sans">Expedia</span>
          </Link>

          {/* Shop travel Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="font-bold text-slate-800 text-xs sm:text-sm border-none hover:bg-slate-100/80 rounded-xl px-3"
              >
                <span>Shop travel</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white border border-slate-200 shadow-xl rounded-2xl p-1">
              <DropdownMenuItem key="flights" className="px-3 py-2 text-xs font-semibold hover:bg-blue-50 rounded-xl cursor-pointer">✈️ Flights</DropdownMenuItem>
              <DropdownMenuItem key="hotels" className="px-3 py-2 text-xs font-semibold hover:bg-blue-50 rounded-xl cursor-pointer">🏨 Stays & Hotels</DropdownMenuItem>
              <DropdownMenuItem key="cars" className="px-3 py-2 text-xs font-semibold hover:bg-blue-50 rounded-xl cursor-pointer">🚗 Car Rentals</DropdownMenuItem>
              <DropdownMenuItem key="packages" className="px-3 py-2 text-xs font-semibold hover:bg-blue-50 rounded-xl cursor-pointer">🎒 Vacation Packages</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Side Nav Links */}
        <div className="flex items-center gap-3.5 text-xs sm:text-sm font-semibold text-slate-800">
          
          {/* Currency Chip */}
          <Badge 
            variant="secondary" 
            className="hidden sm:flex bg-slate-100 text-slate-800 font-bold border border-slate-200/60 cursor-pointer hover:bg-slate-200/60 transition-colors px-2.5 py-1 rounded-full"
          >
            USD 🇺🇸
          </Badge>

          <a href="#" className="hidden md:block hover:text-[#0065eb] transition-colors py-1.5 px-2 rounded-xl hover:bg-slate-100/60">
            List your property
          </a>

          <a href="#" className="hidden sm:block hover:text-[#0065eb] transition-colors py-1.5 px-2 rounded-xl hover:bg-slate-100/60">
            Support
          </a>

          <a href="#" className="hover:text-[#0065eb] transition-colors py-1.5 px-2 rounded-xl hover:bg-slate-100/60">
            Trips
          </a>

          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 rounded-full border-none text-slate-700 hover:text-[#0065eb] hover:bg-slate-100"
            aria-label="Messages"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>

          {/* Sign in Button */}
          <Button
            size="sm"
            variant="secondary"
            className="bg-blue-50 text-[#0065eb] font-bold hover:bg-blue-100 transition-all rounded-full px-4"
          >
            <User className="w-3.5 h-3.5 mr-1" />
            <span>Sign in</span>
          </Button>

        </div>
      </div>
    </header>
  );
};
