import React, { useState } from 'react';
import { paymentService, type Payment, type PaymentTransaction } from '@/services/payment';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-2xl rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <CreditCard className="w-5 h-5 text-blue-600" /> Payment Processing
            </DialogTitle>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              {amount.toLocaleString()} VND
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Complete your booking payment via supported gateways.
          </DialogDescription>
        </DialogHeader>

        {!payment ? (
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-xs font-medium text-slate-700">Select payment method:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'CARD', label: 'Credit Card', icon: '💳' },
                { code: 'MOMO', label: 'MoMo Wallet', icon: '📱' },
                { code: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦' },
              ].map((m) => (
                <button
                  key={m.code}
                  onClick={() => setMethod(m.code as any)}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    method === m.code ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
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
              className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-bold py-2.5 rounded-full mt-2"
            >
              {loading ? 'Initiating...' : 'Proceed to Payment'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
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
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-slate-700 text-center">Simulate Payment Gateway Response:</p>
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
              <div className="border-t border-slate-200 pt-3">
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
      </DialogContent>
    </Dialog>
  );
};
