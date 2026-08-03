import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
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

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/60"><span className="w-1.5 h-1.5 rounded-full bg-blue-600" />Đã lên lịch</span>;
      case 'BOARDING':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />Đang lên máy bay</span>;
      case 'DEPARTED':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/60"><span className="w-1.5 h-1.5 rounded-full bg-blue-600" />Đang bay</span>;
      case 'ARRIVED':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Đã hạ cánh</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50/80 px-2 py-0.5 rounded-md border border-red-200/60"><span className="w-1.5 h-1.5 rounded-full bg-red-600" />Đã hủy</span>;
      case 'DELAYED':
        return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60"><span className="w-1.5 h-1.5 rounded-full bg-amber-600" />Bị trễ</span>;
      default:
        return <span className="text-xs text-slate-600">{status || 'Đã lên lịch'}</span>;
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'flight_number',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã Chuyến Bay" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/70 tracking-wider">
          {row.original.flight_number}
        </span>
      ),
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
        <span className="font-mono text-[11px] text-slate-600">
          {row.original.departure_time ? new Date(row.original.departure_time).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng Thái" />,
      cell: ({ row }) => getStatusBadge(row.original.status),
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
