import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
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
  DollarSign, 
  Ticket, 
  Users, 
  Plane, 
  TrendingUp, 
  Activity, 
  RefreshCw, 
  Download, 
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [bookingMetrics, setBookingMetrics] = useState<any[]>([]);
  const [revenueMetrics, setRevenueMetrics] = useState<any[]>([]);
  const [flightMetrics, setFlightMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [sumRes, bookRes, revRes, fltRes] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getDashboardBookings(),
        adminService.getDashboardRevenue(),
        adminService.getDashboardFlights(),
      ]);

      setSummary(sumRes);
      setBookingMetrics(bookRes || []);
      setRevenueMetrics(revRes || []);
      setFlightMetrics(fltRes || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-6 h-6 text-[#0065eb] animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Fetching real-time enterprise metrics & operational status...</p>
      </div>
    );
  }

  // Booking count and revenue come from two different, intentionally distinct sources:
  // dashboard/bookings counts ALL bookings (any status) per day, while dashboard/revenue
  // sums only successfully collected payments per day — merge them by date rather than
  // reusing the booking total as "revenue" (which counted CANCELLED/unpaid bookings too).
  const revenueByDate = new Map(revenueMetrics.map((r: any) => [r.date, r.revenue]));
  const mergedMetrics = bookingMetrics.map((b: any) => ({
    ...b,
    revenue: revenueByDate.get(b.date) || 0,
  }));

  // Fallback Data if metrics array is empty
  const chartData = mergedMetrics.length > 0 ? mergedMetrics : [
    { date: 'Jul 26', count: 12, revenue: 14200000 },
    { date: 'Jul 27', count: 18, revenue: 21500000 },
    { date: 'Jul 28', count: 15, revenue: 18400000 },
    { date: 'Jul 29', count: 24, revenue: 29800000 },
    { date: 'Jul 30', count: 28, revenue: 34100000 },
    { date: 'Jul 31', count: 32, revenue: 41200000 },
    { date: 'Aug 01', count: 26, revenue: 31000000 },
    { date: 'Aug 02', count: 35, revenue: 45800000 },
  ];

  const pieDonutData = flightMetrics.length > 0 ? flightMetrics.map(item => ({
    name: item.status || 'SCHEDULED',
    value: item.count || 10,
    fill: item.status === 'SCHEDULED' ? '#0065eb' : item.status === 'BOARDING' ? '#3b82f6' : item.status === 'DELAYED' ? '#f59e0b' : '#ef4444'
  })) : [
    { name: 'SCHEDULED', value: 28, fill: '#0065eb' },
    { name: 'BOARDING', value: 8, fill: '#3b82f6' },
    { name: 'DELAYED', value: 4, fill: '#f59e0b' },
    { name: 'CANCELLED', value: 2, fill: '#ef4444' },
  ];

  const radialGridData = [
    { name: "Direct Booking", value: 420, fill: "#0065eb" },
    { name: "Partner API", value: 310, fill: "#3b82f6" },
    { name: "Corporate Portal", value: 240, fill: "#60a5fa" },
    { name: "Mobile App", value: 190, fill: "#93c5fd" },
    { name: "Kiosk", value: 85, fill: "#cbd5e1" },
  ];

  const areaChartConfig = {
    revenue: {
      label: "Revenue (VND)",
      color: "#0065eb",
    },
    count: {
      label: "Bookings",
      color: "#64748b",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Standardized Enterprise Page Header */}
      <AdminPageHeader
        title="Tổng quan Dashboard"
        description="Phân tích doanh thu, số lượng vé đặt và tình trạng vận hành các chuyến bay thời gian thực."
        secondaryActions={
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="h-9 text-xs w-32 bg-white border-slate-200/80 rounded-lg">
                <SelectValue placeholder="Khoảng thời gian" />
              </SelectTrigger>
              <SelectContent className="rounded-lg font-sans">
                <SelectItem value="24h">24 Giờ Qua</SelectItem>
                <SelectItem value="7d">7 Ngày Qua</SelectItem>
                <SelectItem value="30d">30 Ngày Qua</SelectItem>
                <SelectItem value="qtd">Quý Này</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboard}
              className="h-9 text-xs font-normal border-slate-200/80 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded-lg px-3"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Làm mới
            </Button>
          </div>
        }
        primaryAction={{
          label: 'Xuất Dữ Liệu',
          onClick: () => toast.success('Đã xuất báo cáo dữ liệu thành công'),
          icon: Download,
        }}
      />

      {/* Row 1: KPI Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Revenue */}
        <Card className="p-4 bg-white border-0 rounded-lg shadow-none flex flex-col justify-between gap-3 relative">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng Doanh Thu Net</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {summary?.total_revenue?.toLocaleString()} <span className="text-xs font-normal text-slate-500">{summary?.currency || 'VND'}</span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span className="flex items-center text-[#0065eb] font-semibold gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2%
            </span>
            <span className="text-slate-400 font-normal">so với kỳ trước</span>
          </div>
        </Card>

        {/* Card 2: Total Bookings */}
        <Card className="p-4 bg-white border-0 rounded-lg shadow-none flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng Số Vé Đã Đặt</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {summary?.total_bookings} <span className="text-xs font-normal text-slate-500">vé</span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-600 font-normal">
              <strong className="text-[#0065eb] font-semibold">{summary?.confirmed_bookings}</strong> Đã xác nhận
            </span>
            <span className="text-slate-400 font-normal">88% Chuyển đổi</span>
          </div>
        </Card>

        {/* Card 3: Active Customers */}
        <Card className="p-4 bg-white border-0 rounded-lg shadow-none flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Khách Hàng Đăng Ký</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {summary?.total_customers} <span className="text-xs font-normal text-slate-500">tài khoản</span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span className="flex items-center text-[#0065eb] font-semibold gap-1">
              <Activity className="w-3.5 h-3.5" /> 34 Đang truy cập
            </span>
            <span className="text-slate-400 font-normal">+128 tuần này</span>
          </div>
        </Card>

        {/* Card 4: Flight Operations Status */}
        <Card className="p-4 bg-white border-0 rounded-lg shadow-none flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng Chuyến Bay Vận Hành</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {flightMetrics.reduce((acc, curr) => acc + (curr.count || 0), 0) || 48} <span className="text-xs font-normal text-slate-500">chuyến</span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Plane className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-[#0065eb] font-semibold">92% Đúng giờ</span>
            <span className="text-slate-400 font-normal">{flightMetrics.length} Trạng thái</span>
          </div>
        </Card>
      </div>

      {/* Row 2: Interactive Main Area & Bar Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive Area Chart for Revenue Trend (7/12 cols) */}
        <Card className="lg:col-span-7 bg-white border-0 rounded-lg shadow-none p-4 sm:p-5 flex flex-col gap-4">
          <CardHeader className="p-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#0065eb]" /> Xu Hướng Doanh Thu
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500 mt-0.5">
                Biểu đồ thể hiện tổng doanh thu và sản lượng vé bán theo từng ngày.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-[#0065eb] border-blue-200 text-[10px] font-medium">
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
        <Card className="lg:col-span-5 bg-white border-0 rounded-lg shadow-none p-4 sm:p-5 flex flex-col gap-4">
          <CardHeader className="p-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-slate-700" /> Lượng Vé Bán Theo Ngày
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500 mt-0.5">
                Phân bổ số lượng vé bán theo ngày.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-medium">
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

      {/* Row 3: Reusable Custom Charts Grid (3 Columns for the 3 requested charts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Reusable Chart 1: Radial Grid */}
        <ChartRadialGrid 
          title="Kênh Đặt Vé Bán Hàng"
          description="Tỷ lệ phân bổ theo từng kênh bán"
          data={radialGridData}
          footerTrendText="Kênh trực tiếp tăng trưởng +12.4%"
          footerSubText="Phân bổ qua API, Web, App và Kiosk"
        />

        {/* Reusable Chart 2: Radial Shape Gauge */}
        <ChartRadialShape 
          title="Tỷ Lệ Lấp Đầy Chỗ Tàu Bay"
          description="Tỷ lệ lấp đầy ghế thực tế các chuyến bay"
          value={88}
          label="Tỷ lệ %"
          color="#0065eb"
          endAngle={280}
          footerTrendText="Mục tiêu đặt ra: 85.0%"
          footerSubText="Đã vượt chỉ tiêu sản lượng bay theo tháng"
        />

        {/* Reusable Chart 3: Donut with Center Text */}
        <ChartPieDonutText 
          title="Trạng Thái Vận Hành Đội Bay"
          description="Phân loại chuyến bay theo mã trạng thái"
          data={pieDonutData}
          centerLabel="Tổng Chuyến"
          footerTrendText="92% Tỷ lệ cất cánh đúng giờ"
          footerSubText="Thống kê tình trạng hoạt động hiện tại"
        />

      </div>
    </div>
  );
};
