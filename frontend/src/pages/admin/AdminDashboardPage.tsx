import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import { Card } from '@/components/ui/card';
import { DollarSign, Ticket, Users, Plane, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [bookingMetrics, setBookingMetrics] = useState<any[]>([]);
  const [flightMetrics, setFlightMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [sumRes, bookRes, fltRes] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getDashboardBookings(),
        adminService.getDashboardFlights(),
      ]);

      setSummary(sumRes);
      setBookingMetrics(bookRes || []);
      setFlightMetrics(fltRes || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <div className="p-8 text-slate-500 font-medium">Loading admin dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Metrics Overview</h1>
        <p className="text-xs text-slate-500">Live operational overview, revenue tracking, and booking metrics.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Revenue</p>
            <p className="text-xl font-black text-slate-900">{summary?.total_revenue?.toLocaleString()} {summary?.currency || 'VND'}</p>
          </div>
        </Card>

        <Card className="p-5 border bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Bookings</p>
            <p className="text-xl font-black text-slate-900">{summary?.total_bookings} ({summary?.confirmed_bookings} confirmed)</p>
          </div>
        </Card>

        <Card className="p-5 border bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Customers</p>
            <p className="text-xl font-black text-slate-900">{summary?.total_customers}</p>
          </div>
        </Card>

        <Card className="p-5 border bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Flight Status Types</p>
            <p className="text-xl font-black text-slate-900">{flightMetrics.length} Active Statuses</p>
          </div>
        </Card>
      </div>

      {/* Metrics Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Booking Metrics */}
        <div className="bg-white p-6 rounded-2xl border shadow-xs flex flex-col gap-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Daily Booking Breakdown (Last 30 Days)
          </h2>
          <div className="divide-y max-h-80 overflow-y-auto text-xs">
            {bookingMetrics.length === 0 ? (
              <p className="text-slate-400 py-4">No recent booking records.</p>
            ) : (
              bookingMetrics.map((row, i) => (
                <div key={i} className="py-2.5 flex justify-between items-center">
                  <span className="font-semibold text-slate-800">{row.date}</span>
                  <div className="flex gap-4">
                    <span className="text-slate-600 font-medium">{row.count} Bookings</span>
                    <span className="font-bold text-emerald-700">{row.revenue?.toLocaleString() || 0} VND</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Flight Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border shadow-xs flex flex-col gap-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plane className="w-4 h-4 text-blue-600" /> Flight Operations Breakdown
          </h2>
          <div className="divide-y max-h-80 overflow-y-auto text-xs">
            {flightMetrics.length === 0 ? (
              <p className="text-slate-400 py-4">No flight status metrics.</p>
            ) : (
              flightMetrics.map((row, i) => (
                <div key={i} className="py-2.5 flex justify-between items-center">
                  <span className="font-bold text-slate-800 uppercase px-2.5 py-1 bg-slate-100 rounded-full">{row.status}</span>
                  <span className="font-bold text-slate-900">{row.count} Flights</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
