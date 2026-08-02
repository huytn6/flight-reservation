import React, { useEffect, useState } from 'react';
import { bookingService, type Booking } from '@/services/booking';
import { Button } from '@/components/ui/button';
import { Ticket, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings(statusFilter || undefined);
      setBookings(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-slate-600" /> My Trips & Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your upcoming flights, e-tickets, and cancellations.</p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-medium">
          {[
            { key: '', label: 'All' },
            { key: 'CONFIRMED', label: 'Confirmed' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'CANCELLED', label: 'Cancelled' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === f.key ? 'bg-white text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading your bookings..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="Start by searching for flights to book your next trip!"
          actionLabel="Search Flights"
          onAction={() => navigate('/flights/search')}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/bookings/${b.id}`)}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:bg-slate-50/50 transition-colors cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase font-mono">PNR: {b.pnr}</span>
                  <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(b.status)}`}>
                    {b.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">Contact: {b.contact_name} ({b.contact_email})</p>
                <p className="text-xs text-slate-500">Booked on: {new Date(b.created_at).toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[11px] text-slate-500">Total Amount</p>
                  <p className="text-sm sm:text-base font-semibold text-slate-900">{b.total_amount.toLocaleString()} VND</p>
                </div>
                <Button size="sm" variant="ghost" className="text-blue-600 gap-1 font-medium cursor-pointer">
                  View Details <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
