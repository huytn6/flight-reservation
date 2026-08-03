import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { flightService } from '@/services/flight';
import { Plane, Search, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const FlightStatusPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);

  useEffect(() => {
    loadInitialFlights();
  }, []);

  const loadInitialFlights = async () => {
    setLoading(true);
    try {
      const res = await flightService.searchFlights({});
      setFlights(Array.isArray(res) ? res : (res as any).items || []);
    } catch {
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      loadInitialFlights();
      return;
    }
    const q = query.toLowerCase();
    const filtered = flights.filter(
      (f) =>
        f.flight_number?.toLowerCase().includes(q) ||
        f.departure_city?.toLowerCase().includes(q) ||
        f.arrival_city?.toLowerCase().includes(q) ||
        f.airline_name?.toLowerCase().includes(q)
    );
    setFlights(filtered);
    toast.info(`Tìm thấy ${filtered.length} chuyến bay phù hợp`);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'BOARDING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">Đang lên máy bay</span>;
      case 'DEPARTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">Đang bay trên không</span>;
      case 'ARRIVED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">Đã hạ cánh an toàn</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">Đã hủy chuyến</span>;
      case 'DELAYED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">Trễ giờ khởi hành</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">Đúng giờ (Scheduled)</span>;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 space-y-6 font-sans">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0065eb] text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>Theo Dõi Tình Trạng Chuyến Bay</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Tra Cứu Lịch Cất Cánh & Hạ Cánh Chuyến Bay
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Cập nhật tình trạng hoãn chuyến, đúng giờ hoặc thay đổi thông tin chuyến bay theo thời gian thực.
        </p>
      </div>

      {/* Search Input */}
      <Card className="bg-white border-0 shadow-none rounded-xl p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập Số hiệu chuyến bay (VD: VN210) hoặc Tên thành phố..."
              className="pl-9 text-xs h-10 border-slate-200/80 focus:border-[#0065eb]"
            />
          </div>
          <Button
            type="submit"
            className="h-10 bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs px-5 rounded-lg shadow-none cursor-pointer"
          >
            Tìm kiếm
          </Button>
        </form>
      </Card>

      {/* Flight Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 font-sans">Đang tải danh sách chuyến bay...</div>
      ) : flights.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 font-sans">Không tìm thấy thông tin chuyến bay nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flights.map((f) => (
            <Card key={f.id} className="bg-white border-0 shadow-none rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-[#0065eb] bg-blue-50 px-2.5 py-0.5 rounded">
                    {f.flight_number}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">{f.airline_name || 'Hãng bay'}</span>
                </div>
                {getStatusBadge(f.status)}
              </div>

              <div className="flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="text-[11px] text-slate-400">KHỞI HÀNH</p>
                  <p className="font-bold text-sm text-slate-900">{f.departure_city || 'SGN'}</p>
                  <p className="font-mono text-slate-500 text-[11px]">
                    {f.departure_time ? new Date(f.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '08:30'}
                  </p>
                </div>

                <div className="flex-1 flex flex-col items-center gap-1">
                  <Plane className="w-4 h-4 text-[#0065eb] transform rotate-90" />
                  <span className="text-[10px] text-slate-400 font-mono">Bay thẳng</span>
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-slate-400">ĐIỂM ĐẾN</p>
                  <p className="font-bold text-sm text-slate-900">{f.arrival_city || 'HAN'}</p>
                  <p className="font-mono text-slate-500 text-[11px]">
                    {f.arrival_time ? new Date(f.arrival_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '10:45'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
