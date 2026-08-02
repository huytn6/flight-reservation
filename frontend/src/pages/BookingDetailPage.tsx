import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { bookingService, type BookingDetail, type ETicket } from '@/services/booking';
import { reviewService } from '@/services/review';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Printer, 
  Mail, 
  ExternalLink, 
  AlertCircle, 
  RefreshCw, 
  XCircle, 
  Star, 
  FileText 
} from 'lucide-react';

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();


  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [etickets, setEtickets] = useState<ETicket[]>([]);
  const [flightStatus, setFlightStatus] = useState<any>(null);
  const [travelAlerts, setTravelAlerts] = useState<any[]>([]);
  const [checkInInfo, setCheckInInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelPreview, setCancelPreview] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');

  // Flight Change state
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [newFareId, setNewFareId] = useState('');
  const [newFlightId, setNewFlightId] = useState('');
  const [changeQuoteRes, setChangeQuoteRes] = useState<any>(null);

  useEffect(() => {
    if (id) loadBookingAll();
  }, [id]);

  const loadBookingAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [bDetail, tickets, statusRes, alertsRes] = await Promise.all([
        bookingService.getMyBookingDetail(id),
        bookingService.getETickets(id).catch(() => []),
        bookingService.getFlightStatus(id).catch(() => null),
        bookingService.getTravelAlerts(id).catch(() => []),
      ]);

      setDetail(bDetail);
      setEtickets(tickets || []);
      setFlightStatus(statusRes);
      setTravelAlerts(alertsRes || []);

      if (bDetail.booking.status === 'CONFIRMED') {
        bookingService.getCheckInLink(id).then(setCheckInInfo).catch(() => null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!id) return;
    try {
      await bookingService.resendConfirmation(id);
      toast.success('Confirmation email sent!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send confirmation email');
    }
  };

  const handleSendDocuments = async () => {
    if (!id) return;
    try {
      await bookingService.sendDocumentsEmail(id);
      toast.success('Itinerary and E-Tickets sent by email');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send documents');
    }
  };

  const handleOpenCancelModal = async () => {
    if (!id) return;
    try {
      const preview = await bookingService.cancellationPreview(id);
      setCancelPreview(preview);
      setCancelModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Cannot cancel this booking');
    }
  };

  const handleConfirmCancel = async () => {
    if (!id) return;
    try {
      await bookingService.cancelBooking(id, cancelReason);
      toast.success('Booking cancelled successfully');
      setCancelModalOpen(false);
      loadBookingAll();
    } catch (err: any) {
      toast.error(err.message || 'Cancellation failed');
    }
  };

  const handleQuoteChange = async () => {
    if (!id || !newFareId) return;
    try {
      const res = await bookingService.changeQuote(id, newFareId);
      setChangeQuoteRes(res);
    } catch (err: any) {
      toast.error(err.message || 'Failed to quote change');
    }
  };

  const handleConfirmChange = async () => {
    if (!id || !newFareId || !newFlightId) return;
    try {
      await bookingService.changeConfirm(id, newFareId, newFlightId);
      toast.success('Flight changed successfully!');
      setChangeModalOpen(false);
      loadBookingAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm flight change');
    }
  };

  const handleSubmitReview = async () => {
    if (!id || !detail) return;
    try {
      await reviewService.createReview({
        booking_id: id,
        airline_id: 'airline-001',
        rating,
        title: reviewTitle,
        body: reviewBody,
      });
      toast.success('Thank you for your review!');
      setReviewModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return <div className="min-h-screen p-12 text-center text-slate-500 font-medium">Loading booking details...</div>;
  }

  if (!detail) {
    return <div className="min-h-screen p-12 text-center text-slate-500 font-medium">Booking not found</div>;
  }

  const { booking, segments, passengers } = detail;

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-8">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-6">
        
        {/* Top Control Header */}
        <div className="bg-white p-6 rounded-2xl border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-slate-900 font-mono">PNR: {booking.pnr}</h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {booking.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">Contact: {booking.contact_name} ({booking.contact_email}) • Booked on {new Date(booking.created_at).toLocaleDateString()}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleResendEmail} size="sm" variant="outline" className="gap-1 text-slate-700">
              <Mail className="w-4 h-4" /> Resend Confirmation
            </Button>
            <Button onClick={handleSendDocuments} size="sm" variant="outline" className="gap-1 text-slate-700">
              <FileText className="w-4 h-4" /> Email Documents
            </Button>
            {booking.status === 'CONFIRMED' && (
              <Button onClick={handleOpenCancelModal} size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-1">
                <XCircle className="w-4 h-4" /> Cancel Trip
              </Button>
            )}
          </div>
        </div>

        {/* Travel Alerts & Check-In Link */}
        {travelAlerts.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Travel Alert: </span>
              {travelAlerts.map((a, i) => <span key={i}>{a.message} </span>)}
            </div>
          </div>
        )}

        {checkInInfo && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-blue-900">Online Check-in is Open</p>
              <p className="text-xs text-blue-700">{checkInInfo.note}</p>
            </div>
            <a href={checkInInfo.check_in_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5">
              Check-in Now <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Itinerary & Segments */}
            <div className="bg-white p-6 rounded-2xl border shadow-xs flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Flight Itinerary</h2>
              <div className="flex flex-col gap-4">
                {segments.map((seg, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-blue-600">{seg.flight_number}</span>
                      <p className="text-base font-bold text-slate-900">{seg.departure_time} → {seg.arrival_time}</p>
                    </div>
                    {flightStatus && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Status: {flightStatus.status || 'SCHEDULED'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Passengers & E-Tickets */}
            <div className="bg-white p-6 rounded-2xl border shadow-xs flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Passengers & E-Tickets</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {passengers.map((pax, idx) => {
                  const t = etickets.find((ticket) => ticket.passenger_name === pax.full_name) || etickets[idx];
                  return (
                    <div key={idx} className="p-4 bg-slate-50 border rounded-xl flex flex-col gap-1">
                      <p className="text-sm font-bold text-slate-900">{pax.full_name}</p>
                      <p className="text-xs text-slate-500">Type: {pax.passenger_type}</p>
                      {t && (
                        <p className="text-xs text-blue-600 font-mono font-bold mt-1">
                          E-Ticket: {t.ticket_number}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions for Flight Change / Review */}
            <div className="bg-white p-6 rounded-2xl border shadow-xs flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Need to change your flight or leave feedback?</p>
                <p className="text-xs text-slate-500">Request flight change or rate your airline experience.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setChangeModalOpen(true)} size="sm" variant="outline" className="gap-1">
                  <RefreshCw className="w-4 h-4" /> Change Flight
                </Button>
                <Button onClick={() => setReviewModalOpen(true)} size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1">
                  <Star className="w-4 h-4" /> Add Review
                </Button>
              </div>
            </div>

          </div>

          {/* Payment & Receipt Summary Sidebar */}
          <div className="bg-white p-6 rounded-2xl border shadow-md flex flex-col gap-4 sticky top-20">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Receipt & Total</h2>
            
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Total Amount Paid</span>
                <span className="text-base font-black text-slate-900">{booking.total_amount.toLocaleString()} VND</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Currency</span>
                <span>{booking.currency}</span>
              </div>
            </div>

            <Button onClick={() => window.print()} size="sm" variant="outline" className="w-full gap-2">
              <Printer className="w-4 h-4" /> Print Receipt
            </Button>
          </div>

        </div>
      </div>

      {/* Cancellation Dialog */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-900">Cancel Booking Confirmation</h2>
            {cancelPreview && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-1">
                <p>Refund Amount: <span className="font-bold">{cancelPreview.refund_amount?.toLocaleString()} VND</span></p>
                <p>Cancellation Fee: <span className="font-bold">{cancelPreview.cancellation_fee?.toLocaleString()} VND</span></p>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Reason for cancellation</label>
              <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Change of plans" />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>Back</Button>
              <Button onClick={handleConfirmCancel} className="bg-red-600 text-white font-bold">Confirm Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Flight Change Dialog */}
      {changeModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-900">Flight Change Wizard</h2>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700">New Fare ID</label>
              <Input value={newFareId} onChange={(e) => setNewFareId(e.target.value)} placeholder="fare-002" />
              <Button onClick={handleQuoteChange} size="sm" variant="outline" className="w-fit">Get Quote</Button>
            </div>

            {changeQuoteRes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                <p>Price Difference: <span className="font-bold">{changeQuoteRes.price_difference?.toLocaleString()} VND</span></p>
                <p>Change Fee: <span className="font-bold">{changeQuoteRes.change_fee?.toLocaleString()} VND</span></p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">New Flight ID</label>
              <Input value={newFlightId} onChange={(e) => setNewFlightId(e.target.value)} placeholder="flight-sgn-han-002" />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setChangeModalOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmChange} className="bg-blue-600 text-white font-bold">Confirm Change</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Review Dialog */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-900">Write Airline Review</h2>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Rating (1 - 5 stars)</label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full text-xs p-2 border rounded-xl">
                {[5, 4, 3, 2, 1].map((s) => (
                  <option key={s} value={s}>{s} Stars</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Review Title</label>
              <Input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="Great flight experience" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Review Details</label>
              <textarea value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} className="w-full text-xs p-2 border rounded-xl h-24" placeholder="Tell us about the cabin service, food, and punctuality..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitReview} className="bg-amber-500 hover:bg-amber-600 text-white font-bold">Submit Review</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
