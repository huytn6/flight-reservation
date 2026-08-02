import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, Plane, CreditCard, Tag, FileText, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users & Staff', icon: Users },
    { path: '/admin/catalog', label: 'Flight Catalog', icon: Plane },
    { path: '/admin/finance', label: 'Bookings & Finance', icon: CreditCard },
    { path: '/admin/cms', label: 'Coupons & Content', icon: Tag },
    { path: '/admin/audit', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      <header className="bg-emerald-950 text-white sticky top-0 z-40 border-b border-emerald-800">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-emerald-300 hover:text-white font-semibold text-xs">
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xs">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-white font-sans">Admin Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block text-xs">
              <p className="font-bold text-white">{user?.full_name}</p>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-800 text-emerald-200 rounded-full">ADMIN</span>
            </div>
          </div>
        </div>

        {/* Subnav */}
        <div className="bg-emerald-900 border-t border-emerald-800/80">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive ? 'bg-emerald-600 text-white' : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};
