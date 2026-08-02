import React, { useState } from 'react';
import { paymentService, type Payment, type PaymentTransaction } from '@/services/payment';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CreditCard, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface PaymentModalProps {
  bookingId: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  bookingId,
  amount,
  onClose,
  onSuccess,
}) => {
  const [method, setMethod] = useState<'CARD' | 'MOMO' | 'BANK_TRANSFER'>('CARD');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInitPayment = async () => {
    setLoading(true);
    try {
      const res = await paymentService.createPayment(bookingId, method);
      setPayment(res);
      toast.success('Payment session initiated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSuccess = async () => {
    if (!payment) return;
    setLoading(true);
    try {
      const res = await paymentService.simulateSuccess(payment.id);
      setPayment(res);
      toast.success('Payment succeeded!');
      loadTransactions(payment.id);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateFailure = async () => {
    if (!payment) return;
    setLoading(true);
    try {
      const res = await paymentService.simulateFailure(payment.id);
      setPayment(res);
      toast.error('Payment failed!');
      loadTransactions(payment.id);
    } catch (err: any) {
      toast.error(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!payment) return;
    setLoading(true);
    try {
      const res = await paymentService.retryPayment(payment.id);
      setPayment(res);
      toast.info('Payment retried');
      loadTransactions(payment.id);
    } catch (err: any) {
      toast.error(err.message || 'Retry failed');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (paymentId: string) => {
    try {
      const txs = await paymentService.getTransactions(paymentId);
      setTransactions(txs || []);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 border">
        
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <CreditCard className="w-5 h-5 text-blue-600" /> Payment Simulation
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {amount.toLocaleString()} VND
          </span>
        </div>

        {!payment ? (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-600">Select payment method for your booking:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'CARD', label: 'Credit Card', icon: '💳' },
                { code: 'MOMO', label: 'MoMo Wallet', icon: '📱' },
                { code: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦' },
              ].map((m) => (
                <button
                  key={m.code}
                  onClick={() => setMethod(m.code as any)}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                    method === m.code ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold shadow-xs' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-[11px]">{m.label}</span>
                </button>
              ))}
            </div>

            <Button
              onClick={handleInitPayment}
              disabled={loading}
              className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-bold py-3 rounded-full shadow-md mt-2"
            >
              {loading ? 'Initiating...' : 'Proceed to Payment'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Payment ID: <span className="font-mono text-slate-800">{payment.id.substring(0, 8)}...</span></p>
                <p className="text-xs text-slate-500">Method: <span className="font-bold text-slate-800">{payment.payment_method}</span></p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                payment.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : payment.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {payment.status}
              </span>
            </div>

            {payment.status === 'PENDING' && (
              <div className="flex flex-col gap-2.5">
                <p className="text-xs font-bold text-slate-700 text-center">Simulate Payment Gateway Outcome:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleSimulateSuccess}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 rounded-xl"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Success
                  </Button>
                  <Button
                    onClick={handleSimulateFailure}
                    disabled={loading}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 font-bold gap-1 rounded-xl"
                  >
                    <XCircle className="w-4 h-4" /> Failure
                  </Button>
                </div>
              </div>
            )}

            {payment.status === 'FAILED' && (
              <Button
                onClick={handleRetry}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 rounded-xl"
              >
                <RefreshCw className="w-4 h-4" /> Retry Payment
              </Button>
            )}

            {transactions.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs font-bold text-slate-700 mb-2">Transaction History:</p>
                <div className="max-h-32 overflow-y-auto space-y-1 text-[11px]">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-2 bg-slate-100 rounded-lg flex justify-between">
                      <span>{tx.transaction_type} ({tx.status})</span>
                      <span className="font-bold">{tx.amount.toLocaleString()} VND</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end border-t pt-3">
          <Button variant="ghost" onClick={onClose} size="sm" className="text-slate-500">
            Cancel / Close
          </Button>
        </div>
      </div>
    </div>
  );
};
