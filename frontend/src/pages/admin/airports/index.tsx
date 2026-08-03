import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2, MapPin, Building2 } from 'lucide-react';
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
      toast.error(err.message || 'Failed to load airports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteAirport(deleteId);
      toast.success('Airport deleted successfully');
      setDeleteId(null);
      loadAirports();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete airport');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'iata_code',
      header: ({ column }) => <DataTableColumnHeader column={column} title="IATA Code" />,
      cell: ({ row }) => (
        <Badge className="font-mono text-xs font-bold bg-blue-50 text-[#0065eb] border border-blue-200 px-2 py-0.5">
          {row.original.iata_code}
        </Badge>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Airport Name" />,
      cell: ({ row }) => (
        <div className="font-medium text-slate-900 text-xs">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: 'city',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{row.original.city}, {row.original.country}</span>
        </div>
      ),
    },
    {
      accessorKey: 'timezone',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Timezone" />,
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-slate-500">
          {row.original.timezone || 'UTC'}
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
            onClick={() => navigate(`/admin/airports/${row.original.id}/edit`)}
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0065eb]" />
            Airports Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage global airport catalog, IATA location codes, and timezones.
          </p>
        </div>

        <Button
          onClick={() => navigate('/admin/airports/new')}
          className="bg-[#0065eb] hover:bg-blue-700 text-white text-xs font-semibold h-9 px-4 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add New Airport
        </Button>
      </div>

      {/* DataTable */}
      <EnterpriseDataTable
        columns={columns}
        data={airports}
        loading={loading}
        searchPlaceholder="Search airport name, IATA code, city..."
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
        title="Delete Airport"
        description="Are you sure you want to delete this airport? This may affect flights associated with this airport."
      />
    </div>
  );
};
