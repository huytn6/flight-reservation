import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User, LogOut, Ticket, Bell, Shield, LifeBuoy, Heart, Search, Plane, Bookmark } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth';
import { useEffect } from 'react';

export const Header = () => {
  const { isAuthenticated, user, logout, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group focus:outline-none cursor-pointer">
            <div className="w-7 h-7 bg-[#ffdb00] flex items-center justify-center rounded-lg shadow-xs font-bold text-slate-900 group-hover:scale-105 transition-transform">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 font-sans">Expedia</span>
          </Link>

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
              <DropdownMenuItem onClick={() => navigate('/flights/search')} className="px-3 py-2 text-xs font-semibold hover:bg-blue-50 rounded-xl cursor-pointer flex items-center gap-2">
                <Plane className="w-3.5 h-3.5 text-[#0065eb]" /> Tìm Kiếm Chuyến Bay
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/booking-lookup')} className="px-3 py-2 text-xs font-semibold hover:bg-blue-50 rounded-xl cursor-pointer flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-blue-600" /> Tra Cứu Mã Đơn (PNR)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/price-alerts')} className="px-3 py-2 text-xs font-semibold hover:bg-blue-50 rounded-xl cursor-pointer flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-amber-500" /> Cảnh Báo Giá Vé
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/saved-flights')} className="px-3 py-2 text-xs font-semibold hover:bg-blue-50 rounded-xl cursor-pointer flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5 text-[#0065eb]" /> Chuyến Bay Đã Lưu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Side Nav Links & User Menu */}
        <div className="flex items-center gap-3.5 text-xs sm:text-sm font-semibold text-slate-800">
          
          <Badge 
            variant="secondary" 
            className="hidden sm:flex bg-slate-100 text-slate-800 font-bold border border-slate-200/60 cursor-pointer hover:bg-slate-200/60 transition-colors px-2.5 py-1 rounded-full"
          >
            VNĐ (VN)
          </Badge>

          <Link to="/booking-lookup" className="hidden md:flex items-center gap-1 hover:text-[#0065eb] transition-colors py-1.5 px-2 rounded-xl hover:bg-slate-100/60">
            <Search className="w-3.5 h-3.5" /> PNR Lookup
          </Link>

          <Link to="/support" className="hidden sm:flex items-center gap-1 hover:text-[#0065eb] transition-colors py-1.5 px-2 rounded-xl hover:bg-slate-100/60">
            <LifeBuoy className="w-3.5 h-3.5" /> Support
          </Link>

          <Link to="/my-bookings" className="hover:text-[#0065eb] transition-colors py-1.5 px-2 rounded-xl hover:bg-slate-100/60 flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5" /> My Trips
          </Link>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-blue-50 text-[#0065eb] font-bold hover:bg-blue-100 transition-all rounded-full px-3.5 py-1.5 flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user.full_name}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-xl rounded-2xl p-1">
                <div className="px-3 py-2 border-b mb-1">
                  <p className="font-bold text-sm text-slate-900 truncate">{user.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{user.role}</span>
                </div>

                <DropdownMenuItem onClick={() => navigate('/profile')} className="px-3 py-2 text-xs font-semibold hover:bg-blue-50 rounded-xl cursor-pointer">
                  <User className="w-4 h-4 mr-2 text-slate-600" /> Account Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/my-bookings')} className="px-3 py-2 text-xs font-semibold hover:bg-blue-50 rounded-xl cursor-pointer">
                  <Ticket className="w-4 h-4 mr-2 text-slate-600" /> My Bookings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/price-alerts')} className="px-3 py-2 text-xs font-semibold hover:bg-blue-50 rounded-xl cursor-pointer">
                  <Bell className="w-4 h-4 mr-2 text-slate-600" /> Price Alerts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/saved-flights')} className="px-3 py-2 text-xs font-semibold hover:bg-blue-50 rounded-xl cursor-pointer">
                  <Heart className="w-4 h-4 mr-2 text-slate-600" /> Saved Flights
                </DropdownMenuItem>

                {(user.role === 'STAFF' || user.role === 'ADMIN') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="px-3 py-2 text-xs font-semibold hover:bg-blue-50 text-[#0065eb] rounded-xl cursor-pointer">
                      <Shield className="w-4 h-4 mr-2 text-[#0065eb]" /> Management Dashboard
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="px-3 py-2 text-xs font-semibold hover:bg-red-50 text-red-600 rounded-xl cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2 text-red-600" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate('/signin')}
              size="sm"
              variant="secondary"
              className="bg-blue-50 text-[#0065eb] font-bold hover:bg-blue-100 transition-all rounded-full px-4"
            >
              <User className="w-3.5 h-3.5 mr-1" />
              <span>Sign in</span>
            </Button>
          )}

        </div>
      </div>
    </header>
  );
};
