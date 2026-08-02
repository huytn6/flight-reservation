import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth';
import { userService } from '@/services/user';
import { authService } from '@/services/auth';
import { bookingService, type Booking } from '@/services/booking';
import { flightService, type SavedFlight } from '@/services/flight';
import { priceAlertService, type PriceAlert } from '@/services/price-alert';
import { notificationService, type TravelAlertPreferences } from '@/services/notification';
import { supportService, type SupportTicket, type SupportTicketDetail } from '@/services/support';
import type { ActiveSession, SavedPassenger } from '@/types/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { 
  User, 
  KeyRound, 
  Users, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ChevronRight,
  ShieldCheck,
  Mail,
  Phone,
  Bell,
  Ticket,
  Heart,
  Tag,
  HelpCircle,
  TrendingDown,
  Plus,
  Send,
  CalendarIcon
} from 'lucide-react';

type TabType = 'PROFILE' | 'COMMUNICATIONS' | 'MY_TRIPS' | 'SAVED_FLIGHTS' | 'COUPONS' | 'PASSENGERS' | 'SECURITY' | 'SUPPORT';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab')?.toUpperCase() as TabType) || 'PROFILE';

  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Password Form State
  const [editingPassword, setEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Active Sessions
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Saved Passengers
  const [passengers, setPassengers] = useState<SavedPassenger[]>([]);
  const [editingPassenger, setEditingPassenger] = useState<Partial<SavedPassenger> | null>(null);
  const [savingPassenger, setSavingPassenger] = useState(false);

  // Bookings Data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingFilter, setBookingFilter] = useState('');
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Saved Flights Data
  const [savedFlights, setSavedFlights] = useState<SavedFlight[]>([]);
  const [loadingSavedFlights, setLoadingSavedFlights] = useState(false);

  // Communications / Price Alerts Data
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertPrefs, setAlertPrefs] = useState<TravelAlertPreferences | null>(null);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  // Support Tickets Data
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [activeTicketDetail, setActiveTicketDetail] = useState<SupportTicketDetail | null>(null);
  const [loadingSupport, setLoadingSupport] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('BOOKING');
  const [ticketMessage, setTicketMessage] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadSessions();
    loadPassengers();
  }, []);

  useEffect(() => {
    if (activeTab === 'MY_TRIPS') {
      loadBookings();
    } else if (activeTab === 'SAVED_FLIGHTS') {
      loadSavedFlights();
    } else if (activeTab === 'COMMUNICATIONS') {
      loadPriceAlerts();
    } else if (activeTab === 'SUPPORT') {
      loadSupportTickets();
    }
  }, [activeTab, bookingFilter]);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await userService.getSessions();
      setSessions(res.items || []);
    } catch {
      // ignore
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadPassengers = async () => {
    try {
      const res = await userService.getSavedPassengers();
      setPassengers(res || []);
    } catch {
      // ignore
    }
  };

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await bookingService.getMyBookings(bookingFilter || undefined);
      setBookings(res.items || []);
    } catch {
      // ignore
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadSavedFlights = async () => {
    setLoadingSavedFlights(true);
    try {
      const res = await flightService.getSavedFlights();
      setSavedFlights(res || []);
    } catch {
      // ignore
    } finally {
      setLoadingSavedFlights(false);
    }
  };

  const loadPriceAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const [alertsRes, prefsRes] = await Promise.all([
        priceAlertService.getAlerts(),
        notificationService.getPreferences(),
      ]);
      setAlerts(alertsRes || []);
      setAlertPrefs(prefsRes);
    } catch {
      // ignore
    } finally {
      setLoadingAlerts(false);
    }
  };

  const loadSupportTickets = async () => {
    setLoadingSupport(true);
    try {
      const res = await supportService.getMyTickets();
      setSupportTickets(res || []);
    } catch {
      // ignore
    } finally {
      setLoadingSupport(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await authService.changePassword({ old_password: oldPassword, new_password: newPassword });
      toast.success('Password changed successfully. Please sign in again.');
      setOldPassword('');
      setNewPassword('');
      setEditingPassword(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await userService.revokeSession(id);
      toast.success('Session revoked');
      loadSessions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke session');
    }
  };

  const handleSavePassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPassenger?.full_name) return;
    setSavingPassenger(true);
    try {
      if (editingPassenger.id) {
        await userService.updateSavedPassenger(editingPassenger.id, editingPassenger);
        toast.success('Passenger updated');
      } else {
        await userService.addSavedPassenger(editingPassenger);
        toast.success('Passenger saved');
      }
      setEditingPassenger(null);
      loadPassengers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save passenger');
    } finally {
      setSavingPassenger(false);
    }
  };

  const handleDeletePassenger = async (id: string) => {
    try {
      await userService.deleteSavedPassenger(id);
      toast.success('Passenger deleted');
      loadPassengers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete passenger');
    }
  };

  const handleUnsaveFlight = async (id: string) => {
    try {
      await flightService.unsaveFlight(id);
      toast.success('Flight removed');
      loadSavedFlights();
    } catch (err: any) {
      toast.error(err.message || 'Failed to unsave flight');
    }
  };

  const handleTogglePref = async (key: keyof TravelAlertPreferences, val: boolean) => {
    if (!alertPrefs) return;
    setAlertPrefs({ ...alertPrefs, [key]: val });
    try {
      await notificationService.updatePreferences({ [key]: val });
      toast.success('Preferences updated');
    } catch {
      toast.error('Failed to update preferences');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTicket(true);
    try {
      await supportService.createTicket({ subject: ticketSubject, category: ticketCategory, message: ticketMessage });
      toast.success('Support ticket created!');
      setTicketSubject('');
      setTicketMessage('');
      loadSupportTickets();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create ticket');
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSelectTicket = async (id: string) => {
    try {
      const detail = await supportService.getTicketDetail(id);
      setActiveTicketDetail(detail);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load thread');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketDetail || !replyBody.trim()) return;
    setSendingReply(true);
    try {
      await supportService.addMessage(activeTicketDetail.ticket.id, replyBody);
      toast.success('Message sent');
      setReplyBody('');
      handleSelectTicket(activeTicketDetail.ticket.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSendingReply(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  const firstName = user?.full_name?.split(' ')[0] || user?.full_name || 'User';

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-4 sm:py-6 font-sans">
      
      {/* Top Header Title */}
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900">Hi, {firstName}</h1>
        <p className="text-[11px] text-slate-500">{user?.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        
        {/* Left Sidebar Navigation Cards (Expedia Layout matching image) */}
        <div className="flex flex-col gap-2">
          
          {/* Account Overview Summary Card */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col gap-1 relative mb-1">
            <span className="absolute top-3 right-3 text-[9px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md uppercase">
              {user?.role}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Account Status</span>
            </div>
            <p className="text-base font-bold text-slate-900 capitalize">{user?.status || 'Active'}</p>
            <p className="text-[10px] text-slate-500">{user?.email}</p>
          </div>

          {/* 1. Profile */}
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'PROFILE' ? 'bg-white border-[#0065eb] ring-1 ring-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Profile</p>
                <p className="text-[10px] text-slate-500">Provide your personal details and travel documents</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* 2. Communications */}
          <button
            onClick={() => setActiveTab('COMMUNICATIONS')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'COMMUNICATIONS' ? 'bg-white border-[#0065eb] ring-1 ring-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Bell className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Communications</p>
                <p className="text-[10px] text-slate-500">Control which notifications & price alerts you get</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* 3. My Trips */}
          <button
            onClick={() => setActiveTab('MY_TRIPS')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'MY_TRIPS' ? 'bg-white border-[#0065eb] ring-1 ring-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Ticket className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">My Trips</p>
                <p className="text-[10px] text-slate-500">View upcoming flight bookings and e-tickets</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* 4. Saved Flights */}
          <button
            onClick={() => setActiveTab('SAVED_FLIGHTS')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'SAVED_FLIGHTS' ? 'bg-white border-[#0065eb] ring-1 ring-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Heart className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Saved Flights</p>
                <p className="text-[10px] text-slate-500">View your saved flight offers and favorites</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* 5. Coupons & Offers */}
          <button
            onClick={() => setActiveTab('COUPONS')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'COUPONS' ? 'bg-white border-[#0065eb] ring-1 ring-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Tag className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Coupons & Offers</p>
                <p className="text-[10px] text-slate-500">View your available discount coupons</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* 6. Additional Travelers */}
          <button
            onClick={() => setActiveTab('PASSENGERS')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'PASSENGERS' ? 'bg-white border-[#0065eb] ring-1 ring-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Additional Travelers</p>
                <p className="text-[10px] text-slate-500">Save travel profiles ({passengers.length})</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* 7. Security and settings */}
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'SECURITY' ? 'bg-white border-[#0065eb] ring-1 ring-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Security and settings</p>
                <p className="text-[10px] text-slate-500">Update your email, password or active devices ({sessions.length})</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* 8. Help and feedback */}
          <button
            onClick={() => setActiveTab('SUPPORT')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'SUPPORT' ? 'bg-white border-[#0065eb] ring-1 ring-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Help and feedback</p>
                <p className="text-[10px] text-slate-500">Get customer support and help</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* Sign out link at bottom */}
          <div className="text-center pt-2">
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-[#0065eb] hover:underline cursor-pointer py-1"
            >
              Sign out
            </button>
          </div>

        </div>

        {/* Right Main Content Panel (Dynamically changes based on active tab) */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col gap-5 min-h-[480px]">
          
          {/* TAB 1: PROFILE (BASIC INFO & CONTACT) */}
          {activeTab === 'PROFILE' && (
            <>
              <div className="border-b border-slate-100 pb-2.5">
                <h2 className="text-lg font-semibold text-slate-900">{user?.full_name}</h2>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Basic information</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Make sure this information matches your travel ID, like your passport or license.</p>
                  </div>
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="text-xs font-semibold text-[#0065eb] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <p className="font-semibold text-slate-700 text-[11px]">Full Name</p>
                    <p className="text-slate-600 mt-0.5 text-xs">{user?.full_name}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-[11px]">Role</p>
                    <p className="text-slate-600 mt-0.5 uppercase text-xs">{user?.role}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">You can sign in, receive account activity alerts, and get trip updates by sharing this information.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="flex items-start gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-700 text-[11px]">Email Address</p>
                      <p className="text-slate-600 mt-0.5 text-xs">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-700 text-[11px]">Account Status</p>
                      <p className="text-slate-600 mt-0.5 capitalize text-xs">{user?.status || 'Active'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: COMMUNICATIONS (PRICE ALERTS & NOTIFICATIONS) */}
          {activeTab === 'COMMUNICATIONS' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-slate-600" /> Communications & Price Alerts
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Manage travel alert preferences and active price trackers.</p>
              </div>

              {alertPrefs && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3 text-xs">
                  <h3 className="font-semibold text-slate-800 text-xs">Notification Preferences</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Flight delay push notifications</span>
                    <Switch
                      checked={alertPrefs.flight_delay_push}
                      onCheckedChange={(checked) => handleTogglePref('flight_delay_push', Boolean(checked))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Gate change push notifications</span>
                    <Switch
                      checked={alertPrefs.gate_change_push}
                      onCheckedChange={(checked) => handleTogglePref('gate_change_push', Boolean(checked))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Price drop email alerts</span>
                    <Switch
                      checked={alertPrefs.price_drop_email}
                      onCheckedChange={(checked) => handleTogglePref('price_drop_email', Boolean(checked))}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-blue-600" /> Active Price Trackers
                </h3>

                {loadingAlerts ? (
                  <LoadingState message="Loading price alerts..." />
                ) : alerts.length === 0 ? (
                  <EmptyState title="No active price alerts" description="Track prices on any flight route to get instant notifications." />
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {alerts.map((al) => (
                      <div key={al.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-slate-900">{al.origin_iata} → {al.destination_iata}</p>
                          <p className="text-[10px] text-slate-500">Departure: {al.departure_date} • Created: {new Date(al.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className="text-xs font-semibold text-blue-600">
                          {al.target_price ? `${al.target_price.toLocaleString()} VND` : 'Tracking'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MY TRIPS & BOOKINGS */}
          {activeTab === 'MY_TRIPS' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-slate-600" /> My Trips & Bookings
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Manage your upcoming flights, e-tickets, and cancellations.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg gap-1 text-[11px] font-medium">
                  {['', 'CONFIRMED', 'PENDING', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setBookingFilter(st)}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        bookingFilter === st ? 'bg-white text-blue-600 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st || 'All'}
                    </button>
                  ))}
                </div>
              </div>

              {loadingBookings ? (
                <LoadingState message="Loading your bookings..." />
              ) : bookings.length === 0 ? (
                <EmptyState
                  title="No bookings found"
                  description="Start searching for flights to book your next trip!"
                  actionLabel="Search Flights"
                  onAction={() => navigate('/flights/search')}
                />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => navigate(`/bookings/${b.id}`)}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:bg-blue-50/40 transition-colors cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-semibold text-blue-600 text-[11px]">PNR: {b.pnr}</span>
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                            b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800">Contact: {b.contact_name} ({b.contact_email})</p>
                        <p className="text-[10px] text-slate-500">Booked: {new Date(b.created_at).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500">Total Amount</p>
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm">{b.total_amount.toLocaleString()} VND</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED FLIGHTS */}
          {activeTab === 'SAVED_FLIGHTS' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-slate-600" /> Saved Flights
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Your bookmarked flight routes and saved offers.</p>
              </div>

              {loadingSavedFlights ? (
                <LoadingState message="Loading saved flights..." />
              ) : savedFlights.length === 0 ? (
                <EmptyState
                  title="You haven't saved any flights yet"
                  description="Click the heart icon on any flight offer to save it here for later."
                  actionLabel="Search Flights"
                  onAction={() => navigate('/flights/search')}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedFlights.map((sf) => (
                    <div key={sf.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-blue-600 text-[11px]">{sf.flight_number || 'Flight'}</p>
                        <p className="font-semibold text-slate-900 text-sm">{sf.origin} → {sf.destination}</p>
                        <p className="text-[10px] text-slate-500">Saved: {new Date(sf.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          onClick={() => navigate(`/flights/search?origin=${sf.origin}&destination=${sf.destination}`)}
                          size="sm"
                          className="bg-blue-600 text-white font-medium text-[11px] rounded-lg h-8 px-3 cursor-pointer"
                        >
                          Offers
                        </Button>
                        <button
                          onClick={() => handleUnsaveFlight(sf.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: COUPONS & OFFERS */}
          {activeTab === 'COUPONS' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-slate-600" /> Coupons & Offers
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Available discount promo codes for your bookings.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded-md w-fit uppercase">
                    WELCOME100
                  </span>
                  <p className="text-sm font-semibold text-slate-900 mt-1">Get 100,000 VND Off</p>
                  <p className="text-[11px] text-slate-600">Valid on all domestic flights in Vietnam.</p>
                  <Button onClick={() => navigate('/flights/search')} size="sm" className="bg-blue-600 text-white rounded-full text-xs w-fit mt-2 h-7 px-4 cursor-pointer">
                    Apply on Search
                  </Button>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-md w-fit uppercase">
                    SUMMER2026
                  </span>
                  <p className="text-sm font-semibold text-slate-900 mt-1">15% Special Summer Discount</p>
                  <p className="text-[11px] text-slate-600">Applicable for return flight itineraries.</p>
                  <Button onClick={() => navigate('/flights/search')} size="sm" className="bg-emerald-600 text-white rounded-full text-xs w-fit mt-2 h-7 px-4 cursor-pointer">
                    Apply on Search
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ADDITIONAL TRAVELERS */}
          {activeTab === 'PASSENGERS' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-600" /> Additional Travelers
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Save profiles of family, friends, or teammates for quick checkout.</p>
                </div>
              </div>

              {editingPassenger ? (
                <form onSubmit={handleSavePassenger} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2.5">
                  <h4 className="text-xs font-semibold text-slate-800">{editingPassenger.id ? 'Edit Traveler' : 'Add New Traveler'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <Input placeholder="Full Name" value={editingPassenger.full_name || ''} onChange={(e) => setEditingPassenger({ ...editingPassenger, full_name: e.target.value })} required className="text-xs bg-white h-9" />
                    
                    {/* Official shadcn Date Picker */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          type="button"
                          className="w-full justify-start text-left font-normal text-xs bg-white h-9 border-slate-300 rounded-lg text-slate-700 cursor-pointer"
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-500" />
                          {editingPassenger.date_of_birth
                            ? new Date(editingPassenger.date_of_birth).toLocaleDateString()
                            : <span className="text-slate-400">Date of Birth</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border border-slate-200 shadow-none rounded-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={editingPassenger.date_of_birth ? new Date(editingPassenger.date_of_birth) : undefined}
                          onSelect={(date) =>
                            setEditingPassenger({
                              ...editingPassenger,
                              date_of_birth: date ? date.toISOString().split('T')[0] : '',
                            })
                          }
                        />
                      </PopoverContent>
                    </Popover>

                    <Input placeholder="Nationality" value={editingPassenger.nationality || ''} onChange={(e) => setEditingPassenger({ ...editingPassenger, nationality: e.target.value })} className="text-xs bg-white h-9" />
                    <Input placeholder="Passport Number" value={editingPassenger.passport_number || ''} onChange={(e) => setEditingPassenger({ ...editingPassenger, passport_number: e.target.value })} className="text-xs bg-white h-9" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Button type="submit" size="sm" disabled={savingPassenger} className="bg-[#0065eb] text-white font-medium text-xs rounded-full px-4 h-8 cursor-pointer">
                      <Check className="w-3.5 h-3.5 mr-1" /> Save Traveler
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingPassenger(null)} className="text-xs h-8 cursor-pointer">
                      <X className="w-3.5 h-3.5 mr-1" /> Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {passengers.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {passengers.map((p) => (
                        <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-start text-xs">
                          <div>
                            <h4 className="font-semibold text-slate-900">{p.full_name}</h4>
                            <p className="text-[11px] text-slate-500">DOB: {p.date_of_birth || 'N/A'}</p>
                            <p className="text-[11px] text-slate-500">Nationality: {p.nationality || 'N/A'}</p>
                            {p.passport_number && <p className="text-[11px] text-slate-500">Passport: {p.passport_number}</p>}
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setEditingPassenger(p)} className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-200 cursor-pointer">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeletePassenger(p.id)} className="p-1 text-slate-500 hover:text-red-600 rounded hover:bg-slate-200 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => setEditingPassenger({ full_name: '', nationality: 'Vietnam' })}
                    variant="outline"
                    className="w-full sm:w-fit text-xs font-semibold text-slate-700 border-slate-300 rounded-full px-5 py-1.5 h-8 hover:bg-slate-50 cursor-pointer"
                  >
                    Add additional traveler
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: SECURITY & ACTIVE SESSIONS */}
          {activeTab === 'SECURITY' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-slate-600" /> Security & Settings
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Manage password updates and active login devices.</p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Change Password</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Update your account password for enhanced security.</p>
                  </div>
                  {!editingPassword && (
                    <button
                      onClick={() => setEditingPassword(true)}
                      className="text-xs font-semibold text-[#0065eb] hover:underline cursor-pointer"
                    >
                      Change Password
                    </button>
                  )}
                </div>

                {editingPassword && (
                  <form onSubmit={handleChangePassword} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2.5 max-w-md">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Old Password</label>
                      <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required className="text-xs bg-white h-9" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">New Password</label>
                      <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="text-xs bg-white h-9" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Button type="submit" disabled={changingPassword} size="sm" className="bg-[#0065eb] hover:bg-blue-700 text-white font-medium text-xs rounded-full px-4 h-8 cursor-pointer">
                        {changingPassword ? 'Updating...' : 'Update Password'}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditingPassword(false)} className="text-xs h-8 cursor-pointer">
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Active login devices</h3>
                <p className="text-[11px] text-slate-500 mb-3">View active browser sessions logged into your account.</p>
                {loadingSessions ? (
                  <p className="text-[11px] text-slate-500">Loading active sessions...</p>
                ) : sessions.length === 0 ? (
                  <p className="text-[11px] text-slate-500">No active sessions found.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {sessions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">{s.user_agent || 'Browser Device'}</p>
                          <p className="text-[10px] text-slate-500">IP: {s.ip_address || '127.0.0.1'} • Logged in: {new Date(s.created_at).toLocaleString()}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleRevokeSession(s.id)} className="text-red-600 border-red-200 hover:bg-red-50 text-[11px] font-medium cursor-pointer rounded-full h-7 px-3">
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: HELP & FEEDBACK / SUPPORT DESK */}
          {activeTab === 'SUPPORT' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-slate-600" /> Help & Customer Support
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Get assistance from our staff for bookings, refunds, or queries.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Form */}
                <form onSubmit={handleCreateTicket} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2.5">
                  <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5 text-blue-600" /> Submit Support Ticket
                  </h3>
                  <div>
                    <label className="text-[10px] font-medium text-slate-600 block mb-0.5">Subject</label>
                    <Input value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} placeholder="Need help with..." required className="text-xs bg-white h-8" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-600 block mb-0.5">Category</label>
                    <Select value={ticketCategory} onValueChange={setTicketCategory}>
                      <SelectTrigger className="text-xs bg-white h-8">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BOOKING">Booking & Itinerary</SelectItem>
                        <SelectItem value="REFUND">Refund / Payment</SelectItem>
                        <SelectItem value="BAGGAGE">Baggage & Extras</SelectItem>
                        <SelectItem value="OTHER">Other Query</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-600 block mb-0.5">Message</label>
                    <Textarea value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)} placeholder="Describe your question..." className="text-xs bg-white min-h-16 p-2" required />
                  </div>
                  <Button type="submit" disabled={creatingTicket} className="bg-blue-600 text-white text-xs font-medium rounded-full h-8 cursor-pointer mt-1">
                    {creatingTicket ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </form>

                {/* List & Thread */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold text-slate-900">Your Tickets</h3>
                  {loadingSupport ? (
                    <LoadingState message="Loading tickets..." />
                  ) : supportTickets.length === 0 ? (
                    <p className="text-[11px] text-slate-500">No support tickets found.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
                      {supportTickets.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleSelectTicket(t.id)}
                          className={`p-2.5 text-left rounded-lg border text-xs cursor-pointer flex flex-col gap-0.5 ${
                            activeTicketDetail?.ticket.id === t.id ? 'bg-blue-50 border-blue-300 font-semibold' : 'bg-slate-50 border-slate-200 font-normal'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="truncate">{t.subject}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 bg-slate-200 rounded">{t.status}</span>
                          </div>
                          <span className="text-[9px] text-slate-400">{new Date(t.created_at).toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTicketDetail && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 mt-1">
                      <h4 className="text-xs font-semibold text-slate-900">{activeTicketDetail.ticket.subject}</h4>
                      <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 p-1">
                        {activeTicketDetail.messages.map((m) => (
                          <div key={m.id} className={`p-2 rounded-lg text-[11px] ${m.sender_type === 'STAFF' ? 'bg-purple-100 text-purple-900' : 'bg-blue-600 text-white self-end'}`}>
                            <p>{m.body}</p>
                          </div>
                        ))}
                      </div>
                      {activeTicketDetail.ticket.status !== 'CLOSED' && (
                        <form onSubmit={handleSendReply} className="flex gap-1">
                          <Input value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Type reply..." className="text-xs bg-[#fff] h-7 flex-1" required />
                          <Button type="submit" disabled={sendingReply} size="sm" className="bg-blue-600 text-white h-7 px-3 text-xs rounded-lg cursor-pointer">
                            <Send className="w-3 h-3" />
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
