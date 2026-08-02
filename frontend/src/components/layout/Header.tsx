import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { User, LogOut, Ticket, Heart, Bell, Shield, LifeBuoy } from 'lucide-react';
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

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
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

              {/* User Avatar Menu Popover */}
              <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200 focus:outline-none cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center">
                      {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 hidden sm:inline">{user?.full_name}</span>
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-56 p-2 rounded-xl border border-slate-200 bg-white text-xs shadow-none" align="end">
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50/70 rounded-lg mb-1">
                    <p className="font-medium text-slate-800 truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[9px] uppercase font-medium px-2 py-0.5 bg-slate-200/70 text-slate-600 rounded-md">
                      {user?.role}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-normal transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" /> My Profile
                    </Link>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-normal transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-slate-500" /> My Trips
                    </Link>

                    <Link
                      to="/saved-flights"
                      onClick={() => setUserMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-normal transition-colors"
                    >
                      <Heart className="w-4 h-4 text-slate-500" /> Saved Flights
                    </Link>

                    <Link
                      to="/price-alerts"
                      onClick={() => setUserMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-normal transition-colors"
                    >
                      <Bell className="w-4 h-4 text-slate-500" /> Price Alerts
                    </Link>

                    <Link
                      to="/support"
                      onClick={() => setUserMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-normal transition-colors"
                    >
                      <LifeBuoy className="w-4 h-4 text-slate-500" /> Support Desk
                    </Link>

                    {/* Role Specific Portals */}
                    {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
                      <Link
                        to="/staff"
                        onClick={() => setUserMenuOpen(false)}
                        className="p-2 rounded-lg hover:bg-purple-50 text-purple-700 flex items-center gap-2 font-medium border border-purple-100 mt-0.5"
                      >
                        <Shield className="w-4 h-4 text-purple-600" /> Staff Portal
                      </Link>
                    )}

                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-800 flex items-center gap-2 font-medium border border-emerald-100 mt-0.5"
                      >
                        <Shield className="w-4 h-4 text-emerald-600" /> Admin Portal
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left p-2 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2 font-normal transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-600" /> Sign Out
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
