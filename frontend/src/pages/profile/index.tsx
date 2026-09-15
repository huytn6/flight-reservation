import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth';
import { userService } from '@/services/user';
import { authService } from '@/services/auth';
import { bookingService, type Booking } from '@/services/booking';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from 'sonner';
import {
  User,
  KeyRound,
  ChevronRight,
  ShieldCheck,
  Ticket,
} from 'lucide-react';

type TabType = 'PROFILE' | 'MY_TRIPS' | 'SECURITY';

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

  // Bookings Data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingFilter, setBookingFilter] = useState('');
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);
  const [nationality, setNationality] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [specialAssistance, setSpecialAssistance] = useState<string | null>(null);

  useEffect(() => {
    userService.getProfile().then((p: any) => {
      setDateOfBirth(p.date_of_birth || null);
      setNationality(p.nationality || null);
      setGender(p.gender || null);
      setBio(p.bio || null);
      setSpecialAssistance(p.special_assistance || null);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'MY_TRIPS') {
      loadBookings();
    }
  }, [activeTab, bookingFilter]);

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

          {/* 2. My Trips */}
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

          {/* 3. Security and settings */}
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`p-3 rounded-xl border transition-colors text-left flex items-start justify-between cursor-pointer ${
              activeTab === 'SECURITY' ? 'bg-white border-[#0065eb]' : 'bg-white border-slate-200 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Bảo mật</p>
                <p className="text-[10px] text-slate-500">Cập nhật mật khẩu tài khoản</p>
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
                    <p className="text-slate-600">{bio || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Ngày sinh</p>
                    <p className="text-slate-600">{dateOfBirth || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Giới tính</p>
                    <p className="text-slate-600">{gender || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Yêu cầu hỗ trợ đặc biệt</p>
                    <p className="text-slate-600">{specialAssistance || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-0.5">Quốc tịch</p>
                    <p className="text-slate-600">{nationality || 'Chưa cập nhật'}</p>
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
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY TRIPS */}
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
                    { code: 'CANCELLED', label: 'Chờ hoàn tiền' },
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
                            {b.status === 'CONFIRMED' ? 'Đã xác nhận' : b.status === 'PENDING' ? 'Chờ xử lý' : b.status === 'CANCELLED' ? 'Chờ hoàn tiền' : b.status}
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

          {/* TAB 3: SECURITY */}
          {activeTab === 'SECURITY' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-slate-600" /> Bảo mật tài khoản
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Cập nhật mật khẩu tài khoản để tăng cường bảo mật.</p>
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
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
