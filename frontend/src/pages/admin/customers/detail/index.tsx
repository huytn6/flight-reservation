import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/admin';
import type { AuthUser } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ShieldCheck, UserCheck, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export const CustomerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      if (id) {
        const res = await adminService.getCustomer(id);
        setCustomer(res);
      }
    } catch (err: any) {
      toast.error(err.message || 'Tải thông tin khách hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'INACTIVE' || status === 'BLOCKED') {
      return (
        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
          Tài khoản bị khóa
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
        Đang hoạt động
      </span>
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Đang tải thông tin khách hàng...</div>;
  }

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-4 font-sans">
        <p className="text-sm text-slate-600">Không tìm thấy hồ sơ khách hàng.</p>
        <Button size="sm" onClick={() => navigate('/admin/customers')} className="text-xs font-normal">
          Quay lại danh sách khách hàng
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 font-sans relative pb-12">
      {/* Enterprise Page Header */}
      <AdminPageHeader
        title={`Hồ Sơ Khách Hàng: ${customer.full_name || 'Người dùng'}`}
        description="Thông tin tài khoản cá nhân, lịch sử đặt vé và trạng thái bảo mật."
        backPath="/admin/customers"
        breadcrumbs={[
          { label: 'Quản lý khách hàng', href: '/admin/customers' },
          { label: `Chi tiết ${customer.full_name || customer.email}` },
        ]}
      />

      {/* Main 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Column (8 Cols): Profile Info & History */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Customer Main Info Card */}
          <Card className="bg-white border-0 shadow-none rounded-lg py-0">
            <CardHeader className="px-4 py-3 bg-white border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-900">
                Thông Tin Cá Nhân & Tài Khoản
              </CardTitle>
              {getStatusBadge(customer.status)}
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              
              {/* Avatar & Key Name Banner */}
              <div className="flex items-center gap-4 bg-slate-50/70 p-4 rounded-lg border-0">
                <div className="w-12 h-12 bg-blue-100 text-[#0065eb] rounded-full flex items-center justify-center font-bold text-base shrink-0">
                  {customer.full_name?.charAt(0).toUpperCase() || 'K'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {customer.full_name || 'Khách hàng'}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{customer.email}</p>
                </div>
              </div>

              {/* Detail Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500">Họ và tên khách hàng:</span>
                  <p className="font-medium text-slate-900 text-sm">
                    {customer.full_name || 'Chưa cập nhật'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500">Địa chỉ Email:</span>
                  <p className="font-mono font-medium text-slate-900 text-sm">
                    {customer.email}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500">Vai trò hệ thống:</span>
                  <p className="font-medium text-slate-900 text-sm">
                    {customer.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng (Customer)'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500">Trạng thái tài khoản:</span>
                  <p className="font-medium text-emerald-600 text-sm flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Sẵn sàng giao dịch
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Account Activity Summary Card */}
          <Card className="bg-white border-0 shadow-none rounded-lg py-0">
            <CardHeader className="px-4 py-3 bg-white border-b border-slate-100">
              <CardTitle className="text-xs font-semibold text-slate-900">
                Tổng Quan Đặt Vé & Giao Dịch
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 bg-slate-50/60 rounded-md border-0 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hạng hội viên:</span>
                </div>
                <p className="font-semibold text-slate-900 text-sm">Thành viên Tiêu Chuẩn</p>
              </div>

              <div className="p-3 bg-slate-50/60 rounded-md border-0 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Xác thực hệ thống:</span>
                </div>
                <p className="font-semibold text-emerald-600 text-sm">Đã xác minh Email</p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (4 Cols): Account Security Panel */}
        <div className="lg:col-span-4 space-y-4 sticky top-20">
          
          <Card className="bg-white border-0 shadow-none rounded-lg py-0">
            <CardHeader className="px-4 py-3 bg-white border-b border-slate-100">
              <CardTitle className="text-xs font-semibold text-slate-900">
                Trạng Thái An Ninh & Thao Tác
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Mã ID khách hàng</span>
                <span className="font-mono text-[11px] text-slate-700 truncate max-w-[120px]">{customer.id || id}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Bảo mật tài khoản</span>
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> An toàn
                </span>
              </div>
              
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/customers')}
                  className="w-full h-8.5 text-xs font-normal text-slate-700 border-slate-200/70 hover:bg-slate-50 rounded-md cursor-pointer shadow-none"
                >
                  Quay lại danh sách khách hàng
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
};
