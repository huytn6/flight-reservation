import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import type { AuthUser } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export const StaffListPage: React.FC = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStaff();
      setStaffList(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<AuthUser>[] = useMemo(() => [
    {
      accessorKey: 'full_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Họ và Tên Nhân Viên" />,
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{row.original.full_name}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vai Trò Quyền Hạn" />,
      cell: ({ row }) => (
        row.original.role === 'ADMIN' ? (
          <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/60">QUẢN TRỊ VIÊN (ADMIN)</span>
        ) : (
          <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">NHÂN VIÊN (STAFF)</span>
        )
      ),
    },
    {
      id: 'actions',
      header: 'Thao Tác',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/admin/staff/${row.original.id}/edit`)}
          className="w-7 h-7 text-slate-500 hover:text-[#0065eb] hover:bg-blue-50 cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ], [navigate]);

  return (
    <div className="space-y-6 font-sans">
      {/* Standardized Enterprise Page Header */}
      <AdminPageHeader
        title="Quản lý Nhân viên & Quản trị viên"
        description="Quản lý danh sách tài khoản nhân viên vận hành, cấp quyền truy cập và vai trò hệ thống."
        breadcrumbs={[{ label: 'Tài khoản Nhân viên' }]}
        primaryAction={{
          label: 'Thêm Nhân Viên Mới',
          onClick: () => navigate('/admin/staff/new'),
        }}
      />

      <EnterpriseDataTable
        columns={columns}
        data={staffList}
        loading={loading}
        searchPlaceholder="Tìm tên nhân viên hoặc email..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadStaff}
      />
    </div>
  );
};
