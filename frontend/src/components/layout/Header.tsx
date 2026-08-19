import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { 
  Plane, 
  QrCode, 
  PlaneTakeoff, 
  Luggage, 
  HelpCircle, 
  User, 
  LogOut, 
  Ticket, 
  Bookmark, 
  TrendingDown, 
  ShieldCheck, 
  ChevronRight,
  LogIn,
  UserPlus
} from 'lucide-react';
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
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 font-sans shadow-xs">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Expedia Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group focus:outline-none cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#0052cc] to-[#0065eb] flex items-center justify-center rounded-xl font-bold text-white shadow-sm group-hover:scale-105 transition-transform">
            <Plane className="w-4.5 h-4.5 text-white -rotate-45 fill-white/20" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">{brandName}</span>
        </Link>

        {/* Header Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-700">
          <Link to="/check-in" className="hover:text-[#0065eb] transition-colors flex items-center gap-1.5 py-1">
            <QrCode className="w-4 h-4 text-slate-400 hover:text-[#0065eb] transition-colors" />
            <span>Check-in Trực Tuyến</span>
          </Link>

          <Link to="/flight-status" className="hover:text-[#0065eb] transition-colors flex items-center gap-1.5 py-1">
            <PlaneTakeoff className="w-4 h-4 text-slate-400 hover:text-[#0065eb] transition-colors" />
            <span>Trạng Thái Chuyến Bay</span>
          </Link>

          <Link to="/my-bookings" className="hover:text-[#0065eb] transition-colors flex items-center gap-1.5 py-1">
            <Luggage className="w-4 h-4 text-slate-400 hover:text-[#0065eb] transition-colors" />
            <span>Chuyến Đi Của Tôi</span>
          </Link>

          <Link to="/support" className="hover:text-[#0065eb] transition-colors flex items-center gap-1.5 py-1">
            <HelpCircle className="w-4 h-4 text-slate-400 hover:text-[#0065eb] transition-colors" />
            <span>Trợ Giúp</span>
          </Link>
        </div>

        {/* Right Auth Menu */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NotificationDropdown />

              <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 p-1 px-2 rounded-xl hover:bg-slate-100/80 transition-colors border-none focus:outline-none cursor-pointer">
                    <div className="w-7.5 h-7.5 rounded-full bg-gradient-to-tr from-[#0052cc] to-[#0065eb] text-white font-semibold text-xs flex items-center justify-center shadow-xs">
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
                        <Luggage className="w-3.5 h-3.5 text-blue-600" />
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
                        <Bookmark className="w-3.5 h-3.5 text-rose-500" />
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
                        <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
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
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
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
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0065eb]" />
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
                className="text-xs font-normal text-slate-700 border-slate-200 hover:bg-slate-50 rounded-lg px-3.5 h-8.5 cursor-pointer shadow-none flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Đăng Nhập</span>
              </Button>

              <Button
                onClick={() => navigate('/register')}
                size="sm"
                className="bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs rounded-lg px-3.5 h-8.5 cursor-pointer shadow-none flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 text-white" />
                <span>Đăng Ký</span>
              </Button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
