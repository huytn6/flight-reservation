import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import type { AuthUser } from '@/types/auth';
import { UserStatusEnum } from '@/types/enums';
import { Button } from '@/components/ui/button';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

export const CustomersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCustomers('');
      setCustomers(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: AuthUser) => {
    const nextStatus = user.status === UserStatusEnum.ACTIVE ? UserStatusEnum.SUSPENDED : UserStatusEnum.ACTIVE;
    try {
      await adminService.updateCustomerStatus(user.id, nextStatus);
      toast.success(`Đã cập nhật trạng thái khách hàng thành ${nextStatus === UserStatusEnum.ACTIVE ? 'Hoạt động' : 'Tạm khóa'}`);
      loadCustomers();
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật trạng thái khách hàng');
    }
  };

  const columns: ColumnDef<AuthUser>[] = useMemo(() => [
    {
      accessorKey: 'full_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Họ và Tên Khách Hàng" />,
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{row.original.full_name}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng Thái Tài Khoản" />,
      cell: ({ row }) => <StatusBadge type="user" value={row.original.status} />,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày Đăng Ký" />,
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-slate-500">
          {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString('vi-VN') : 'N/A'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Thao Tác',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/customers/${row.original.id}`)}
            className="w-7 h-7 text-slate-500 hover:text-[#0065eb] hover:bg-blue-50 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(row.original)}
            className={`h-7 text-[11px] font-medium px-2.5 cursor-pointer ${
              row.original.status === UserStatusEnum.ACTIVE
                ? 'text-red-600 hover:bg-red-50 border-red-200'
                : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
            }`}
          >
            {row.original.status === UserStatusEnum.ACTIVE ? 'Tạm khóa' : 'Kích hoạt'}
          </Button>
        </div>
      ),
    },
  ], [navigate]);

  return (
    <div className="space-y-6 font-sans">
      {/* Standardized Enterprise Page Header */}
      <AdminPageHeader
        title="Tài khoản Khách hàng"
        description="Quản lý danh sách tài khoản khách hàng, lịch sử chuyến bay đã đặt và quyền hoạt động."
        breadcrumbs={[{ label: 'Tài khoản Khách hàng' }]}
      />

      <EnterpriseDataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchPlaceholder="Tìm tên khách hàng hoặc email..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadCustomers}
      />
    </div>
  );
};
