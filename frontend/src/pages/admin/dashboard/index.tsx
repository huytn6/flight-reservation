import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CodeBadge } from '@/components/common/CodeBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { getBookingStatusConfig } from '@/constants/status-mappings';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { ChartRadialGrid, ChartRadialShape, ChartPieDonutText } from '@/components/charts';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import {
  Ticket,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

// Fixed color per booking status so charts and badges read consistently.
const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#0065eb',
  COMPLETED: '#22c55e',
  PENDING_PAYMENT: '#f59e0b',
  PAYMENT_PROCESSING: '#f59e0b',
  CHANGE_PENDING: '#f59e0b',
  PAYMENT_FAILED: '#ef4444',
  CANCELLED: '#ef4444',
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [bookingMetrics, setBookingMetrics] = useState<any[]>([]);
  const [revenueMetrics, setRevenueMetrics] = useState<any[]>([]);
  const [bookingStatus, setBookingStatus] = useState<any[]>([]);
  const [topRoutes, setTopRoutes] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [sumRes, bookRes, revRes, statusRes, routeRes, recentRes] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getDashboardBookings(),
        adminService.getDashboardRevenue(),
        adminService.getDashboardBookingStatus(),
        adminService.getDashboardTopRoutes(),
        adminService.getDashboardRecentBookings(),
      ]);

      setSummary(sumRes);
      setBookingMetrics(bookRes || []);
      setRevenueMetrics(revRes || []);
      setBookingStatus(statusRes || []);
      setTopRoutes(routeRes || []);
      setRecentBookings(recentRes || []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải dữ liệu tổng quan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-6 h-6 text-[#0065eb] animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  // Booking count and revenue come from two different, intentionally distinct sources:
  // dashboard/bookings counts ALL bookings (any status) per day, while dashboard/revenue
  // sums only successfully collected payments per day — merge them by date rather than
  // reusing the booking total as "revenue" (which counted CANCELLED/unpaid bookings too).
  const revenueByDate = new Map(revenueMetrics.map((r: any) => [r.date, r.revenue]));
  const chartData = bookingMetrics.map((b: any) => ({
    ...b,
    revenue: revenueByDate.get(b.date) || 0,
  })).reverse();

  const pieDonutData = bookingStatus.map((item) => {
    const cfg = getBookingStatusConfig(item.status);
    return {
      name: cfg.label,
      value: item.count || 0,
      fill: STATUS_COLORS[item.status] || '#94a3b8',
    };
  });

  const radialGridData = topRoutes.map((r, idx) => ({
    name: `${r.departure} → ${r.arrival}`,
    value: r.count || 0,
    fill: ['#0065eb', '#3b82f6', '#60a5fa', '#93c5fd', '#cbd5e1'][idx] || '#cbd5e1',
  }));

  const totalBookings = summary?.total_bookings || 0;
  const confirmationRate = totalBookings > 0
    ? Math.round(((summary?.confirmed_bookings || 0) / totalBookings) * 1000) / 10
    : 0;

  const areaChartConfig = {
    revenue: {
      label: "Doanh thu (VND)",
      color: "#0065eb",
    },
    count: {
      label: "Số vé",
      color: "#64748b",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* Standardized Enterprise Page Header */}
      <AdminPageHeader
        title="Tổng quan Dashboard"
        description="Số lượng vé đã đặt, doanh thu và các chuyến bay được đặt nhiều nhất."
        secondaryActions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboard}
            className="h-9 text-xs font-normal border-slate-200/80 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded-lg px-3"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Làm mới
          </Button>
        }
      />

      {/* Row 1: KPI stat strip — one card, plain dividers, no per-stat color chips */}
      <Card className="bg-white border-0 rounded-lg shadow-none ring-0 p-0 overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-slate-100">
          <div className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Tổng doanh thu</span>
            <span className="text-lg sm:text-xl font-semibold text-slate-900">
              {(summary?.total_revenue || 0).toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">{summary?.currency || 'VND'}</span>
            </span>
          </div>

          <div className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Tổng số vé</span>
            <span className="text-lg sm:text-xl font-semibold text-slate-900">
              {totalBookings} <span className="text-xs font-normal text-slate-400">vé</span>
            </span>
          </div>

          <div className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Đã xác nhận</span>
            <span className="text-lg sm:text-xl font-semibold text-slate-900">
              {summary?.confirmed_bookings || 0} <span className="text-xs font-normal text-slate-400">vé</span>
            </span>
          </div>

          <div className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Đang chờ xử lý</span>
            <span className="text-lg sm:text-xl font-semibold text-slate-900">
              {summary?.pending_bookings || 0} <span className="text-xs font-normal text-slate-400">vé</span>
            </span>
          </div>

          <div className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Đã hủy</span>
            <span className="text-lg sm:text-xl font-semibold text-slate-900">
              {summary?.cancelled_bookings || 0} <span className="text-xs font-normal text-slate-400">vé</span>
            </span>
          </div>
        </div>
      </Card>

      {/* Row 2: Interactive Main Area & Bar Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left: Interactive Area Chart for Revenue Trend (7/12 cols) */}
        <Card className="lg:col-span-7 bg-white border-0 rounded-lg shadow-none ring-0 p-4 sm:p-5 flex flex-col gap-4">
          <CardHeader className="p-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#0065eb]" /> Xu Hướng Doanh Thu
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500 mt-0.5">
                Tổng doanh thu và số vé bán theo từng ngày (30 ngày gần nhất).
              </CardDescription>
            </div>
            <Badge className="bg-blue-50 text-[#0065eb] border-transparent text-[10px] font-medium">
              Biểu đồ miền
            </Badge>
          </CardHeader>

          <CardContent className="p-0 pt-2">
            <ChartContainer config={areaChartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0065eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0065eb" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0065eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#fillRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Right: Daily Ticket Volume Bar Chart (5/12 cols) */}
        <Card className="lg:col-span-5 bg-white border-0 rounded-lg shadow-none ring-0 p-4 sm:p-5 flex flex-col gap-4">
          <CardHeader className="p-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-slate-700" /> Lượng Vé Đặt Theo Ngày
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500 mt-0.5">
                Số lượng vé đặt mỗi ngày.
              </CardDescription>
            </div>
            <Badge className="bg-slate-100 text-slate-700 border-transparent text-[10px] font-medium">
              Biểu đồ cột
            </Badge>
          </CardHeader>

          <CardContent className="p-0 pt-2">
            <ChartContainer config={areaChartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Bar dataKey="count" fill="#0065eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

      </div>

      {/* Row 3: Booking status / confirmation rate / top routes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <ChartPieDonutText
          title="Vé Theo Trạng Thái"
          description="Phân loại toàn bộ vé theo trạng thái hiện tại"
          data={pieDonutData}
          centerLabel="Tổng Vé"
          footerTrendText={`${confirmationRate}% đã xác nhận thành công`}
          footerSubText="Tính trên toàn bộ vé trong hệ thống"
        />

        <ChartRadialShape
          title="Tỷ Lệ Đặt Vé Thành Công"
          description="Vé đã xác nhận / tổng số vé"
          value={confirmationRate}
          label="%"
          color="#0065eb"
          endAngle={(confirmationRate / 100) * 360}
          footerTrendText={`${summary?.confirmed_bookings || 0} / ${totalBookings} vé đã xác nhận`}
          footerSubText="Không tính vé đang chờ thanh toán"
        />

        <ChartRadialGrid
          title="Tuyến Bay Đặt Nhiều Nhất"
          description="Top 5 tuyến bay theo số vé đã đặt"
          data={radialGridData}
          footerTrendText={radialGridData[0] ? `${radialGridData[0].name} dẫn đầu` : 'Chưa có dữ liệu'}
          footerSubText="Tính theo chặng bay đầu tiên của mỗi vé"
        />

      </div>

      {/* Row 4: Recent bookings table */}
      <Card className="bg-white border-0 rounded-lg shadow-none ring-0 p-4 sm:p-5 flex flex-col gap-4">
        <CardHeader className="p-0 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-[#0065eb]" /> Vé Đặt Gần Đây
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-500 mt-0.5">
              10 vé được đặt mới nhất — chuyến bay và ngày bay tương ứng.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/bookings')}
            className="h-8 text-xs font-normal border-slate-200/80 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded-lg px-3"
          >
            Xem tất cả
          </Button>
        </CardHeader>

        <CardContent className="p-0 pt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">Mã PNR</TableHead>
                <TableHead className="text-[11px]">Khách hàng</TableHead>
                <TableHead className="text-[11px]">Chuyến bay</TableHead>
                <TableHead className="text-[11px]">Ngày bay</TableHead>
                <TableHead className="text-[11px]">Ngày đặt</TableHead>
                <TableHead className="text-[11px]">Trạng thái</TableHead>
                <TableHead className="text-[11px] text-right">Số tiền</TableHead>
                <TableHead className="text-[11px] text-right">Xem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-xs text-slate-400 py-6">
                    Chưa có vé nào được đặt.
                  </TableCell>
                </TableRow>
              )}
              {recentBookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell><CodeBadge>{b.pnr}</CodeBadge></TableCell>
                  <TableCell className="text-xs text-slate-700">{b.contact_name}</TableCell>
                  <TableCell className="text-xs text-slate-700 font-mono">
                    {b.flight_number ? `${b.flight_number} · ${b.dep_iata || '?'} → ${b.arr_iata || '?'}` : '—'}
                  </TableCell>
                  <TableCell className="text-[11px] text-slate-500 font-mono">
                    {b.departure_time ? new Date(b.departure_time).toLocaleString('vi-VN') : '—'}
                  </TableCell>
                  <TableCell className="text-[11px] text-slate-500 font-mono">
                    {b.created_at ? new Date(b.created_at).toLocaleString('vi-VN') : '—'}
                  </TableCell>
                  <TableCell><StatusBadge type="booking" value={b.status} /></TableCell>
                  <TableCell className="text-xs text-right font-mono font-bold text-slate-900">
                    {Number(b.total_amount || 0).toLocaleString('vi-VN')} VND
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/admin/bookings/${b.id}`)}
                      className="w-7 h-7 text-slate-500 hover:text-[#0065eb] hover:bg-blue-50 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
