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

export const AirportsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAirports();
      setAirports(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách sân bay');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteAirport(deleteId);
      toast.success('Đã xóa sân bay thành công');
      setDeleteId(null);
      loadAirports();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa sân bay');
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tên Sân Bay" />,
      cell: ({ row }) => (
        <div className="font-medium text-slate-900 text-xs">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: 'city',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Địa Điểm / Thành Phố" />,
      cell: ({ row }) => (
        <div className="text-slate-600 text-xs">
          {row.original.city}, {row.original.country}
        </div>
      ),
    },
    {
      accessorKey: 'timezone',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Múi Giờ" />,
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-slate-500">
          {row.original.timezone || 'UTC'}
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
            onClick={() => navigate(`/admin/airports/${row.original.id}/edit`)}
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
        title="Danh mục Sân bay"
        description="Quản lý danh mục mã sân bay IATA toàn cầu, thành phố điểm đến, quốc gia và múi giờ."
        breadcrumbs={[{ label: 'Danh mục Sân bay' }]}
        primaryAction={{
          label: 'Thêm Sân Bay Mới',
          onClick: () => navigate('/admin/airports/new'),
        }}
      />

      {/* DataTable */}
      <EnterpriseDataTable
        columns={columns}
        data={airports}
        loading={loading}
        searchPlaceholder="Tìm tên sân bay, mã IATA, thành phố..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadAirports}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Xóa Sân Bay"
        description="Bạn có chắc chắn muốn xóa sân bay này không? Thao tác này có thể ảnh hưởng đến các chuyến bay gắn với sân bay này."
      />
    </div>
  );
};
