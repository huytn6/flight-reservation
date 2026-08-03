import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Phone, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const BookingDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) loadBooking();
  }, [id]);

  const loadBooking = async () => {
    setLoading(true);
    try {
      if (id) {
        const res = await adminService.getBookingDetail(id);
        setBooking(res);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await adminService.cancelBooking(id, 'Admin cancellation');
      toast.success('Booking cancelled successfully');
      loadBooking();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading booking record...</div>;
  }

  if (!booking) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-600">Booking record not found.</p>
        <Button size="sm" onClick={() => navigate('/admin/bookings')}>Back to Bookings</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/bookings')}
          className="text-xs text-slate-600 hover:text-slate-900 bg-white border-slate-200 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Bookings List
        </Button>

        {booking.status !== 'CANCELLED' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelBooking}
            disabled={cancelling}
            className="text-xs text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            {cancelling ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        )}
      </div>

      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/60 p-6 border-b border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <Badge className="bg-blue-50 text-[#0065eb] border border-blue-200 font-mono text-sm px-2.5 py-0.5">
                  PNR: {booking.pnr || booking.booking_reference || booking.id?.substring(0, 8)}
                </Badge>
                <Badge className={booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                  {booking.status || 'CONFIRMED'}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-2">
                Booking Reference Summary
              </CardTitle>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">Total Price Paid</p>
              <p className="text-lg font-bold font-mono text-[#0065eb]">
                {Number(booking.total_amount || 0).toLocaleString('vi-VN')} VND
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Contact Passenger
              </span>
              <p className="font-semibold text-slate-800 text-sm">{booking.contact_name || booking.customer_name || 'N/A'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Contact Email
              </span>
              <p className="font-semibold text-slate-800 text-sm font-mono">{booking.contact_email || 'N/A'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Contact Phone
              </span>
              <p className="font-semibold text-slate-800 text-sm font-mono">{booking.contact_phone || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
