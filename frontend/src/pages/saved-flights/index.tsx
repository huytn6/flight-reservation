import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightService, type SavedFlight } from '@/services/flight';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Bookmark, Search, Plane, Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';

export const SavedFlights: React.FC = () => {
  const [savedFlights, setSavedFlights] = useState<SavedFlight[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const res = await flightService.getSavedFlights();
      setSavedFlights(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách chuyến bay đã lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (id: string, routeName: string) => {
    try {
      await flightService.unsaveFlight(id);
      toast.info(`Đã bỏ lưu chặng bay ${routeName}`);
      loadSaved();
    } catch (err: any) {
      toast.error(err.message || 'Bỏ lưu thất bại');
    }
  };

  const filteredFlights = savedFlights.filter((sf) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (sf.origin && sf.origin.toLowerCase().includes(q)) ||
      (sf.destination && sf.destination.toLowerCase().includes(q)) ||
      (sf.flight_number && sf.flight_number.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-semibold shrink-0">
              <Bookmark className="w-5 h-5 text-[#0065eb]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Danh Sách Chuyến Bay Đã Lưu
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Lưu trữ các hành trình bay yêu thích của bạn để dễ dàng so sánh giá và đặt vé nhanh chóng.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="text-xs font-mono font-bold text-slate-700 bg-white border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs self-start sm:self-auto">
            Đã lưu: {savedFlights.length} chặng bay
          </Badge>
        </div>

        {/* Search Bar */}
        <Card className="bg-white p-4 rounded-2xl border-0 shadow-none flex items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã sân bay (SGN, HAN, DAD...)..."
              className="text-xs h-9 pl-9 bg-slate-50 border-slate-200 shadow-none focus-visible:bg-white"
            />
          </div>
        </Card>

        {/* Saved Flights Grid */}
        {loading ? (
          <LoadingState message="Đang nạp danh sách chuyến bay đã lưu..." />
        ) : filteredFlights.length === 0 ? (
          <EmptyState
            title="Chưa có chuyến bay lưu nào"
            description={
              searchQuery
                ? `Không tìm thấy chuyến bay nào khớp với từ khóa "${searchQuery}"`
                : 'Nhấn vào biểu tượng đánh dấu khi tìm kiếm chuyến bay để lưu giữ hành trình bạn quan tâm!'
            }
            actionLabel="Tìm Kiếm Chuyến Bay Mới"
            onAction={() => navigate('/flights-search')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFlights.map((sf) => {
              const routeLabel = `${sf.origin} → ${sf.destination}`;
              return (
                <Card
                  key={sf.id}
                  className="bg-white p-5 rounded-2xl border-0 shadow-none hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  {/* Card Header: Route & Saved Tag */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-[#0065eb] rounded-lg">
                        <Plane className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 font-mono tracking-wider uppercase">
                        {sf.flight_number || 'CHUYẾN BAY'}
                      </span>
                    </div>

                    <Bookmark className="w-4 h-4 text-[#0065eb]" />
                  </div>

                  {/* Flight Route Display */}
                  <div className="flex items-center justify-between gap-4 py-1">
                    <div>
                      <span className="text-lg font-bold text-slate-900 font-mono tracking-tight block">
                        {sf.origin}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block">Điểm đi</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-full flex items-center gap-1">
                        <div className="h-0.5 flex-1 bg-slate-200" />
                        <Plane className="w-4 h-4 text-[#0065eb] rotate-90" />
                        <div className="h-0.5 flex-1 bg-slate-200" />
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-900 font-mono tracking-tight block">
                        {sf.destination}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block">Điểm đến</span>
                    </div>
                  </div>

                  {/* Card Footer: Timestamp & Actions */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Đã lưu: {new Date(sf.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => navigate(`/flights-search?leavingFrom=${sf.origin}&goingTo=${sf.destination}`)}
                        size="sm"
                        className="bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs h-8 px-3 rounded-lg cursor-pointer shadow-none flex items-center gap-1"
                      >
                        Xem Giá Vé <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={() => handleUnsave(sf.id, routeLabel)}
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
