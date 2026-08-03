import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const CouponsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCoupons();
      setCoupons(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteCoupon(deleteId);
      toast.success('Đã tạm ngừng mã giảm giá thành công');
      setDeleteId(null);
      loadCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạm ngừng mã giảm giá');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã Ưu Đãi" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/70 tracking-wider">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'discount_type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Loại Giảm Giá" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[11px] font-normal border-slate-200 text-slate-600">
          {row.original.discount_type === 'PERCENT' ? 'Phần trăm (%)' : 'Số tiền cố định'}
        </Badge>
      ),
    },
    {
      accessorKey: 'discount_value',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Giá Trị Giảm" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {row.original.discount_type === 'PERCENT'
            ? `GIẢM ${row.original.discount_value}%`
            : `${Number(row.original.discount_value).toLocaleString('vi-VN')} VND`}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng Thái" />,
      cell: ({ row }) => <StatusBadge type="coupon" value={row.original.status || 'ACTIVE'} />,
    },
    {
      id: 'validity',
      header: 'Thời Gian Hiệu Lực',
      cell: ({ row }) => (
        <div className="text-[11px] text-slate-500 font-mono">
          <span>{row.original.valid_from?.substring(0, 10)}</span>
          <span className="mx-1.5 text-slate-400">→</span>
          <span>{row.original.valid_until?.substring(0, 10)}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Thao Tác',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/coupons/${row.original.id}/edit`)}
            className="w-7 h-7 text-slate-500 hover:text-[#0065eb] hover:bg-blue-50 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(row.original.id)}
            className="w-7 h-7 text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ], [navigate]);

  return (
    <div className="space-y-6 font-sans">
      {/* Standardized Enterprise Page Header */}
      <AdminPageHeader
        title="Quản lý Mã giảm giá & Khuyến mãi"
        description="Quản lý các chương trình voucher ưu đãi, giá trị phần trăm giảm và thời hạn áp dụng."
        breadcrumbs={[{ label: 'Mã giảm giá' }]}
        primaryAction={{
          label: 'Tạo Mã Giảm Giá',
          onClick: () => navigate('/admin/coupons/new'),
        }}
      />

      <EnterpriseDataTable
        columns={columns}
        data={coupons}
        loading={loading}
        searchPlaceholder="Tìm mã ưu đãi khuyến mãi..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadCoupons}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Tạm Ngừng Mã Giảm Giá"
        description="Bạn có chắc chắn muốn vô hiệu hóa mã ưu đãi khuyến mãi này không?"
      />
    </div>
  );
};
