import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

export const BookingsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getBookings();
      setBookings(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách đơn đặt vé');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />Đã xác nhận</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60"><span className="w-1.5 h-1.5 rounded-full bg-amber-600" />Chờ thanh toán</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50/80 px-2 py-0.5 rounded-md border border-red-200/60"><span className="w-1.5 h-1.5 rounded-full bg-red-600" />Đã hủy</span>;
      case 'REFUNDED':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60"><span className="w-1.5 h-1.5 rounded-full bg-slate-500" />Đã hoàn tiền</span>;
      default:
        return <span className="text-xs text-slate-600">{status}</span>;
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'pnr',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã Đặt Chỗ (PNR)" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/70 tracking-wider">
          {row.original.pnr || row.original.booking_reference || row.original.id?.substring(0, 8)}
        </span>
      ),
    },
    {
      accessorKey: 'customer_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hành Khách / Người Đặt" />,
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{row.original.customer_name || row.original.contact_name || 'Hành khách'}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.original.contact_email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'total_amount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tổng Tiền Đơn Vé" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {Number(row.original.total_amount || 0).toLocaleString('vi-VN')} VND
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng Thái Đơn Vé" />,
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày Đặt" />,
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-slate-500">
          {row.original.created_at ? new Date(row.original.created_at).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Thao Tác',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/admin/bookings/${row.original.id}`)}
          className="w-7 h-7 text-slate-500 hover:text-[#0065eb] hover:bg-blue-50 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ], [navigate]);

  return (
    <div className="space-y-6 font-sans">
      {/* Standardized Enterprise Page Header */}
      <AdminPageHeader
        title="Quản lý Đặt vé & Đơn hàng"
        description="Tra cứu chi tiết mã PNR đặt chỗ, lịch trình hành khách, giao dịch thanh toán và trạng thái đơn vé."
        breadcrumbs={[{ label: 'Quản lý Đặt vé' }]}
      />

      <EnterpriseDataTable
        columns={columns}
        data={bookings}
        loading={loading}
        searchPlaceholder="Tìm mã PNR, tên hành khách, email..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadBookings}
      />
    </div>
  );
};
