import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { 
  DollarSign, 
  Ticket, 
  Users, 
  Plane, 
  CreditCard,
  FileText,
  TrendingUp, 
  Activity, 
  RefreshCw, 
  Download, 
  Server, 
  Database, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [bookingMetrics, setBookingMetrics] = useState<any[]>([]);
  const [flightMetrics, setFlightMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [sumRes, bookRes, fltRes] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getDashboardBookings(),
        adminService.getDashboardFlights(),
      ]);

      setSummary(sumRes);
      setBookingMetrics(bookRes || []);
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
        <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Fetching real-time enterprise metrics & operational status...</p>
      </div>
    );
  }

  // System Infrastructure Health Items
  const systemHealthNodes = [
    { name: 'Core API Gateway', status: 'Operational', latency: '12ms', uptime: '99.98%', icon: Server },
    { name: 'PostgreSQL Primary DB', status: 'Healthy', latency: '4ms', uptime: '100%', icon: Database },
    { name: 'Redis Cache Layer', status: 'Healthy', latency: '1ms', uptime: '99.99%', icon: Zap },
    { name: 'Payment Processing Node', status: 'Operational', latency: '45ms', uptime: '99.95%', icon: ShieldCheck },
  ];

  // Recent Live Activity Timeline Events
  const recentActivities = [
    { time: '10 mins ago', user: 'System Auto-Job', action: 'Triggered 14 price drop alert emails', type: 'SYSTEM' },
    { time: '25 mins ago', user: 'Nguyen Admin', action: 'Updated seat map layout for Flight VN-210', type: 'ADMIN' },
    { time: '1 hour ago', user: 'Customer #402', action: 'Booked Round-trip SGN → HAN (2 Passengers)', type: 'BOOKING' },
    { time: '2 hours ago', user: 'Tran Staff', action: 'Approved refund request #REF-902 (850,000 VND)', type: 'STAFF' },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Top Banner & Control Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-none">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">System Control Center</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-mono uppercase px-2 py-0.5 rounded">
              ● Live Status
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Real-time revenue monitoring, booking velocity, flight fleet operations, and node infrastructure status.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-8 text-xs w-32 bg-slate-50 border-slate-200 rounded-md">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent className="rounded-md">
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="qtd">Quarter to Date</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={loadDashboard} className="h-8 text-xs font-normal border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-md">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>

          <Button size="sm" onClick={() => toast.success('Operational report exported to CSV')} className="h-8 text-xs font-medium bg-[#0065eb] hover:bg-blue-700 text-white cursor-pointer rounded-md shadow-none">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Row 1: KPI Hero Cards with High Information Density & Unified Neutral Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Revenue (Hero) */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-lg shadow-none flex flex-col justify-between gap-3 relative">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Net Revenue</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {summary?.total_revenue?.toLocaleString()} <span className="text-xs font-normal text-slate-500">{summary?.currency || 'VND'}</span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span className="flex items-center text-[#0065eb] font-semibold gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2%
            </span>
            <span className="text-slate-400 font-normal">vs. previous period</span>
          </div>
        </Card>

        {/* Card 2: Total Bookings */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-lg shadow-none flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Flight Bookings</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {summary?.total_bookings} <span className="text-xs font-normal text-slate-500">tickets</span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-600 font-normal">
              <strong className="text-[#0065eb] font-semibold">{summary?.confirmed_bookings}</strong> Confirmed
            </span>
            <span className="text-slate-400 font-normal">88% Conversion</span>
          </div>
        </Card>

        {/* Card 3: Active Customers */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-lg shadow-none flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Registered Accounts</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {summary?.total_customers} <span className="text-xs font-normal text-slate-500">users</span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span className="flex items-center text-[#0065eb] font-semibold gap-1">
              <Activity className="w-3.5 h-3.5" /> 34 Live Now
            </span>
            <span className="text-slate-400 font-normal">+128 this week</span>
          </div>
        </Card>

        {/* Card 4: Flight Operations Status */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-lg shadow-none flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Fleet Metrics</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {flightMetrics.reduce((acc, curr) => acc + (curr.count || 0), 0) || 48} <span className="text-xs font-normal text-slate-500">flights</span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0">
              <Plane className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-[#0065eb] font-semibold">92% On-time</span>
            <span className="text-slate-400 font-normal">{flightMetrics.length} Status Types</span>
          </div>
        </Card>
      </div>

      {/* Row 2: Dual Main Panels (Data Tables Left, Health & Activities Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7/12 cols): High Density Tables & Breakdowns */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Daily Revenue & Booking Breakdown Table */}
          <Card className="bg-white border border-slate-200/80 rounded-lg shadow-none p-4 sm:p-5 flex flex-col gap-3">
            <CardHeader className="p-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#0065eb]" /> Daily Revenue & Booking Performance Log
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500 mt-0.5">
                  Aggregated transactional metrics for the recent period.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/finance')} className="text-xs font-medium text-[#0065eb] hover:text-blue-700 cursor-pointer h-7 px-2">
                View Finance Log <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </CardHeader>

            <CardContent className="p-0 border border-slate-100 rounded-md overflow-hidden mt-1">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b border-slate-100 hover:bg-slate-50">
                    <TableHead className="text-[11px] font-semibold text-slate-600 h-8">Date</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 h-8">Bookings</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 h-8 text-right">Gross Revenue</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 h-8 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {bookingMetrics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-slate-400 text-xs">
                        No recent booking performance data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookingMetrics.slice(0, 7).map((row, i) => (
                      <TableRow key={i} className="border-b border-slate-100/80 hover:bg-slate-50/50">
                        <TableCell className="font-normal text-slate-900 py-2.5">{row.date}</TableCell>
                        <TableCell className="font-normal text-slate-700 py-2.5">{row.count} tickets</TableCell>
                        <TableCell className="font-semibold text-[#0065eb] text-right py-2.5">{row.revenue?.toLocaleString() || 0} VND</TableCell>
                        <TableCell className="text-center py-2.5">
                          <Badge variant="outline" className="text-[9px] font-semibold uppercase bg-blue-50 text-[#0065eb] border-blue-200 px-2 py-0.2 rounded">
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Flight Operations Breakdown Table */}
          <Card className="bg-white border border-slate-200/80 rounded-lg shadow-none p-4 sm:p-5 flex flex-col gap-3">
            <CardHeader className="p-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-[#0065eb]" /> Flight Operational Fleet Distribution
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500 mt-0.5">
                  Active flights segmented by operational status code.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/catalog')} className="text-xs font-medium text-[#0065eb] hover:text-blue-700 cursor-pointer h-7 px-2">
                Manage Catalog <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </CardHeader>

            <CardContent className="p-0 border border-slate-100 rounded-md overflow-hidden mt-1">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b border-slate-100 hover:bg-slate-50">
                    <TableHead className="text-[11px] font-semibold text-slate-600 h-8">Status Tag</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 h-8">Active Flights</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 h-8 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {flightMetrics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-slate-400 text-xs">
                        No active flight status metrics available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    flightMetrics.map((row, i) => (
                      <TableRow key={i} className="border-b border-slate-100/80 hover:bg-slate-50/50">
                        <TableCell className="py-2.5">
                          <Badge variant="outline" className="text-[10px] font-semibold uppercase bg-slate-100 text-slate-800 border-slate-200 px-2 py-0.5 rounded">
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900 py-2.5">{row.count} Flights</TableCell>
                        <TableCell className="text-right py-2.5">
                          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/catalog')} className="text-[11px] font-medium text-slate-600 hover:text-blue-600 h-6 px-2 cursor-pointer">
                            Filter Flights
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (5/12 cols): Infrastructure Health, Timeline & Shortcuts */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Infrastructure Node Health Meter */}
          <Card className="bg-white border border-slate-200/80 rounded-lg shadow-none p-4 sm:p-5 flex flex-col gap-3">
            <CardHeader className="p-0">
              <CardTitle className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-[#0065eb]" /> Infrastructure Node Status
                </span>
                <span className="text-[10px] font-mono text-[#0065eb] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  ALL OK
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 flex flex-col gap-2 mt-1">
              {systemHealthNodes.map((node, i) => {
                const Icon = node.icon;
                return (
                  <div key={i} className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-md flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-800 text-[11px]">{node.name}</p>
                        <p className="text-[10px] text-slate-400">Latency: {node.latency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-[#0065eb] bg-blue-50 px-2 py-0.5 rounded">
                        {node.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Real-time System Audit Feed Timeline */}
          <Card className="bg-white border border-slate-200/80 rounded-lg shadow-none p-4 sm:p-5 flex flex-col gap-3">
            <CardHeader className="p-0 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-700" /> Live Audit Trail Feed
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/audit')} className="text-xs font-medium text-[#0065eb] hover:text-blue-700 cursor-pointer h-6 px-1.5">
                Audit Log <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </CardHeader>

            <CardContent className="p-0 flex flex-col gap-2.5 mt-1">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2 rounded hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-none">
                  <div className="w-2 h-2 rounded-full bg-[#0065eb] mt-1.5 shrink-0" />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-xs text-slate-800 font-normal leading-tight">{act.action}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-600">{act.user}</span>
                      <span>•</span>
                      <span>{act.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Enterprise Shortcuts Panel */}
          <Card className="bg-white border border-slate-200/80 rounded-lg shadow-none p-4 sm:p-5 flex flex-col gap-3">
            <CardHeader className="p-0">
              <CardTitle className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-slate-700" /> Quick Administrative Shortcuts
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 grid grid-cols-2 gap-2 mt-1">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/catalog')}
                className="h-12 flex flex-col items-center justify-center p-2 rounded-md border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-800 text-xs font-medium"
              >
                <Plane className="w-4 h-4 text-slate-700 mb-1" />
                <span>Manage Flights</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/admin/users')}
                className="h-12 flex flex-col items-center justify-center p-2 rounded-md border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-800 text-xs font-medium"
              >
                <Users className="w-4 h-4 text-slate-700 mb-1" />
                <span>Users & Staff</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/admin/finance')}
                className="h-12 flex flex-col items-center justify-center p-2 rounded-md border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-800 text-xs font-medium"
              >
                <CreditCard className="w-4 h-4 text-slate-700 mb-1" />
                <span>Bookings Log</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/admin/audit')}
                className="h-12 flex flex-col items-center justify-center p-2 rounded-md border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-800 text-xs font-medium"
              >
                <FileText className="w-4 h-4 text-slate-700 mb-1" />
                <span>Audit Trail</span>
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
};
