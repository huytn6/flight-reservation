import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import { toast } from 'sonner';

export const AdminFinance: React.FC = () => {
  const [subTab, setSubTab] = useState<'BOOKINGS' | 'PAYMENTS' | 'REFUNDS'>('BOOKINGS');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (subTab === 'BOOKINGS') {
        const res = await adminService.getBookings();
        setItems(res.items || []);
      } else if (subTab === 'PAYMENTS') {
        const res = await adminService.getPayments();
        setItems(res.items || []);
      } else {
        const res = await adminService.getRefunds();
        setItems(res.items || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      await adminService.updateBookingStatus(id, newStatus);
      toast.success(`Booking status changed to ${newStatus}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update booking status');
    }
  };

  const handleUpdatePaymentStatus = async (id: string, newStatus: string) => {
    try {
      await adminService.updatePaymentStatus(id, newStatus);
      toast.success(`Payment status changed to ${newStatus}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update payment status');
    }
  };

  const handleUpdateRefundStatus = async (id: string, newStatus: string) => {
    try {
      await adminService.updateRefundStatus(id, newStatus);
      toast.success(`Refund status changed to ${newStatus}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update refund status');
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Bookings & Financial Control</h1>
          <p className="text-xs text-slate-500">Monitor all system bookings, override payment status, and process refund requests.</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border gap-1 text-xs font-semibold">
          {['BOOKINGS', 'PAYMENTS', 'REFUNDS'].map((t) => (
            <button
              key={t}
              onClick={() => setSubTab(t as any)}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                subTab === t ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-xs">
        <h2 className="text-base font-bold text-slate-900 border-b pb-3 mb-3">{subTab} Records</h2>

        {loading ? (
          <p className="text-xs text-slate-500">Loading records...</p>
        ) : (
          <div className="overflow-x-auto">
            {subTab === 'BOOKINGS' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">PNR</th>
                    <th className="pb-2">Contact</th>
                    <th className="pb-2">Total Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-mono font-bold text-emerald-700">{b.pnr}</td>
                      <td className="py-2.5">
                        <p className="font-bold text-slate-900">{b.contact_name}</p>
                        <p className="text-[10px] text-slate-400">{b.contact_email}</p>
                      </td>
                      <td className="py-2.5 font-bold text-slate-900">{b.total_amount?.toLocaleString()} VND</td>
                      <td className="py-2.5">
                        <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">{b.status}</span>
                      </td>
                      <td className="py-2.5 text-right flex justify-end gap-1">
                        <button onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')} className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded">
                          Confirm
                        </button>
                        <button onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')} className="px-2 py-1 text-[10px] font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {subTab === 'PAYMENTS' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">Payment ID</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-mono font-bold text-slate-800">{p.id.substring(0, 8)}...</td>
                      <td className="py-2.5 font-bold text-slate-700">{p.payment_method}</td>
                      <td className="py-2.5 font-bold text-emerald-700">{p.amount?.toLocaleString()} VND</td>
                      <td className="py-2.5 font-bold text-[10px]">{p.status}</td>
                      <td className="py-2.5 text-right flex justify-end gap-1">
                        <button onClick={() => handleUpdatePaymentStatus(p.id, 'SUCCESS')} className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded">
                          Set Success
                        </button>
                        <button onClick={() => handleUpdatePaymentStatus(p.id, 'FAILED')} className="px-2 py-1 text-[10px] font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded">
                          Set Failed
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {subTab === 'REFUNDS' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">Refund ID</th>
                    <th className="pb-2">Booking ID</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-mono text-slate-800">{r.id.substring(0, 8)}...</td>
                      <td className="py-2.5 font-mono text-slate-600">{r.booking_id?.substring(0, 8)}...</td>
                      <td className="py-2.5 font-bold text-red-600">{r.amount?.toLocaleString()} VND</td>
                      <td className="py-2.5 font-bold text-[10px]">{r.status}</td>
                      <td className="py-2.5 text-right flex justify-end gap-1">
                        <button onClick={() => handleUpdateRefundStatus(r.id, 'APPROVED')} className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded">
                          Approve
                        </button>
                        <button onClick={() => handleUpdateRefundStatus(r.id, 'REJECTED')} className="px-2 py-1 text-[10px] font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded">
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
