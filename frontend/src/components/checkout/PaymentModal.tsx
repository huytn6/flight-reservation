import React, { useState } from 'react';
import { paymentService, type Payment, type PaymentTransaction } from '@/services/payment';
import { PaymentMethodEnum, PaymentStatusEnum } from '@/types/enums';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CreditCard, Smartphone, Landmark, Check, XCircle, RefreshCw } from 'lucide-react';

interface PaymentModalProps {
  bookingId: string;
  amount: number;
  initialPayment?: Payment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  bookingId,
  amount,
  initialPayment,
  onClose,
  onSuccess,
}) => {
  const [method, setMethod] = useState<PaymentMethodEnum>(
    (initialPayment?.payment_method as PaymentMethodEnum) || PaymentMethodEnum.CARD
  );
  const [payment, setPayment] = useState<Payment | null>(initialPayment ?? null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (initialPayment?.id) {
      loadTransactions(initialPayment.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInitPayment = async () => {
    setLoading(true);
    try {
      const res = await paymentService.createPayment(bookingId, method);
      setPayment(res);
      toast.success('Khởi tạo phiên thanh toán thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Khởi tạo thanh toán thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSuccess = async () => {
    if (!payment) return;
    setLoading(true);
    try {
      const res = await paymentService.simulateSuccess(payment.id);
      setPayment((prev) => (prev ? { ...prev, ...res } : res));
      toast.success('Thanh toán thành công! Vé đã được xác nhận.');
      if (payment?.id) {
        loadTransactions(payment.id);
      }
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      if (err.code === 'PAYMENT_ALREADY_PROCESSED' || err.message?.includes(PaymentStatusEnum.SUCCESS)) {
        toast.success('Đơn hàng này đã được thanh toán thành công từ trước!');
        onSuccess();
      } else {
        toast.error(err.message || 'Xác nhận thanh toán thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateFailure = async () => {
    if (!payment) return;
    setLoading(true);
    try {
      const res = await paymentService.simulateFailure(payment.id);
      setPayment((prev) => (prev ? { ...prev, ...res } : res));
      toast.error('Thanh toán thất bại!');
      if (payment?.id) {
        loadTransactions(payment.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Xử lý thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!payment) return;
    setLoading(true);
    try {
      const res = await paymentService.retryPayment(payment.id);
      setPayment((prev) => (prev ? { ...prev, ...res } : res));
      toast.info('Đã thử lại phiên thanh toán');
      if (payment?.id) {
        loadTransactions(payment.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Thử lại thất bại');
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

  const paymentMethods = [
    { code: PaymentMethodEnum.CARD, label: 'Thẻ Quốc Tế', icon: <CreditCard className="w-5 h-5 text-[#0065eb]" /> },
    { code: PaymentMethodEnum.MOMO, label: 'Ví MoMo', icon: <Smartphone className="w-5 h-5 text-pink-600" /> },
    { code: PaymentMethodEnum.BANK_TRANSFER, label: 'Chuyển Khoản', icon: <Landmark className="w-5 h-5 text-emerald-600" /> },
  ];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-xl rounded-2xl p-6 font-sans">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <CreditCard className="w-4 h-4 text-[#0065eb]" /> Cổng Thanh Toán An Toàn
            </DialogTitle>
            <span className="text-xs font-mono font-bold text-[#0065eb] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              {Number(amount || 0).toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Chọn phương thức thanh toán để hoàn tất đơn đặt vé máy bay của bạn.
          </DialogDescription>
        </DialogHeader>

        {!payment ? (
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-xs font-medium text-slate-700">Chọn phương thức thanh toán:</p>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((m) => (
                <button
                  key={m.code}
                  type="button"
                  onClick={() => setMethod(m.code)}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    method === m.code ? 'border-[#0065eb] bg-blue-50/80 text-[#0065eb] font-semibold' : 'border-slate-200/80 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-100/70 flex items-center justify-center">
                    {m.icon}
                  </div>
                  <span className="text-[11px] font-medium">{m.label}</span>
                </button>
              ))}
            </div>

            <Button
              onClick={handleInitPayment}
              disabled={loading}
              className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs py-2.5 rounded-lg mt-2 cursor-pointer shadow-none h-9.5"
            >
              {loading ? 'Đang khởi tạo cổng thanh toán...' : 'Tiến Hành Thanh Toán Ngay'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <p className="text-slate-500">Mã giao dịch: <span className="font-mono text-slate-800 font-semibold">{payment.id ? payment.id.substring(0, 8) : 'GIAODICH'}...</span></p>
                <p className="text-slate-500 mt-0.5">Phương thức: <span className="font-medium text-slate-800">{payment.payment_method || 'Thẻ Quốc Tế'}</span></p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                payment.status === PaymentStatusEnum.SUCCESS ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : payment.status === PaymentStatusEnum.FAILED ? 'bg-rose-50 text-rose-700 border border-rose-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60'
              }`}>
                {payment.status === PaymentStatusEnum.SUCCESS ? 'Thành công' : payment.status === PaymentStatusEnum.FAILED ? 'Thất bại' : 'Đang xử lý'}
              </span>
            </div>

            {payment.status === PaymentStatusEnum.SUCCESS && (
              <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl text-center flex flex-col items-center gap-2">
                <Check className="w-7 h-7 text-emerald-600 stroke-[3] animate-bounce" />
                <p className="text-xs font-semibold text-emerald-800">Thanh Toán Thành Công!</p>
                <p className="text-[11px] text-emerald-600">Vé máy bay của bạn đã được phát hành thành công.</p>
                <Button
                  onClick={onSuccess}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8.5 px-4 rounded-lg mt-1 cursor-pointer shadow-none"
                >
                  Xem Vé Điện Tử Ngay
                </Button>
              </div>
            )}

            {payment.status === PaymentStatusEnum.PENDING && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-slate-700 text-center">Mô phỏng phản hồi từ cổng thanh toán:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleSimulateSuccess}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-normal text-xs gap-1 rounded-lg cursor-pointer shadow-none h-9"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" /> Thành Công
                  </Button>
                  <Button
                    onClick={handleSimulateFailure}
                    disabled={loading}
                    variant="outline"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 font-normal text-xs gap-1 rounded-lg cursor-pointer shadow-none h-9"
                  >
                    <XCircle className="w-4 h-4" /> Thất Bại
                  </Button>
                </div>
              </div>
            )}

            {payment.status === PaymentStatusEnum.FAILED && (
              <Button
                onClick={handleRetry}
                disabled={loading}
                className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs gap-2 rounded-lg cursor-pointer shadow-none h-9.5"
              >
                <RefreshCw className="w-4 h-4" /> Thử Thử Lại Thanh Toán
              </Button>
            )}

            {transactions.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-700 mb-2">Lịch sử giao dịch:</p>
                <div className="max-h-32 overflow-y-auto space-y-1 text-[11px]">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-2 bg-slate-50 rounded-md flex justify-between">
                      <span>{tx.event_type}</span>
                      <span className="font-mono font-semibold">{Number(tx.amount || 0).toLocaleString('vi-VN')} VNĐ</span>
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
