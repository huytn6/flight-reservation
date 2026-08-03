import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2 } from 'lucide-react';
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
      toast.error(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteCoupon(deleteId);
      toast.success('Coupon disabled successfully');
      setDeleteId(null);
      loadCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Failed to disable coupon');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Promo Code" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/70 tracking-wider">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'discount_type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[11px]">
          {row.original.discount_type}
        </Badge>
      ),
    },
    {
      accessorKey: 'discount_value',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {row.original.discount_type === 'PERCENT'
            ? `${row.original.discount_value}% OFF`
            : `${Number(row.original.discount_value).toLocaleString('vi-VN')} VND`}
        </span>
      ),
    },
    {
      id: 'validity',
      header: 'Valid Period',
      cell: ({ row }) => (
        <div className="text-[11px] text-slate-500 font-mono">
          <span>{row.original.valid_from?.substring(0, 10)}</span>
          <span className="mx-1.5">→</span>
          <span>{row.original.valid_until?.substring(0, 10)}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Coupons & Promotions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage promotional discount vouchers, percent discounts, and validity periods.
          </p>
        </div>

        <Button
          onClick={() => navigate('/admin/coupons/new')}
          className="bg-[#0065eb] hover:bg-blue-700 text-white text-xs font-semibold h-9 px-4 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </div>

      <EnterpriseDataTable
        columns={columns}
        data={coupons}
        loading={loading}
        searchPlaceholder="Search promo code..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadCoupons}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Disable Coupon Code"
        description="Are you sure you want to deactivate this promotional coupon?"
      />
    </div>
  );
};
