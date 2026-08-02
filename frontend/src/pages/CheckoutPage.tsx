import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { draftService, type DraftContact, type DraftPassenger, type PriceBreakdown } from '@/services/draft';
import { userService } from '@/services/user';
import { bookingService } from '@/services/booking';
import { useAuthStore } from '@/store/use-auth';
import { SeatMapSelector } from '@/components/checkout/SeatMapSelector';
import { PaymentModal } from '@/components/checkout/PaymentModal';
import type { SavedPassenger } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UserCheck, CreditCard, Lock } from 'lucide-react';


export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const draftId = searchParams.get('draft_id') || '';

  // Form states
  const [contact, setContact] = useState<DraftContact>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
  });

  const [passengers, setPassengers] = useState<Partial<DraftPassenger>[]>([
    { passenger_index: 0, passenger_type: 'ADULT', full_name: user?.full_name || '' },
  ]);

  const [savedPassengers, setSavedPassengers] = useState<SavedPassenger[]>([]);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Payment modal state
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!draftId) {
      toast.error('No booking draft found');
      navigate('/');
      return;
    }
    loadData();
  }, [draftId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [draftData, summaryData] = await Promise.all([
        draftService.getDraft(draftId),
        draftService.getPriceBreakdown(draftId),
      ]);

      if (draftData.contact) {
        setContact(draftData.contact);
      }
      if (draftData.passengers && draftData.passengers.length > 0) {
        setPassengers(draftData.passengers);
      }
      setBreakdown(summaryData);

      if (isAuthenticated) {
        const saved = await userService.getSavedPassengers();
        setSavedPassengers(saved || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load checkout details');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillPassenger = (saved: SavedPassenger, index: number) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        full_name: saved.full_name,
        date_of_birth: saved.date_of_birth,
        nationality: saved.nationality,
        passport_number: saved.passport_number,
        passport_expiry: saved.passport_expiry,
      };
      return next;
    });
    toast.info(`Autofilled Passenger ${index + 1} with ${saved.full_name}`);
  };

  const handleAddPassengerInput = () => {
    setPassengers((prev) => [
      ...prev,
      { passenger_index: prev.length, passenger_type: 'ADULT', full_name: '' },
    ]);
  };

  const handleSaveContactAndPassengers = async () => {
    if (!contact.full_name || !contact.email || !contact.phone) {
      toast.error('Please complete contact details');
      return false;
    }
    for (const p of passengers) {
      if (!p.full_name) {
        toast.error('All passengers must have a full name');
        return false;
      }
    }
    try {
      await draftService.saveContact(draftId, contact);
      await draftService.savePassengers(draftId, passengers);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to save traveler information');
      return false;
    }
  };

  const handleCreateBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to complete booking');
      navigate('/signin');
      return;
    }

    const savedOk = await handleSaveContactAndPassengers();
    if (!savedOk) return;

    setSubmitting(true);
    try {
      const bookingRes = await bookingService.createBooking(draftId);
      toast.success('Booking created successfully! Opening payment...');
      setCreatedBookingId(bookingRes.id);
      setIsPaymentModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen p-12 text-center text-slate-500 font-medium">Loading checkout details...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-8">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Checkout & Passenger Details</h1>
            <p className="text-xs text-slate-500 mt-0.5">Complete your details to confirm your flight reservation.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-bold">
            <Lock className="w-3.5 h-3.5" /> 256-bit SSL Secure Checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Form Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Contact Information Form */}
            <div className="bg-white p-6 rounded-2xl border shadow-xs flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" /> Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                  <Input value={contact.full_name} onChange={(e) => setContact({ ...contact, full_name: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                  <Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+84 901 234 567" required />
                </div>
              </div>
            </div>

            {/* Passenger Details Form */}
            <div className="bg-white p-6 rounded-2xl border shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Passenger Information</h2>
                <Button onClick={handleAddPassengerInput} size="sm" variant="outline" className="text-blue-600 border-blue-200">
                  + Add Passenger
                </Button>
              </div>

              {passengers.map((pax, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border rounded-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-blue-700">Passenger {idx + 1} ({pax.passenger_type})</span>
                    
                    {/* Saved passenger autofill options */}
                    {savedPassengers.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500">Autofill:</span>
                        {savedPassengers.map((saved) => (
                          <button
                            key={saved.id}
                            type="button"
                            onClick={() => handleAutofillPassenger(saved, idx)}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold"
                          >
                            {saved.full_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Full Name (as in passport)</label>
                      <Input
                        value={pax.full_name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPassengers((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], full_name: val };
                            return next;
                          });
                        }}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Date of Birth</label>
                      <Input
                        type="date"
                        value={pax.date_of_birth || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPassengers((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], date_of_birth: val };
                            return next;
                          });
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nationality</label>
                      <Input
                        value={pax.nationality || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPassengers((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], nationality: val };
                            return next;
                          });
                        }}
                        placeholder="Vietnam"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Passport Number</label>
                      <Input
                        value={pax.passport_number || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPassengers((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], passport_number: val };
                            return next;
                          });
                        }}
                        placeholder="B1234567"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Seat Selection Map */}
            <SeatMapSelector
              draftId={draftId}
              segmentId="sgn-han-seg-1"
              passengerCount={passengers.length}
              onSeatHoldsChange={() => {
                draftService.getPriceBreakdown(draftId).then(setBreakdown);
              }}
            />

          </div>

          {/* Right Summary Sidebar */}
          <div className="bg-white p-6 rounded-2xl border shadow-md flex flex-col gap-4 sticky top-20">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Final Order Summary</h2>

            {breakdown && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Base Fares</span>
                  <span>{breakdown.fares_total.toLocaleString()} VND</span>
                </div>
                {breakdown.ancillary_total > 0 && (
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Seats & Add-ons</span>
                    <span>+{breakdown.ancillary_total.toLocaleString()} VND</span>
                  </div>
                )}
                {breakdown.coupon_discount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600">
                    <span>Discount</span>
                    <span>-{breakdown.coupon_discount.toLocaleString()} VND</span>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">Total Due</span>
                  <span className="text-xl font-black text-blue-600">{breakdown.grand_total.toLocaleString()} VND</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleCreateBooking}
              disabled={submitting}
              className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-bold py-4 rounded-full shadow-lg flex items-center justify-center gap-2 mt-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{submitting ? 'Creating Booking...' : 'Confirm & Proceed to Payment'}</span>
            </Button>
          </div>

        </div>
      </div>

      {/* Payment Modal (Module 5 integration) */}
      {isPaymentModalOpen && createdBookingId && (
        <PaymentModal
          bookingId={createdBookingId}
          amount={breakdown?.grand_total || 0}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            navigate(`/bookings/${createdBookingId}`);
          }}
        />
      )}
    </div>
  );
};
