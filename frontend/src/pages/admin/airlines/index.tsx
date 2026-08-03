import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const AirlinesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [airlines, setAirlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAirlines();
  }, []);

  const loadAirlines = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAirlines();
      setAirlines(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách hãng bay');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteAirline(deleteId);
      toast.success('Đã xóa hãng bay thành công');
      setDeleteId(null);
      loadAirlines();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa hãng bay');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'iata_code',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã IATA" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/70 tracking-wider">
          {row.original.iata_code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tên Hãng Bay" />,
      cell: ({ row }) => (
        <div className="font-medium text-slate-900 text-xs">
          {row.original.name}
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
            onClick={() => navigate(`/admin/airlines/${row.original.id}/edit`)}
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
        title="Danh mục Hãng bay"
        description="Quản lý danh sách hãng hàng không đối tác, logo đại diện và mã tiền tố 2 ký tự IATA."
        breadcrumbs={[{ label: 'Danh mục Hãng bay' }]}
        primaryAction={{
          label: 'Thêm Hãng Bay Mới',
          onClick: () => navigate('/admin/airlines/new'),
        }}
      />

      <EnterpriseDataTable
        columns={columns}
        data={airlines}
        loading={loading}
        searchPlaceholder="Tìm tên hãng bay hoặc mã IATA..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadAirlines}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Xóa Hãng Bay"
        description="Bạn có chắc chắn muốn xóa hãng bay này khỏi danh mục hệ thống không?"
      />
    </div>
  );
};
