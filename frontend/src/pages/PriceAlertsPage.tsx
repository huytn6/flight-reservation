import React, { useEffect, useState } from 'react';
import { priceAlertService, type PriceAlert, type PriceAlertHistory } from '@/services/price-alert';
import { notificationService, type TravelAlertPreferences } from '@/services/notification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, TrendingDown, Plus, Trash2, History } from 'lucide-react';
import { toast } from 'sonner';

export const PriceAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [prefs, setPrefs] = useState<TravelAlertPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // New alert form
  const [origin, setOrigin] = useState('SGN');
  const [destination, setDestination] = useState('HAN');
  const [departureDate, setDepartureDate] = useState('2026-08-20');
  const [targetPrice, setTargetPrice] = useState<number | undefined>(undefined);
  const [creating, setCreating] = useState(false);

  // History modal
  const [historyModal, setHistoryModal] = useState<PriceAlertHistory[] | null>(null);

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
      toast.error(err.message || 'Failed to load price alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await priceAlertService.createAlert({
        origin_iata: origin.toUpperCase(),
        destination_iata: destination.toUpperCase(),
        departure_date: departureDate,
        target_price: targetPrice,
      });
      toast.success('Price alert created!');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create price alert');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await priceAlertService.deleteAlert(id);
      toast.success('Alert deleted');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete alert');
    }
  };

  const handleViewHistory = async (id: string) => {
    try {
      const history = await priceAlertService.getHistory(id);
      setHistoryModal(history || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load price history');
    }
  };

  const handleTogglePref = async (key: keyof TravelAlertPreferences, val: boolean) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: val };
    setPrefs(updated);
    try {
      await notificationService.updatePreferences({ [key]: val });
      toast.success('Preferences updated');
    } catch {
      toast.error('Failed to update preferences');
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-8 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Price Alerts & Notifications</h1>
          <p className="text-xs text-slate-500">Track flight fare changes and customize travel alert push preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Alerts list & Create form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Create Alert Card */}
          <form onSubmit={handleCreateAlert} className="bg-white p-6 rounded-2xl border shadow-xs flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" /> Track a New Route Price
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Origin (IATA)</label>
                <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="SGN" className="uppercase font-mono text-xs" required />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Destination (IATA)</label>
                <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="HAN" className="uppercase font-mono text-xs" required />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Departure Date</label>
                <Input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="text-xs" required />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Target Price (VND)</label>
                <Input type="number" value={targetPrice || ''} onChange={(e) => setTargetPrice(e.target.value ? Number(e.target.value) : undefined)} placeholder="1500000" className="text-xs" />
              </div>
            </div>


            <Button type="submit" disabled={creating} className="bg-purple-600 hover:bg-purple-700 text-white font-bold w-fit rounded-xl text-xs px-5">
              {creating ? 'Creating...' : 'Create Alert'}
            </Button>
          </form>

          {/* Active Alerts List */}
          <div className="bg-white p-6 rounded-2xl border shadow-xs flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-600" /> Active Price Trackers
            </h2>

            {loading ? (
              <p className="text-xs text-slate-500">Loading alerts...</p>
            ) : alerts.length === 0 ? (
              <p className="text-xs text-slate-500">No active price alerts.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 bg-slate-50 border rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{alert.origin_iata} → {alert.destination_iata}</p>
                      <p className="text-xs text-slate-500">Date: {alert.departure_date} • Created: {new Date(alert.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleViewHistory(alert.id)} size="sm" variant="outline" className="text-xs gap-1 text-slate-700">
                        <History className="w-3.5 h-3.5" /> History
                      </Button>
                      <button onClick={() => handleDeleteAlert(alert.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Preferences Sidebar */}
        <div className="bg-white p-6 rounded-2xl border shadow-md flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-900 border-b pb-3">Travel Alert Preferences</h2>

          {prefs && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="flight_delay_push"
                  checked={prefs.flight_delay_push}
                  onCheckedChange={(checked) => handleTogglePref('flight_delay_push', Boolean(checked))}
                />
                <label htmlFor="flight_delay_push" className="font-semibold text-slate-800 cursor-pointer">
                  Flight delay push notifications
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="gate_change_push"
                  checked={prefs.gate_change_push}
                  onCheckedChange={(checked) => handleTogglePref('gate_change_push', Boolean(checked))}
                />
                <label htmlFor="gate_change_push" className="font-semibold text-slate-800 cursor-pointer">
                  Gate change push notifications
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="price_drop_email"
                  checked={prefs.price_drop_email}
                  onCheckedChange={(checked) => handleTogglePref('price_drop_email', Boolean(checked))}
                />
                <label htmlFor="price_drop_email" className="font-semibold text-slate-800 cursor-pointer">
                  Price drop email alerts
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {historyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-900">Price History Log</h2>
            {historyModal.length === 0 ? (
              <p className="text-xs text-slate-500">No history records yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {historyModal.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-50 rounded-xl flex justify-between text-xs">
                    <span className="text-slate-500">{new Date(h.checked_at).toLocaleString()}</span>
                    <span className="font-bold text-blue-600">{h.price.toLocaleString()} VND</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setHistoryModal(null)} className="bg-blue-600 text-white rounded-full">Close</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
