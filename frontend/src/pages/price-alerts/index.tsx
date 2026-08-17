import React, { useEffect, useState } from 'react';
import { priceAlertService, type PriceAlert, type PriceAlertHistory } from '@/services/price-alert';
import { notificationService, type TravelAlertPreferences } from '@/services/notification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Bell,
  TrendingDown,
  Plus,
  Trash2,
  History,
  Plane,
  CalendarIcon,
  AlertCircle,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';

export const PriceAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [prefs, setPrefs] = useState<TravelAlertPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // New alert form
  const [origin, setOrigin] = useState('SGN');
  const [destination, setDestination] = useState('HAN');
  const [departureDate, setDepartureDate] = useState('2026-08-20');
  const [targetPrice, setTargetPrice] = useState<number | undefined>(1500000);
  const [creating, setCreating] = useState(false);

  // History modal
  const [historyModal, setHistoryModal] = useState<PriceAlertHistory[] | null>(null);
  const [selectedRouteLabel, setSelectedRouteLabel] = useState<string>('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [alertsRes, prefsRes] = await Promise.all([
        priceAlertService.getAlerts(),
        notificationService.getPreferences(),
      ]);
      setAlerts(alertsRes || []);
      setPrefs(prefsRes);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách cảnh báo giá');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !departureDate) {
      toast.error('Vui lòng nhập đầy đủ thông tin điểm đi, điểm đến và ngày bay');
      return;
    }
    setCreating(true);
    try {
      await priceAlertService.createAlert({
        origin_iata: origin.toUpperCase(),
        destination_iata: destination.toUpperCase(),
        departure_date: departureDate,
        target_price: targetPrice,
      });
      toast.success(`Đã tạo cảnh báo giá cho chặng ${origin.toUpperCase()} → ${destination.toUpperCase()}`);
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Tạo cảnh báo giá thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAlert = async (id: string, route: string) => {
    try {
      await priceAlertService.deleteAlert(id);
      toast.info(`Đã xóa cảnh báo giá chặng ${route}`);
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Hủy cảnh báo thất bại');
    }
  };

  const handleViewHistory = async (alert: PriceAlert) => {
    try {
      setSelectedRouteLabel(`${alert.origin_iata} → ${alert.destination_iata}`);
      const history = await priceAlertService.getHistory(alert.id);
      setHistoryModal(history || []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải lịch sử biến động giá');
    }
  };

  const handleTogglePref = async (key: keyof TravelAlertPreferences, val: boolean) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: val };
    setPrefs(updated);
    try {
      await notificationService.updatePreferences({ [key]: val });
      toast.success('Đã cập nhật tùy chọn thông báo');
    } catch {
      toast.error('Cập nhật cài đặt thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0065eb] border border-blue-100 flex items-center justify-center font-semibold shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Cảnh Báo Giá Vé & Tùy Chỉnh Thông Báo
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi biến động giá vé chuyến bay tự động và tùy chỉnh cài đặt nhận thông báo thông minh.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (8 cols): 1. Create alert form, 2. Active trackers list */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* 1. Track New Route Form Card */}
            <Card className="bg-white p-6 rounded-2xl border-0 shadow-none flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#0065eb]" /> Theo Dõi Biến Động Giá Chuyến Bay Mới
                </h2>
                <Badge variant="outline" className="text-[11px] font-normal text-slate-500 border-slate-200">
                  Tự động kiểm tra giá vé 24/7
                </Badge>
              </div>

              <form onSubmit={handleCreateAlert} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Điểm Đi (Mã IATA)</label>
                    <Input
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="SGN"
                      maxLength={3}
                      className="uppercase font-mono text-xs h-9 bg-[#f8fafc]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Điểm Đến (Mã IATA)</label>
                    <Input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="HAN"
                      maxLength={3}
                      className="uppercase font-mono text-xs h-9 bg-[#f8fafc]"
                      required
                    />
                  </div>
                  
                  {/* Date Picker using Popover + Calendar */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Ngày Khởi Hành</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal text-xs h-9 bg-[#f8fafc] border-slate-200 shadow-none cursor-pointer"
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                          {departureDate ? departureDate : 'Chọn ngày'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border border-slate-200 shadow-xl rounded-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={departureDate ? new Date(departureDate) : undefined}
                          onSelect={(d) => {
                            if (d) setDepartureDate(d.toISOString().split('T')[0]);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Giá Kỳ Vọng (VNĐ)</label>
                    <Input
                      type="number"
                      value={targetPrice || ''}
                      onChange={(e) => setTargetPrice(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="1.500.000"
                      className="text-xs h-9 bg-[#f8fafc]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Gợi ý nhanh:</span>
                    {[1000000, 1500000, 2000000].map((price) => (
                      <button
                        key={price}
                        type="button"
                        onClick={() => setTargetPrice(price)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-[#0065eb] rounded text-[10px] font-medium text-slate-600 transition-colors cursor-pointer"
                      >
                        {(price / 1000000).toFixed(1)} triệu đ
                      </button>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    disabled={creating}
                    className="bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs h-9 px-5 rounded-lg cursor-pointer shadow-none flex items-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {creating ? 'Đang khởi tạo...' : 'Tạo Cảnh Báo Giá'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* 2. Active Price Trackers List */}
            <Card className="bg-white p-6 rounded-2xl border-0 shadow-none flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600" /> Chặng Bay Đang Theo Dõi Giá Tự Động
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  Tổng số: <strong className="text-slate-800">{alerts.length} chặng</strong>
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách cảnh báo...</div>
              ) : alerts.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200 space-y-1">
                  <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">Chưa có chặng bay nào được theo dõi</p>
                  <p className="text-[11px] text-slate-500">
                    Hãy tạo cảnh báo giá phía trên để nhận thông tin ngay khi giá vé giảm!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 bg-slate-50/80 hover:bg-blue-50/30 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0065eb] font-semibold text-xs shrink-0">
                          <Plane className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 font-mono">
                              {alert.origin_iata} → {alert.destination_iata}
                            </span>
                            {alert.target_price && (
                              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px] font-semibold">
                                Mục tiêu: &lt; {Number(alert.target_price).toLocaleString('vi-VN')} VNĐ
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Ngày bay: <strong className="text-slate-700">{alert.departure_date}</strong> • Tạo ngày: {new Date(alert.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-200/60 pt-2 sm:pt-0">
                        <Button
                          type="button"
                          onClick={() => handleViewHistory(alert)}
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 gap-1.5 text-slate-700 cursor-pointer rounded-lg border-slate-200 bg-white shadow-none"
                        >
                          <History className="w-3.5 h-3.5 text-blue-600" /> Biến Động Giá
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleDeleteAlert(alert.id, `${alert.origin_iata} → ${alert.destination_iata}`)}
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>

          {/* Right Column (4 cols): Notification Preferences Sidebar */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border-0 shadow-none flex flex-col gap-4 sticky top-20">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0065eb]" /> Tùy Chỉnh Kênh Thông Báo
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Cấu hình cách thức nhận thông báo chuyến bay.</p>
            </div>

            {prefs && (
              <div className="flex flex-col gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <label htmlFor="flight_delay_push" className="font-semibold text-slate-800 block cursor-pointer">
                      Thông báo Hoãn / Hủy Chuyến
                    </label>
                    <span className="text-[11px] text-slate-500">Nhận thông báo Push khi lịch trình thay đổi</span>
                  </div>
                  <Switch
                    id="flight_delay_push"
                    checked={prefs.flight_delay_push}
                    onCheckedChange={(checked) => handleTogglePref('flight_delay_push', Boolean(checked))}
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <label htmlFor="gate_change_push" className="font-semibold text-slate-800 block cursor-pointer">
                      Đổi Cửa Khởi Hành (Gate)
                    </label>
                    <span className="text-[11px] text-slate-500">Cập nhật vị trí cửa ra máy bay tại sân bay</span>
                  </div>
                  <Switch
                    id="gate_change_push"
                    checked={prefs.gate_change_push}
                    onCheckedChange={(checked) => handleTogglePref('gate_change_push', Boolean(checked))}
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <label htmlFor="price_drop_email" className="font-semibold text-slate-800 block cursor-pointer">
                      Email Cảnh Báo Khi Giảm Giá
                    </label>
                    <span className="text-[11px] text-slate-500">Gửi Email ngay khi chặng bay giảm giá sâu</span>
                  </div>
                  <Switch
                    id="price_drop_email"
                    checked={prefs.price_drop_email}
                    onCheckedChange={(checked) => handleTogglePref('price_drop_email', Boolean(checked))}
                  />
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* History Modal using shadcn Dialog */}
      {historyModal && (
        <Dialog open onOpenChange={(open) => !open && setHistoryModal(null)}>
          <DialogContent className="sm:max-w-md bg-white border-0 shadow-xl rounded-2xl p-6 font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-[#0065eb]" /> Lịch Sử Biến Động Giá
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Các lần hệ thống ghi nhận kiểm tra giá vé cho chặng <strong className="text-slate-800">{selectedRouteLabel}</strong>
              </DialogDescription>
            </DialogHeader>

            {historyModal.length === 0 ? (
              <p className="text-xs text-slate-500 my-4 text-center">Chưa có lịch sử ghi nhận biến động giá cho chặng này.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto my-3 pr-1">
                {historyModal.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-mono">
                      {new Date(h.checked_at).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="font-mono font-bold text-[#0065eb]">
                      {Number(h.price || 0).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                onClick={() => setHistoryModal(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-normal rounded-lg px-4 text-xs h-8 cursor-pointer shadow-none"
              >
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};
