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
                  <button className="flex items-center gap-2 p-1 px-2.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200 focus:outline-none cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-[#0065eb] text-white font-bold text-xs flex items-center justify-center">
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left leading-tight hidden sm:flex">
                      <span className="text-xs font-semibold text-slate-900">{firstName}</span>
                      <span className="text-[10px] font-medium text-slate-500 uppercase">{user?.role}</span>
                    </div>
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-72 p-0 rounded-2xl border border-slate-200 bg-white text-xs shadow-none overflow-hidden" align="end">
                  {/* Top User Info Header Box */}
                  <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">Hi, {firstName}</h4>
                        <p className="text-xs text-slate-500 truncate max-w-[170px]">{user?.email}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md uppercase">
                        {user?.role}
                      </span>
                    </div>
                  </div>

                  {/* Real App Navigation Links List */}
                  <div className="p-2 flex flex-col gap-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700 font-normal transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Account</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <Link
                      to="/saved-flights"
                      onClick={() => setUserMenuOpen(false)}
                      className="p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700 font-normal transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Heart className="w-4 h-4 text-slate-500" />
                        <span>Saved Flights</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserMenuOpen(false)}
                      className="p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700 font-normal transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Ticket className="w-4 h-4 text-slate-500" />
                        <span>My Trips</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <Link
                      to="/price-alerts"
                      onClick={() => setUserMenuOpen(false)}
                      className="p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700 font-normal transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bell className="w-4 h-4 text-slate-500" />
                        <span>Price Alerts</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <Link
                      to="/support"
                      onClick={() => setUserMenuOpen(false)}
                      className="p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700 font-normal transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <LifeBuoy className="w-4 h-4 text-slate-500" />
                        <span>Support Desk</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    {/* Role Specific Portals */}
                    {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
                      <Link
                        to="/staff"
                        onClick={() => setUserMenuOpen(false)}
                        className="p-2.5 rounded-lg hover:bg-purple-50 text-purple-700 flex items-center justify-between font-medium border border-purple-100 mt-0.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <Shield className="w-4 h-4 text-purple-600" />
                          <span>Staff Portal</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                      </Link>
                    )}

                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="p-2.5 rounded-lg hover:bg-emerald-50 text-emerald-800 flex items-center justify-between font-medium border border-emerald-100 mt-0.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <Shield className="w-4 h-4 text-emerald-600" />
                          <span>Admin Portal</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                      </Link>
                    )}
                  </div>

                  {/* Sign Out Button */}
                  <div className="border-t border-slate-100 p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-between font-normal transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Sign out</span>
                      </div>
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
