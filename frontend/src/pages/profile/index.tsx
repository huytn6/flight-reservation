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
  Bell,
  Ticket,
  Heart,
  HelpCircle,
  TrendingDown,
  Plus,
  Send,
  CalendarIcon
} from 'lucide-react';

type TabType = 'PROFILE' | 'COMMUNICATIONS' | 'MY_TRIPS' | 'SAVED_FLIGHTS' | 'PASSENGERS' | 'SECURITY' | 'SUPPORT';

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
  const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
    loadPassengers();
    userService.getProfile().then((p: any) => setDateOfBirth(p.date_of_birth || null)).catch(() => {});
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
      toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      setOldPassword('');
      setNewPassword('');
      setEditingPassword(false);
    } catch (err: any) {
      toast.error(err.message || 'Đổi mật khẩu thất bại');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await userService.revokeSession(id);
      toast.success('Đã đăng xuất thiết bị');
      loadSessions();
    } catch (err: any) {
      toast.error(err.message || 'Đăng xuất thiết bị thất bại');
    }
  };

  const handleSavePassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPassenger?.full_name) return;
    setSavingPassenger(true);
    try {
      if (editingPassenger.id) {
        await userService.updateSavedPassenger(editingPassenger.id, editingPassenger);
        toast.success('Đã cập nhật thông tin hành khách');
      } else {
        await userService.addSavedPassenger(editingPassenger);
        toast.success('Đã thêm hành khách thành công');
      }
      setEditingPassenger(null);
      loadPassengers();
    } catch (err: any) {
      toast.error(err.message || 'Lưu thông tin hành khách thất bại');
    } finally {
      setSavingPassenger(false);
    }
  };

  const handleDeletePassenger = async (id: string) => {
    try {
      await userService.deleteSavedPassenger(id);
      toast.success('Đã xóa thông tin hành khách');
      loadPassengers();
    } catch (err: any) {
      toast.error(err.message || 'Xóa hành khách thất bại');
    }
  };

  const handleUnsaveFlight = async (id: string) => {
    try {
      await flightService.unsaveFlight(id);
      toast.success('Đã xóa chuyến bay khỏi danh sách đã lưu');
      loadSavedFlights();
    } catch (err: any) {
      toast.error(err.message || 'Xóa chuyến bay thất bại');
    }
  };

  const handleTogglePref = async (key: keyof TravelAlertPreferences, val: boolean) => {
    if (!alertPrefs) return;
    setAlertPrefs({ ...alertPrefs, [key]: val });
    try {
      await notificationService.updatePreferences({ [key]: val });
      toast.success('Cập nhật cài đặt thông báo thành công');
    } catch {
      toast.error('Cập nhật cài đặt thông báo thất bại');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTicket(true);
    try {
      await supportService.createTicket({ subject: ticketSubject, category: ticketCategory, message: ticketMessage });
      toast.success('Tạo yêu cầu hỗ trợ thành công!');
      setTicketSubject('');
      setTicketMessage('');
      loadSupportTickets();
    } catch (err: any) {
      toast.error(err.message || 'Tạo yêu cầu hỗ trợ thất bại');
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSelectTicket = async (id: string) => {
    try {
      const detail = await supportService.getTicketDetail(id);
      setActiveTicketDetail(detail);
    } catch (err: any) {
      toast.error(err.message || 'Tải chi tiết cuộc trò chuyện thất bại');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketDetail || !replyBody.trim()) return;
    setSendingReply(true);
    try {
      await supportService.addMessage(activeTicketDetail.ticket.id, replyBody);
      toast.success('Đã gửi tin nhắn phản hồi');
      setReplyBody('');
      handleSelectTicket(activeTicketDetail.ticket.id);
    } catch (err: any) {
      toast.error(err.message || 'Gửi tin nhắn thất bại');
    } finally {
      setSendingReply(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đăng xuất thành công');
      navigate('/');
    } catch {
      toast.error('Đăng xuất thất bại');
    }
  };

  const firstName = user?.full_name?.split(' ')[0] || user?.full_name || 'Bạn';

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-4 sm:py-6 font-sans">
      
      {/* Top Header Title */}
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900">Xin chào, {firstName}</h1>
        <p className="text-[11px] text-slate-500">{user?.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        
        {/* Left Sidebar Navigation Cards */}
        <div className="flex flex-col gap-2">
          
          {/* Account Overview Summary Card */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col gap-1 relative mb-1">
            <span className="absolute top-3 right-3 text-[9px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md uppercase">
              {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role === 'STAFF' ? 'Nhân viên' : 'Khách hàng'}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Trạng thái tài khoản</span>
            </div>
            <p className="text-base font-bold text-slate-900 capitalize">Đang hoạt động</p>
            <p className="text-[10px] text-slate-500">{user?.email}</p>
          </div>

          {/* 1. Profile */}
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'PROFILE' ? 'bg-white border-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Hồ sơ cá nhân</p>
                <p className="text-[10px] text-slate-500">Cung cấp thông tin cá nhân và giấy tờ du lịch</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* 2. Communications */}
          <button
            onClick={() => setActiveTab('COMMUNICATIONS')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'COMMUNICATIONS' ? 'bg-white border-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Bell className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Thông báo & Giá vé</p>
                <p className="text-[10px] text-slate-500">Quản lý cài đặt nhận thông báo và theo dõi giá vé</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* 3. My Trips */}
          <button
            onClick={() => setActiveTab('MY_TRIPS')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'MY_TRIPS' ? 'bg-white border-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Ticket className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Chuyến đi của tôi</p>
                <p className="text-[10px] text-slate-500">Xem danh sách vé máy bay và vé điện tử đã đặt</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* 4. Saved Flights */}
          <button
            onClick={() => setActiveTab('SAVED_FLIGHTS')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'SAVED_FLIGHTS' ? 'bg-white border-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Heart className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Chuyến bay đã lưu</p>
                <p className="text-[10px] text-slate-500">Xem danh sách ưu đãi chuyến bay bạn đã lưu</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* 5. Additional Travelers */}
          <button
            onClick={() => setActiveTab('PASSENGERS')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'PASSENGERS' ? 'bg-white border-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Hành khách đi cùng</p>
                <p className="text-[10px] text-slate-500">Lưu thông tin người thân, bạn bè ({passengers.length})</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* 6. Security and settings */}
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'SECURITY' ? 'bg-white border-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Bảo mật & Cài đặt</p>
                <p className="text-[10px] text-slate-500">Cập nhật mật khẩu và quản lý thiết bị đăng nhập ({sessions.length})</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </button>

          {/* 7. Help and feedback */}
          <button
            onClick={() => setActiveTab('SUPPORT')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'SUPPORT' ? 'bg-white border-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Hỗ trợ & Trợ giúp</p>
                <p className="text-[10px] text-slate-500">Gửi yêu cầu trợ giúp và tư vấn từ nhân viên</p>
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
              Đăng xuất
            </button>
          </div>

        </div>

        {/* Right Main Content Panel */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col gap-5 min-h-[480px]">
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="flex flex-col gap-5">
              
              {/* Header Name */}
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-xl font-bold text-slate-900">{user?.full_name}</h2>
              </div>

              {/* Basic information */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Thông tin cơ bản</h3>
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="text-xs font-semibold text-[#0065eb] hover:underline cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                </div>
                <p className="text-xs text-slate-500 leading-normal mb-1">
                  Hãy đảm bảo thông tin này trùng khớp với giấy tờ tùy thân của bạn (Hộ chiếu, CCCD).
                </p>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Họ và tên</p>
                    <p className="text-slate-600">{user?.full_name}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Giới thiệu</p>
                    <p className="text-slate-600">Chưa cập nhật</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Ngày sinh</p>
                    <p className="text-slate-600">{dateOfBirth || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Giới tính</p>
                    <p className="text-slate-600">Chưa cập nhật</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Yêu cầu hỗ trợ đặc biệt</p>
                    <p className="text-slate-600">Chưa cập nhật</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Contact */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Thông tin liên hệ</h3>
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="text-xs font-semibold text-[#0065eb] hover:underline cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                </div>
                <p className="text-xs text-slate-500 leading-normal mb-1">
                  Thông tin dùng để đăng nhập, nhận thông báo chuyến bay và cập nhật trạng thái đặt vé.
                </p>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Số điện thoại</p>
                    <p className="text-slate-600">{user?.phone || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Địa chỉ Email</p>
                    <p className="text-slate-600">{user?.email}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Liên hệ khẩn cấp</p>
                    <p className="text-slate-600">Chưa cập nhật</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Địa chỉ</p>
                    <p className="text-slate-600">Chưa cập nhật</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Bottom 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Left Col: More details */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">Chi tiết bổ sung</h3>
                  <p className="text-xs text-slate-500 leading-normal mb-1">
                    Lưu trước thông tin để đặt vé máy bay nhanh chóng hơn.
                  </p>

                  <div className="flex flex-col gap-2 mt-1">
                    <button
                      onClick={() => setActiveTab('PASSENGERS')}
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Giấy tờ du lịch</p>
                        <p className="text-[10px] text-slate-500">Thông tin Hộ chiếu & CCCD</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setActiveTab('COMMUNICATIONS')}
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Sở thích chuyến bay</p>
                        <p className="text-[10px] text-slate-500">Vị trí chỗ ngồi và sân bay quen thuộc</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Right Col: Additional travelers */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Hành khách đi cùng</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal mb-1">
                    Lưu thông tin người thân hoặc bạn bè để điền nhanh khi đặt vé chuyến bay.
                  </p>

                  <div className="mt-2">
                    <button
                      onClick={() => setActiveTab('PASSENGERS')}
                      className="w-full text-xs font-semibold text-[#0065eb] border border-slate-300 rounded-full px-5 py-2 hover:bg-slate-50 transition-colors cursor-pointer text-center"
                    >
                      Thêm hành khách đi cùng
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: COMMUNICATIONS */}
          {activeTab === 'COMMUNICATIONS' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-slate-600" /> Thông báo & Theo dõi giá vé
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Quản lý tùy chọn nhận thông báo chuyến bay và các chặng bay đang theo dõi.</p>
              </div>

              {alertPrefs && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3 text-xs">
                  <h3 className="font-semibold text-slate-800 text-xs">Tùy chọn nhận thông báo</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Thông báo khi chuyến bay hoãn</span>
                    <Switch
                      checked={alertPrefs.delay_alerts}
                      onCheckedChange={(checked) => handleTogglePref('delay_alerts', Boolean(checked))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Thông báo khi chuyến bay bị hủy</span>
                    <Switch
                      checked={alertPrefs.cancellation_alerts}
                      onCheckedChange={(checked) => handleTogglePref('cancellation_alerts', Boolean(checked))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Thông báo khi giá vé giảm</span>
                    <Switch
                      checked={alertPrefs.price_drop_alerts}
                      onCheckedChange={(checked) => handleTogglePref('price_drop_alerts', Boolean(checked))}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-blue-600" /> Chặng bay đang theo dõi giá
                </h3>

                {loadingAlerts ? (
                  <LoadingState message="Đang tải danh sách theo dõi giá..." />
                ) : alerts.length === 0 ? (
                  <EmptyState title="Chưa có chặng bay nào được theo dõi giá" description="Bấm theo dõi giá ở trang tìm kiếm để nhận thông báo ngay khi giá giảm." />
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {alerts.map((al) => (
                      <div key={al.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-slate-900">{al.origin_iata} → {al.destination_iata}</p>
                          <p className="text-[10px] text-slate-500">Khởi hành: {al.departure_date} • Tạo lúc: {new Date(al.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className="text-xs font-semibold text-blue-600">
                          {al.max_price ? `${al.max_price.toLocaleString()} VND` : 'Đang theo dõi'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MY TRIPS */}
          {activeTab === 'MY_TRIPS' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-slate-600" /> Chuyến đi & Đặt vé của tôi
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Quản lý các chuyến bay sắp tới, vé điện tử và trạng thái đặt vé.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg gap-1 text-[11px] font-medium">
                  {[
                    { code: '', label: 'Tất cả' },
                    { code: 'CONFIRMED', label: 'Đã xác nhận' },
                    { code: 'PENDING', label: 'Chờ xử lý' },
                    { code: 'CANCELLED', label: 'Đã hủy' },
                  ].map((st) => (
                    <button
                      key={st.code}
                      onClick={() => setBookingFilter(st.code)}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        bookingFilter === st.code ? 'bg-white text-blue-600 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {loadingBookings ? (
                <LoadingState message="Đang tải danh sách đặt vé..." />
              ) : bookings.length === 0 ? (
                <EmptyState
                  title="Chưa có đơn đặt vé nào"
                  description="Bắt đầu tìm kiếm chuyến bay cho hành trình tiếp theo của bạn!"
                  actionLabel="Tìm chuyến bay"
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
                            {b.status === 'CONFIRMED' ? 'Đã xác nhận' : b.status === 'PENDING' ? 'Chờ xử lý' : 'Đã hủy'}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800">Liên hệ: {b.contact_name} ({b.contact_email})</p>
                        <p className="text-[10px] text-slate-500">Ngày đặt: {new Date(b.created_at).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500">Tổng tiền</p>
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
                  <Heart className="w-5 h-5 text-slate-600" /> Chuyến bay đã lưu
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Danh sách các chặng bay và ưu đãi bạn đã lưu lại.</p>
              </div>

              {loadingSavedFlights ? (
                <LoadingState message="Đang tải danh sách chuyến bay đã lưu..." />
              ) : savedFlights.length === 0 ? (
                <EmptyState
                  title="Bạn chưa lưu chuyến bay nào"
                  description="Bấm vào biểu tượng trái tim khi tìm kiếm vé để lưu lại xem sau."
                  actionLabel="Tìm chuyến bay"
                  onAction={() => navigate('/flights/search')}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedFlights.map((sf) => (
                    <div key={sf.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-blue-600 text-[11px]">{sf.flight_number || 'Chuyến bay'}</p>
                        <p className="font-semibold text-slate-900 text-sm">{sf.origin} → {sf.destination}</p>
                        <p className="text-[10px] text-slate-500">Đã lưu: {new Date(sf.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          onClick={() => navigate(`/flights/search?origin=${sf.origin}&destination=${sf.destination}`)}
                          size="sm"
                          className="bg-blue-600 text-white font-medium text-[11px] rounded-lg h-8 px-3 cursor-pointer"
                        >
                          Xem vé
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

          {/* TAB 5: PASSENGERS */}
          {activeTab === 'PASSENGERS' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-600" /> Danh sách hành khách đi cùng
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Lưu sẵn thông tin người thân hoặc bạn bè để điền nhanh khi đặt vé.</p>
                </div>
              </div>

              {editingPassenger ? (
                <form onSubmit={handleSavePassenger} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2.5">
                  <h4 className="text-xs font-semibold text-slate-800">{editingPassenger.id ? 'Chỉnh sửa hành khách' : 'Thêm hành khách mới'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <Input placeholder="Họ và tên" value={editingPassenger.full_name || ''} onChange={(e) => setEditingPassenger({ ...editingPassenger, full_name: e.target.value })} required className="text-xs bg-white h-9" />
                    
                    {/* Official Date Picker */}
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
                            : <span className="text-slate-400">Ngày sinh</span>}
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

                    <Input placeholder="Quốc tịch" value={editingPassenger.nationality || ''} onChange={(e) => setEditingPassenger({ ...editingPassenger, nationality: e.target.value })} className="text-xs bg-white h-9" />
                    <Input placeholder="Số hộ chiếu / CCCD" value={editingPassenger.passport_number || ''} onChange={(e) => setEditingPassenger({ ...editingPassenger, passport_number: e.target.value })} className="text-xs bg-white h-9" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Button type="submit" size="sm" disabled={savingPassenger} className="bg-[#0065eb] text-white font-medium text-xs rounded-full px-4 h-8 cursor-pointer">
                      <Check className="w-3.5 h-3.5 mr-1" /> Lưu hành khách
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingPassenger(null)} className="text-xs h-8 cursor-pointer">
                      <X className="w-3.5 h-3.5 mr-1" /> Hủy
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
                            <p className="text-[11px] text-slate-500">Ngày sinh: {p.date_of_birth || 'Chưa cập nhật'}</p>
                            <p className="text-[11px] text-slate-500">Quốc tịch: {p.nationality || 'Việt Nam'}</p>
                            {p.passport_number && <p className="text-[11px] text-slate-500">Hộ chiếu: {p.passport_number}</p>}
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
                    onClick={() => setEditingPassenger({ full_name: '', nationality: 'Việt Nam' })}
                    variant="outline"
                    className="w-full sm:w-fit text-xs font-semibold text-slate-700 border-slate-300 rounded-full px-5 py-1.5 h-8 hover:bg-slate-50 cursor-pointer"
                  >
                    Thêm hành khách đi cùng
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SECURITY */}
          {activeTab === 'SECURITY' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-slate-600" /> Bảo mật & Cài đặt tài khoản
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Quản lý đổi mật khẩu và xem các thiết bị đang đăng nhập.</p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Đổi mật khẩu</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Cập nhật mật khẩu tài khoản để tăng cường bảo mật.</p>
                  </div>
                  {!editingPassword && (
                    <button
                      onClick={() => setEditingPassword(true)}
                      className="text-xs font-semibold text-[#0065eb] hover:underline cursor-pointer"
                    >
                      Đổi mật khẩu
                    </button>
                  )}
                </div>

                {editingPassword && (
                  <form onSubmit={handleChangePassword} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2.5 max-w-md">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Mật khẩu hiện tại</label>
                      <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required className="text-xs bg-white h-9" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Mật khẩu mới</label>
                      <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="text-xs bg-white h-9" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Button type="submit" disabled={changingPassword} size="sm" className="bg-[#0065eb] hover:bg-blue-700 text-white font-medium text-xs rounded-full px-4 h-8 cursor-pointer">
                        {changingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditingPassword(false)} className="text-xs h-8 cursor-pointer">
                        Hủy
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Thiết bị đang đăng nhập</h3>
                <p className="text-[11px] text-slate-500 mb-3">Xem danh sách các trình duyệt và thiết bị đang đăng nhập tài khoản của bạn.</p>
                {loadingSessions ? (
                  <p className="text-[11px] text-slate-500">Đang tải danh sách thiết bị...</p>
                ) : sessions.length === 0 ? (
                  <p className="text-[11px] text-slate-500">Không tìm thấy thiết bị nào.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {sessions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">{s.user_agent || 'Thiết bị trình duyệt'}</p>
                          <p className="text-[10px] text-slate-500">IP: {s.ip_address || '127.0.0.1'} • Đăng nhập: {new Date(s.created_at).toLocaleString()}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleRevokeSession(s.id)} className="text-red-600 border-red-200 hover:bg-red-50 text-[11px] font-medium cursor-pointer rounded-full h-7 px-3">
                          Đăng xuất
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: HELP & SUPPORT */}
          {activeTab === 'SUPPORT' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-lg font-semibold text-slate-900">Hỗ trợ & Trợ giúp</h2>
                <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                  Gửi yêu cầu hỗ trợ về đặt vé máy bay, hoàn tiền hoặc các thắc mắc chung.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                
                {/* Left Col: Submit Support Ticket Form */}
                <form onSubmit={handleCreateTicket} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col gap-3 h-full">
                  <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#0065eb]" /> Gửi yêu cầu hỗ trợ mới
                  </h3>
                  
                  <div>
                    <label className="text-[11px] font-normal text-slate-600 block mb-1">Tiêu đề</label>
                    <Input
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Cần trợ giúp về..."
                      required
                      className="text-xs bg-white border-slate-300 rounded-lg h-9 focus:border-[#0065eb]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-normal text-slate-600 block mb-1">Chủ đề</label>
                    <Select value={ticketCategory} onValueChange={setTicketCategory}>
                      <SelectTrigger className="text-xs bg-white border-slate-300 rounded-lg h-9">
                        <SelectValue placeholder="Chọn chủ đề" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BOOKING">Đặt vé & Hành trình</SelectItem>
                        <SelectItem value="REFUND">Hoàn tiền & Thanh toán</SelectItem>
                        <SelectItem value="BAGGAGE">Hành lý & Dịch vụ thêm</SelectItem>
                        <SelectItem value="OTHER">Thắc mắc khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[11px] font-normal text-slate-600 block mb-1">Nội dung yêu cầu</label>
                    <Textarea
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Mô tả chi tiết câu hỏi hoặc thắc mắc của bạn..."
                      className="text-xs bg-white border-slate-300 rounded-lg min-h-24 p-2.5 leading-normal focus:border-[#0065eb]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={creatingTicket}
                    className="bg-[#0065eb] hover:bg-blue-700 text-white text-xs font-semibold rounded-full h-9 cursor-pointer mt-auto transition-colors shadow-none"
                  >
                    {creatingTicket ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </Button>
                </form>

                {/* Right Col: Your Tickets List */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col gap-3 h-full min-h-[350px]">
                  <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-[#0065eb]" /> Yêu cầu của bạn
                  </h3>
                  
                  {loadingSupport ? (
                    <LoadingState message="Đang tải danh sách yêu cầu hỗ trợ..." />
                  ) : supportTickets.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center my-auto">
                      <HelpCircle className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                      <p className="text-xs text-slate-700 font-semibold">Chưa có yêu cầu hỗ trợ nào</p>
                      <p className="text-[11px] text-slate-400">Các yêu cầu bạn gửi sẽ hiển thị tại đây.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                      {supportTickets.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleSelectTicket(t.id)}
                          className={`p-3 text-left rounded-xl border text-xs cursor-pointer flex flex-col gap-1 transition-colors ${
                            activeTicketDetail?.ticket.id === t.id ? 'bg-blue-50/50 border-[#0065eb]' : 'bg-white border-slate-200/80 hover:bg-slate-100/60'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-normal text-slate-900 truncate">{t.subject}</span>
                            <span className={`text-[9px] font-normal uppercase px-2 py-0.5 rounded-full ${
                              t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {t.status === 'RESOLVED' ? 'Đã giải quyết' : 'Đang xử lý'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">{new Date(t.created_at).toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Active Ticket Thread Detail */}
                  {activeTicketDetail && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex flex-col gap-2 mt-auto">
                      <h4 className="text-xs font-semibold text-slate-900">{activeTicketDetail.ticket.subject}</h4>
                      <div className="max-h-36 overflow-y-auto flex flex-col gap-2 p-1">
                        {activeTicketDetail.messages.map((m) => (
                          <div key={m.id} className={`p-2.5 rounded-lg text-xs font-normal max-w-[85%] ${
                            m.sender_role === 'STAFF' ? 'bg-purple-100 text-purple-900 self-start' : 'bg-[#0065eb] text-white self-end'
                          }`}>
                            <p className="leading-snug">{m.body}</p>
                          </div>
                        ))}
                      </div>
                      {activeTicketDetail.ticket.status !== 'CLOSED' && (
                        <form onSubmit={handleSendReply} className="flex gap-1.5 mt-1">
                          <Input
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            placeholder="Nhập phản hồi..."
                            className="text-xs bg-white border-slate-300 rounded-lg h-8 flex-1 focus:border-[#0065eb]"
                            required
                          />
                          <Button type="submit" disabled={sendingReply} size="sm" className="bg-[#0065eb] text-white h-8 px-3 text-xs rounded-lg cursor-pointer">
                            <Send className="w-3.5 h-3.5" />
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
