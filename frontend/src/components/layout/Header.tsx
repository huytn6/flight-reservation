import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { User, LogOut, Ticket, Heart, Bell, Shield, LifeBuoy, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth';
import { NotificationDropdown } from './NotificationDropdown';
import { toast } from 'sonner';

interface HeaderProps {
  brandName?: string;
  signInLabel?: string;
  onSignInClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  brandName = 'Expedia',
  signInLabel = 'Sign in',
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      setUserMenuOpen(false);
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  const firstName = user?.full_name?.split(' ')[0] || user?.full_name || 'User';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 font-sans">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Expedia Brand Logo -> Navigate Home / */}
        <Link to="/" className="flex items-center gap-2 group focus:outline-none cursor-pointer">
          <div className="w-7 h-7 bg-[#ffdb00] flex items-center justify-center rounded-lg font-bold text-slate-900 group-hover:scale-105 transition-transform">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 font-sans">{brandName}</span>
        </Link>

        {/* Clean Essential Links & Auth Menu */}
        <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold text-slate-800">
          <Link to="/support" className="hover:text-[#0065eb] transition-colors">
            Support
          </Link>

          <Link to="/my-bookings" className="hover:text-[#0065eb] transition-colors">
            Trips
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Realtime Notification Dropdown */}
              <NotificationDropdown />

              {/* Expedia Style User Trigger */}
              <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 p-1 px-1.5 rounded-xl hover:bg-slate-100/70 transition-colors border-none focus:outline-none cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-[#1d3c85] text-white font-medium text-[11px] flex items-center justify-center">
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left leading-tight hidden sm:flex">
                      <span className="text-[11px] font-normal text-[#0065eb]">{firstName}</span>
                      <span className="text-[9px] font-normal text-slate-500 uppercase">{user?.role}</span>
                    </div>
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-60 p-0 rounded-2xl border-none bg-white text-xs shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden" align="end">
                  {/* Top User Info Header Box */}
                  <div className="p-3 px-3.5 bg-white border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-normal text-slate-900">Hi, {firstName}</h4>
                      <p className="text-[11px] font-normal text-slate-500 truncate max-w-[130px]">{user?.email}</p>
                    </div>
                    <span className="text-[9px] font-normal px-2 py-0.5 bg-[#0065eb] text-white rounded uppercase">
                      {user?.role}
                    </span>
                  </div>

                  {/* Real App Navigation Links List */}
                  <div className="p-1.5 flex flex-col gap-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100/70 flex items-center justify-between text-slate-700 font-normal text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Account</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </Link>

                    <Link
                      to="/saved-flights"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100/70 flex items-center justify-between text-slate-700 font-normal text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-slate-500" />
                        <span>Saved Flights</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </Link>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100/70 flex items-center justify-between text-slate-700 font-normal text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-slate-500" />
                        <span>My Trips</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </Link>

                    <Link
                      to="/price-alerts"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100/70 flex items-center justify-between text-slate-700 font-normal text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-slate-500" />
                        <span>Price Alerts</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </Link>

                    <Link
                      to="/support"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100/70 flex items-center justify-between text-slate-700 font-normal text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <LifeBuoy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Support Desk</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </Link>

                    {/* Role Specific Portals (Unified Admin/Staff Management Dashboard) */}
                    {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50 text-blue-700 flex items-center justify-between font-medium text-xs border border-blue-100 mt-0.5"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-[#0065eb]" />
                          <span>Management Dashboard</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-blue-400" />
                      </Link>
                    )}
                  </div>

                  {/* Sign Out Button */}
                  <div className="border-t border-slate-100 p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-start gap-2 font-normal text-xs transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-600" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            /* Sign in Button */
            <Button
              onClick={() => navigate('/signin')}
              size="sm"
              className="bg-[#0065eb] hover:bg-blue-700 text-white font-semibold transition-all rounded-full px-5 py-2 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 mr-1" />
              <span>{signInLabel}</span>
            </Button>
          )}
        </div>

      </div>
    </header>
  );
};
