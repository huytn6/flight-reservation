import React, { useEffect, useState } from 'react';
import { reviewService, type AirlineReview } from '@/services/review';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Star, Flag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AirlineReviewsModalProps {
  airlineId: string;
  airlineName: string;
  onClose: () => void;
}

export const AirlineReviewsModal: React.FC<AirlineReviewsModalProps> = ({
  airlineId,
  airlineName,
  onClose,
}) => {
  const [reviews, setReviews] = useState<AirlineReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportReason, setReportReason] = useState('');
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [airlineId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getAirlineReviews(airlineId);
      setReviews(res || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (reviewId: string) => {
    if (!reportReason.trim()) return;
    try {
      await reviewService.reportReview(reviewId, reportReason);
      toast.success('Đã gửi báo cáo cho quản trị viên');
      setReportingReviewId(null);
      setReportReason('');
    } catch (err: any) {
      toast.error(err.message || 'Gửi báo cáo thất bại');
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      toast.success('Đã xóa đánh giá');
      loadReviews();
    } catch (err: any) {
      toast.error(err.message || 'Xóa đánh giá thất bại');
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col justify-between">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">
            Đánh giá hãng bay {airlineName}
          </DialogTitle>
          <DialogDescription>
            Phản hồi và đánh giá từ hành khách
          </DialogDescription>
        </DialogHeader>

        <div className="divide-y max-h-96 overflow-y-auto pr-1 flex-1 py-2">
          {loading ? (
            <p className="text-xs text-slate-500 text-center py-8">Đang tải đánh giá...</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">Chưa có đánh giá nào cho hãng bay này.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="py-3 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    <span className="text-slate-800 text-xs ml-1">{r.rating}/5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReportingReviewId(r.id)}
                      className="text-slate-400 hover:text-amber-600 p-1 cursor-pointer"
                      title="Báo cáo đánh giá"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      title="Xóa đánh giá"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {r.title && <p className="font-bold text-slate-900">{r.title}</p>}
                {r.body && <p className="text-slate-600 leading-relaxed">{r.body}</p>}
                <span className="text-[10px] text-slate-400">Bởi {r.user_name || 'Hành khách'} • {new Date(r.created_at).toLocaleDateString('vi-VN')}</span>

                {reportingReviewId === r.id && (
                  <div className="mt-2 p-2 bg-amber-50 rounded-xl border border-amber-200 flex gap-2">
                    <Input
                      placeholder="Lý do báo cáo..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="text-xs rounded-lg flex-1"
                    />
                    <Button onClick={() => handleReport(r.id)} size="sm" className="bg-amber-600 text-white text-xs">
                      Gửi
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" size="sm">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
