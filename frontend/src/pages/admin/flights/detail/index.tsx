import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Edit2, Plane, Clock, ShieldCheck, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const FlightDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [flight, setFlight] = useState<any>(null);
  const [seatMap, setSeatMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getFlights();
      const fl = (res.items || []).find((f: any) => f.id === id || f.flight_number === id);
      setFlight(fl || null);

      if (id) {
        try {
          const map = await adminService.getSeatMap(id);
          setSeatMap(map);
        } catch {
          // seat map optional
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Tải thông tin chuyến bay thất bại');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'BOARDING':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">Đang lên máy bay</span>;
      case 'DEPARTED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">Đang thực hiện chuyến bay</span>;
      case 'ARRIVED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">Đã hạ cánh an toàn</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">Đã hủy chuyến</span>;
      case 'DELAYED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">Tạm hoãn (Chậm chuyến)</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">Đã lên lịch (Đúng giờ)</span>;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Chưa cập nhật';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Đang tải chi tiết chuyến bay...</div>;
  }

  if (!flight) {
    return (
      <div className="p-8 text-center space-y-4 font-sans">
        <p className="text-sm text-slate-600">Không tìm thấy dữ liệu chuyến bay.</p>
        <Button size="sm" onClick={() => navigate('/admin/flights')} className="text-xs font-normal">
          Trở về danh sách chuyến bay
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 font-sans relative pb-12">
      {/* Enterprise Page Header */}
      <AdminPageHeader
        title={`Chuyến Bay ${flight.flight_number}`}
        description="Thông tin chi tiết hành trình, lịch trình cất/hạ cánh và trạng thái vận hành."
        backPath="/admin/flights"
        breadcrumbs={[
          { label: 'Quản lý chuyến bay', href: '/admin/flights' },
          { label: `Chi tiết ${flight.flight_number}` },
        ]}
        primaryAction={{
          label: 'Chỉnh sửa chuyến bay',
          onClick: () => navigate(`/admin/flights/${id}/edit`),
          icon: Edit2,
        }}
      />

      {/* Main 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Column (8 Cols): Flight Route & Details */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Visual Route & Schedule Card */}
          <Card className="bg-white border-0 shadow-none rounded-lg py-0">
            <CardHeader className="px-4 py-3 bg-white border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-900">
                Hành Trình & Thời Gian Bay
              </CardTitle>
              {getStatusBadge(flight.status || 'SCHEDULED')}
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              
              {/* Departure & Arrival Visual Banner */}
              <div className="bg-slate-50/70 border-0 rounded-lg p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500 font-medium">SÂN BAY CẤT CÁNH</p>
                  <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                    {flight.departure_iata || 'SGN'}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    {flight.departure_city || flight.departure_airport_name || 'Hồ Chí Minh'}
                  </p>
                </div>

                <div className="flex-1 flex flex-col items-center gap-1.5 max-w-[200px]">
                  <span className="text-[11px] text-slate-500 font-medium">Hành trình bay</span>
                  <div className="w-full flex items-center gap-2">
                    <div className="h-0.5 flex-1 bg-slate-300 rounded-full" />
                    <Plane className="w-4 h-4 text-[#0065eb] shrink-0 transform rotate-90" />
                    <div className="h-0.5 flex-1 bg-slate-300 rounded-full" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{flight.airline_name || 'Hãng hàng không'}</span>
                </div>

                <div className="space-y-1 text-right">
                  <p className="text-[11px] text-slate-500 font-medium">SÂN BAY HẠ CÁNH</p>
                  <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                    {flight.arrival_iata || 'HAN'}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    {flight.arrival_city || flight.arrival_airport_name || 'Hà Nội'}
                  </p>
                </div>
              </div>

              {/* Schedule Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div className="space-y-1.5 p-3 rounded-md bg-white border border-slate-100/70">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">Lịch cất cánh dự kiến</span>
                  </div>
                  <p className="font-mono text-slate-900 font-semibold text-sm">
                    {formatDate(flight.departure_time)}
                  </p>
                </div>

                <div className="space-y-1.5 p-3 rounded-md bg-white border border-slate-100/70">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">Lịch hạ cánh dự kiến</span>
                  </div>
                  <p className="font-mono text-slate-900 font-semibold text-sm">
                    {formatDate(flight.arrival_time)}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Aircraft & Capacity Overview */}
          <Card className="bg-white border-0 shadow-none rounded-lg py-0">
            <CardHeader className="px-4 py-3 bg-white border-b border-slate-100">
              <CardTitle className="text-xs font-semibold text-slate-900">
                Tàu Bay & Cấu Hình Ghế
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500">Dòng máy bay:</span>
                <p className="font-medium text-slate-900 text-sm">
                  {flight.aircraft_type_name || flight.aircraft_model || 'Airbus A321-200'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500">Mã tàu bay (Code):</span>
                <p className="font-mono font-medium text-slate-900 text-sm">
                  {flight.aircraft_code || 'A321'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500">Tổng sức chứa ghế:</span>
                <p className="font-mono font-medium text-slate-900 text-sm">
                  {seatMap?.capacity || flight.capacity || 180} ghế
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (4 Cols): Operations Panel */}
        <div className="lg:col-span-4 space-y-4 sticky top-20">
          
          <Card className="bg-white border-0 shadow-none rounded-lg py-0">
            <CardHeader className="px-4 py-3 bg-white border-b border-slate-100">
              <CardTitle className="text-xs font-semibold text-slate-900">
                Trạng Thái Hệ Thống
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Số hiệu chuyến bay</span>
                <span className="font-mono font-semibold text-slate-900">{flight.flight_number}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Hãng hàng không</span>
                <span className="font-medium text-slate-900">{flight.airline_name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trạng thái dữ liệu</span>
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Đồng bộ thành công
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-none rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-900">Thao tác quản trị</p>
            <Button
              onClick={() => navigate(`/admin/flights/${id}/edit`)}
              className="w-full h-8.5 bg-[#0065eb] hover:bg-blue-700 text-white text-xs font-normal rounded-md flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Chỉnh sửa thông tin chuyến bay
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/flights')}
              className="w-full h-8.5 text-xs font-normal text-slate-700 border-slate-200/70 hover:bg-slate-50 rounded-md cursor-pointer shadow-none"
            >
              Quay lại danh sách chuyến bay
            </Button>
          </Card>

        </div>

      </div>
    </div>
  );
};
