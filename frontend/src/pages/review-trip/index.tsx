import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { draftService, type PriceBreakdown, type AncillaryItem, type InsuranceOption } from '@/services/draft';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ShieldCheck, Tag, ShoppingBag, Plus, Trash2, ArrowRight } from 'lucide-react';

export const ReviewTrip: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [draftId, setDraftId] = useState<string | null>(searchParams.get('draft_id'));
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [ancillaries, setAncillaries] = useState<{ selected: AncillaryItem[]; available: AncillaryItem[] } | null>(null);
  const [insuranceOptions, setInsuranceOptions] = useState<InsuranceOption[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initOrLoadDraft();
  }, [draftId]);

  const initOrLoadDraft = async () => {
    setLoading(true);
    try {
      let currentId = draftId;
      if (!currentId) {
        // If no draft_id in URL, create demo draft for user
        const newDraft = await draftService.createDraft([
          { flight_id: 'flight-sgn-han-001', fare_id: 'fare-001' },
        ]);
        currentId = newDraft.id;
        setDraftId(currentId);
      }

      const [breakdownRes, ancRes, insRes] = await Promise.all([
        draftService.getPriceBreakdown(currentId!),
        draftService.getAncillaries(currentId!),
        draftService.getInsuranceOptions(currentId!),
      ]);

      setBreakdown(breakdownRes);
      setAncillaries(ancRes);
      setInsuranceOptions(insRes || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load booking draft');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftId || !couponCode.trim()) return;
    try {
      const res = await draftService.applyCoupon(draftId, couponCode);
      toast.success(`Coupon ${res.code} applied! Saved ${res.discount.toLocaleString()} VND`);
      setCouponCode('');
      refreshBreakdown();
    } catch (err: any) {
      toast.error(err.message || 'Invalid coupon code');
    }
  };

  const handleAddInsurance = async (code: string) => {
    if (!draftId) return;
    try {
      await draftService.addInsurance(draftId, code);
      toast.success('Travel insurance added');
      refreshBreakdown();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add insurance');
    }
  };

  const handleRemoveInsurance = async () => {
    if (!draftId) return;
    try {
      await draftService.removeInsurance(draftId);
      toast.info('Insurance removed');
      refreshBreakdown();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove insurance');
    }
  };

  const handleAddAncillary = async (item: AncillaryItem) => {
    if (!draftId) return;
    try {
      await draftService.addAncillary(draftId, item);
      toast.success(`Added ${item.name}`);
      refreshBreakdown();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add ancillary');
    }
  };

  const handleDeleteAncillary = async (itemId: string) => {
    if (!draftId) return;
    try {
      await draftService.deleteAncillary(draftId, itemId);
      toast.info('Ancillary removed');
      refreshBreakdown();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove ancillary');
    }
  };

  const refreshBreakdown = async () => {
    if (!draftId) return;
    try {
      const b = await draftService.getPriceBreakdown(draftId);
      setBreakdown(b);
      const anc = await draftService.getAncillaries(draftId);
      setAncillaries(anc);
    } catch {
      // ignore
    }
  };

  const handleProceedToCheckout = () => {
    if (draftId) {
      navigate(`/checkout?draft_id=${draftId}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen p-12 text-center text-slate-500 font-medium">Loading booking draft...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-8">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Review Your Trip & Extras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Travel Insurance Options Card */}
            <div className="bg-white p-6 rounded-2xl border shadow-xs flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Travel Protection Insurance
              </h2>
              <p className="text-xs text-slate-500">Protect your trip against cancellation, medical emergencies, and baggage delay.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {insuranceOptions.map((opt) => (
                  <div key={opt.code} className="p-4 border rounded-xl bg-emerald-50/50 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-slate-800">{opt.name}</span>
                        <span className="font-bold text-emerald-700 text-sm">{opt.price.toLocaleString()} VND</span>
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {opt.covers.map((c, i) => (
                          <li key={i}>✓ {c}</li>
                        ))}
                      </ul>
                    </div>
                    <Button onClick={() => handleAddInsurance(opt.code)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                      Select Plan
                    </Button>
                  </div>
                ))}
              </div>
              <button onClick={handleRemoveInsurance} className="text-xs text-slate-500 underline text-left hover:text-slate-800">
                Decline travel insurance
              </button>
            </div>

            {/* Ancillaries Add-ons (Extra Baggage, Meals, Priority Boarding) */}
            <div className="bg-white p-6 rounded-2xl border shadow-xs flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" /> Additional Baggage & Services
              </h2>
              
              {/* Selected Ancillaries */}
              {ancillaries?.selected && ancillaries.selected.length > 0 && (
                <div className="flex flex-col gap-2 border-b pb-4">
                  <h3 className="text-xs font-bold text-slate-600 uppercase">Selected Add-ons</h3>
                  {ancillaries.selected.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.price.toLocaleString()} VND x {item.quantity || 1}</p>
                      </div>
                      <button onClick={() => item.id && handleDeleteAncillary(item.id)} className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Catalog */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ancillaries?.available.map((item) => (
                  <div key={item.code} className="p-3 border rounded-xl bg-slate-50 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-blue-600 font-semibold">{item.price.toLocaleString()} VND</p>
                    </div>
                    <Button onClick={() => handleAddAncillary(item)} size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-1 rounded-lg">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Code Card */}
            <div className="bg-white p-6 rounded-2xl border shadow-xs flex flex-col gap-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" /> Apply Coupon / Discount Code
              </h2>
              <form onSubmit={handleApplyCoupon} className="flex gap-2 max-w-md">
                <Input
                  placeholder="Enter code (e.g. SUMMER2026)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="rounded-xl text-sm"
                />
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl px-5">
                  Apply
                </Button>
              </form>
            </div>

          </div>

          {/* Price Breakdown Sidebar */}
          <div className="bg-white p-6 rounded-2xl border shadow-md flex flex-col gap-4 sticky top-20">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Price Breakdown</h2>
            
            {breakdown && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Flights Fare Subtotal</span>
                  <span>{breakdown.fares_total.toLocaleString()} VND</span>
                </div>
                {breakdown.ancillary_total > 0 && (
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Add-ons & Insurance</span>
                    <span>+{breakdown.ancillary_total.toLocaleString()} VND</span>
                  </div>
                )}
                {breakdown.coupon_discount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600">
                    <span>Coupon Discount</span>
                    <span>-{breakdown.coupon_discount.toLocaleString()} VND</span>
                  </div>
                )}
                
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">Grand Total</span>
                  <span className="text-xl font-black text-blue-600">{breakdown.grand_total.toLocaleString()} VND</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleProceedToCheckout}
              className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-bold py-3.5 rounded-full shadow-lg flex items-center justify-center gap-2 mt-2"
            >
              <span>Continue to Traveler Details</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
