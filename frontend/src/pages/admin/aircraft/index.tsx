import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2, Plane } from 'lucide-react';
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
      toast.error(err.message || 'Failed to load aircraft types');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteAircraftType(deleteId);
      toast.success('Aircraft type deleted successfully');
      setDeleteId(null);
      loadAircraft();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete aircraft type');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type Code" />,
      cell: ({ row }) => (
        <Badge className="font-mono text-xs font-bold bg-sky-50 text-sky-600 border border-sky-200 px-2 py-0.5">
          {row.original.code}
        </Badge>
      ),
    },
    {
      accessorKey: 'model',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Model" />,
      cell: ({ row }) => (
        <div className="font-medium text-slate-900 text-xs">
          {row.original.model}
        </div>
      ),
    },
    {
      accessorKey: 'manufacturer',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Manufacturer" />,
      cell: ({ row }) => (
        <span className="text-slate-600 text-xs">{row.original.manufacturer}</span>
      ),
    },
    {
      accessorKey: 'capacity',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Seat Capacity" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          {row.original.capacity} seats
        </span>
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
            onClick={() => navigate(`/admin/aircraft/${row.original.id}/edit`)}
            className="w-7 h-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Plane className="w-5 h-5 text-sky-600" />
            Aircraft Fleet Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage fleet models, passenger seating capacities, and manufacturer specifications.
          </p>
        </div>

        <Button
          onClick={() => navigate('/admin/aircraft/new')}
          className="bg-[#0065eb] hover:bg-blue-700 text-white text-xs font-semibold h-9 px-4 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Aircraft Type
        </Button>
      </div>

      <EnterpriseDataTable
        columns={columns}
        data={aircraft}
        loading={loading}
        searchPlaceholder="Search model, code, manufacturer..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadAircraft}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Aircraft Type"
        description="Are you sure you want to delete this aircraft type?"
      />
    </div>
  );
};
