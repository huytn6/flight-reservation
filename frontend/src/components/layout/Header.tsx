import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { User, LogOut, Ticket, Heart, Bell, Shield, LifeBuoy, ChevronRight, CheckSquare, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth';
import { NotificationDropdown } from './NotificationDropdown';
import { toast } from 'sonner';

interface HeaderProps {
  brandName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  brandName = 'Expedia',
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đã đăng xuất thành công');
      setUserMenuOpen(false);
      navigate('/');
    } catch {
      toast.error('Đăng xuất thất bại');
    }
  };

  const firstName = user?.full_name?.split(' ')[0] || user?.full_name || 'Tài khoản';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 font-sans">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Expedia Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group focus:outline-none cursor-pointer">
          <div className="w-7 h-7 bg-[#0065eb] flex items-center justify-center rounded-lg font-bold text-white group-hover:scale-105 transition-transform">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">{brandName}</span>
        </Link>

        {/* Header Navigation Links */}
        <div className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-700">
          <Link to="/check-in" className="hover:text-[#0065eb] transition-colors flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Check-in Trực Tuyến</span>
          </Link>

          <Link to="/flight-status" className="hover:text-[#0065eb] transition-colors flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Trạng Thái Chuyến Bay</span>
          </Link>

          <Link to="/my-bookings" className="hover:text-[#0065eb] transition-colors">
            Chuyến Đi Của Tôi
          </Link>

          <Link to="/support" className="hover:text-[#0065eb] transition-colors">
            Trợ Giúp
          </Link>
        </div>

        {/* Right Auth Menu */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NotificationDropdown />

              <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 p-1 px-1.5 rounded-xl hover:bg-slate-100/70 transition-colors border-none focus:outline-none cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-[#0065eb] text-white font-semibold text-xs flex items-center justify-center">
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left leading-tight hidden sm:flex">
                      <span className="text-xs font-semibold text-slate-900">{firstName}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{user?.role}</span>
                    </div>
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-56 p-0 rounded-xl border border-slate-100 bg-white text-xs shadow-lg overflow-hidden font-sans" align="end">
                  <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">Xin chào, {firstName}</h4>
                      <p className="text-[10px] text-slate-500 truncate max-w-[130px]">{user?.email}</p>
                    </div>
                    <span className="text-[9px] font-medium px-1.5 py-0.5 bg-blue-50 text-[#0065eb] rounded">
                      {user?.role}
                    </span>
                  </div>

                  <div className="p-1.5 flex flex-col gap-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Hồ sơ tài khoản</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </Link>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-slate-400" />
                        <span>Chuyến đi đã đặt</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </Link>

                    <Link
                      to="/saved-flights"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-slate-400" />
                        <span>Chuyến bay đã lưu</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </Link>

                    <Link
                      to="/price-alerts"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cảnh báo giá rẻ</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </Link>

                    <Link
                      to="/support"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <LifeBuoy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Trợ giúp & Hỗ trợ</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </Link>

                    {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-[#0065eb] flex items-center justify-between font-medium text-xs mt-1"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-[#0065eb]" />
                          <span>Trang quản trị</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-blue-400" />
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-start gap-2 text-xs transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/signin')}
                variant="outline"
                size="sm"
                className="text-xs font-normal text-slate-700 border-slate-200 hover:bg-slate-50 rounded-lg px-3.5 h-8.5 cursor-pointer shadow-none"
              >
                Đăng Nhập
              </Button>

              <Button
                onClick={() => navigate('/register')}
                size="sm"
                className="bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs rounded-lg px-3.5 h-8.5 cursor-pointer shadow-none"
              >
                Đăng Ký
              </Button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
