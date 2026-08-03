import React, { useState } from 'react';
import { bookingService, type BookingDetail } from '@/services/booking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/common/StatusBadge';

export const BookingLookup: React.FC = () => {
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BookingDetail | null>(null);
  const navigate = useNavigate();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnr.trim() || !lastName.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await bookingService.lookupBooking(pnr, lastName);
      setResult(res);
      toast.success('Booking found!');
    } catch (err: any) {
      toast.error(err.message || 'No booking found matching PNR and last name');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 py-12 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center justify-center gap-2">
          <Search className="w-7 h-7 text-blue-600" /> Find Your Booking
        </h1>
        <p className="text-sm text-slate-500 mt-1">Look up your flight reservation using your 6-character PNR code and last name.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border shadow-lg mb-8">
        <form onSubmit={handleLookup} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">PNR / Booking Reference</label>
              <Input
                placeholder="e.g. ABC123"
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                className="text-sm rounded-xl uppercase font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Passenger Last Name</label>
              <Input
                placeholder="e.g. Nguyen"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="text-sm rounded-xl"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-bold py-3.5 rounded-full shadow-md mt-2"
          >
            {loading ? 'Looking up...' : 'Search Booking'}
          </Button>
        </form>
      </div>

      {result && (
        <div className="bg-white p-6 rounded-3xl border shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-black text-lg text-slate-900 font-mono">PNR: {result.booking.pnr}</span>
            </div>
            <StatusBadge type="booking" value={result.booking.status} />
          </div>

          <div className="text-xs text-slate-600 space-y-1">
            <p><span className="font-bold text-slate-800">Passenger/Contact:</span> {result.booking.contact_name} ({result.booking.contact_email})</p>
            <p><span className="font-bold text-slate-800">Total Amount:</span> {result.booking.total_amount.toLocaleString()} VND</p>
          </div>

          <Button
            onClick={() => navigate(`/bookings/${result.booking.id}`)}
            className="bg-blue-600 text-white font-bold rounded-xl mt-2 w-fit"
          >
            View Full Booking & E-Tickets
          </Button>
        </div>
      )}
    </div>
  );
};
