import React, { useEffect, useState } from 'react';
import { reviewService, type AirlineReview } from '@/services/review';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Flag, Trash2, X } from 'lucide-react';
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
      toast.success('Report submitted to moderators');
      setReportingReviewId(null);
      setReportReason('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit report');
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      toast.success('Review deleted');
      loadReviews();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete review');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[85vh] flex flex-col justify-between shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{airlineName} Reviews</h2>
            <p className="text-xs text-slate-500">Customer feedback and ratings</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y max-h-96 overflow-y-auto pr-1 flex-1">
          {loading ? (
            <p className="text-xs text-slate-500 text-center py-8">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No reviews yet for this airline.</p>
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
                      className="text-slate-400 hover:text-amber-600 p-1"
                      title="Report review"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {r.title && <p className="font-bold text-slate-900">{r.title}</p>}
                {r.body && <p className="text-slate-600 leading-relaxed">{r.body}</p>}
                <span className="text-[10px] text-slate-400">By {r.user_name || 'Passenger'} • {new Date(r.created_at).toLocaleDateString()}</span>

                {reportingReviewId === r.id && (
                  <div className="mt-2 p-2 bg-amber-50 rounded-xl border border-amber-200 flex gap-2">
                    <Input
                      placeholder="Reason for report..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="text-xs rounded-lg flex-1"
                    />
                    <Button onClick={() => handleReport(r.id)} size="sm" className="bg-amber-600 text-white text-xs">
                      Submit
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t flex justify-end">
          <Button onClick={onClose} variant="ghost" size="sm">Close</Button>
        </div>
      </div>
    </div>
  );
};
