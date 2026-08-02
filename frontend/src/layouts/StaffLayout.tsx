import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, Ticket, LifeBuoy, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth';

export const StaffLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white font-semibold text-xs">
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-white font-sans">Staff Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block text-xs">
              <p className="font-bold text-white">{user?.full_name}</p>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-purple-900 text-purple-200 rounded-full">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Subnav */}
        <div className="bg-slate-800 border-t border-slate-700/60">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex gap-2">
            <Link
              to="/staff"
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-colors ${
                location.pathname === '/staff' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Ticket className="w-4 h-4" /> Bookings Management
            </Link>
            <Link
              to="/staff/tickets"
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-colors ${
                location.pathname === '/staff/tickets' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <LifeBuoy className="w-4 h-4" /> Support Tickets Desk
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};
