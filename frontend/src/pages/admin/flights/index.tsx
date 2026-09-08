import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CodeBadge } from '@/components/common/CodeBadge';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2, Eye, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const FlightsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    setLoading(true);
    try {
      const res = await adminService.getFlights();
      setFlights(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách chuyến bay');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteFlight(deleteId);
      toast.success('Đã hủy lịch chuyến bay thành công');
      setDeleteId(null);
      loadFlights();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa chuyến bay');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'flight_number',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã Chuyến Bay" />,
      cell: ({ row }) => <CodeBadge>{row.original.flight_number}</CodeBadge>,
    },
    {
      accessorKey: 'airline',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hãng Bay" />,
      cell: ({ row }) => (
        <span className="font-medium text-slate-900 text-xs">
          {row.original.airline_name || row.original.airline_code || 'Hãng bay'}
        </span>
      ),
    },
    {
      id: 'route',
      header: 'Hành Trình',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <span>{row.original.departure_iata || 'SGN'}</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span>{row.original.arrival_iata || 'HAN'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'departure_time',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Giờ Khởi Hành" />,
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-slate-500">
          {row.original.departure_time ? new Date(row.original.departure_time).toLocaleString('vi-VN') : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng Thái" />,
      cell: ({ row }) => <StatusBadge type="flight" value={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Thao Tác',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/flights/${row.original.id}`)}
            className="w-7 h-7 text-slate-500 hover:text-[#0065eb] hover:bg-blue-50 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/flights/${row.original.id}/edit`)}
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
        title="Quản lý Chuyến bay & Lịch trình"
        description="Quản lý danh sách chuyến bay thương mại, lịch khởi hành, giá vé niêm yết và sơ đồ ghế."
        breadcrumbs={[{ label: 'Quản lý Chuyến bay' }]}
        primaryAction={{
          label: 'Tạo Chuyến Bay Mới',
          onClick: () => navigate('/admin/flights/new'),
        }}
      />

      <EnterpriseDataTable
        columns={columns}
        data={flights}
        loading={loading}
        searchPlaceholder="Tìm số hiệu chuyến bay, tuyến bay, hãng bay..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadFlights}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hủy Lịch Chuyến Bay"
        description="Bạn có chắc chắn muốn hủy và xóa chuyến bay này khỏi lịch trình không?"
      />
    </div>
  );
};
