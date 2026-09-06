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

export const AircraftListPage: React.FC = () => {
  const navigate = useNavigate();
  const [aircraft, setAircraft] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAircraft();
  }, []);

  const loadAircraft = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAircraftTypes();
      setAircraft(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách loại máy bay');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteAircraftType(deleteId);
      toast.success('Đã xóa loại máy bay thành công');
      setDeleteId(null);
      loadAircraft();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa loại máy bay');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'iata_code',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã Loại" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/70 tracking-wider">
          {row.original.iata_code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Dòng Máy Bay" />,
      cell: ({ row }) => (
        <div className="font-medium text-slate-900 text-xs">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: 'manufacturer',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nhà Sản Xuất" />,
      cell: ({ row }) => (
        <span className="text-slate-600 text-xs">{row.original.manufacturer}</span>
      ),
    },
    {
      accessorKey: 'seat_capacity',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Số Lượng Ghế" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          {row.original.seat_capacity} ghế
        </span>
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
            onClick={() => navigate(`/admin/aircraft/${row.original.id}/edit`)}
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
        title="Quản lý Đội tàu bay"
        description="Quản lý thông tin dòng máy bay, sơ đồ sức chứa ghế hành khách và thông số nhà sản xuất."
        breadcrumbs={[{ label: 'Đội tàu bay' }]}
        primaryAction={{
          label: 'Thêm Loại Máy Bay',
          onClick: () => navigate('/admin/aircraft/new'),
        }}
      />

      <EnterpriseDataTable
        columns={columns}
        data={aircraft}
        loading={loading}
        searchPlaceholder="Tìm dòng máy bay, mã loại, nhà sản xuất..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadAircraft}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Xóa Loại Máy Bay"
        description="Bạn có chắc chắn muốn xóa dòng máy bay này khỏi đội tàu bay không?"
      />
    </div>
  );
};
