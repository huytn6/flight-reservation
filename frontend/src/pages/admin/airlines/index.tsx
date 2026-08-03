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
      toast.error(err.message || 'Failed to load airlines');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteAirline(deleteId);
      toast.success('Airline deleted successfully');
      setDeleteId(null);
      loadAirlines();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete airline');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'iata_code',
      header: ({ column }) => <DataTableColumnHeader column={column} title="IATA Code" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/70 tracking-wider">
          {row.original.iata_code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Airline Name" />,
      cell: ({ row }) => (
        <div className="font-medium text-slate-900 text-xs">
          {row.original.name}
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
        title="Airlines Catalog"
        description="Manage partner carrier airlines, logos, and 2-letter IATA prefixes."
        breadcrumbs={[{ label: 'Airlines Catalog' }]}
        primaryAction={{
          label: 'Add New Airline',
          onClick: () => navigate('/admin/airlines/new'),
        }}
      />

      <EnterpriseDataTable
        columns={columns}
        data={airlines}
        loading={loading}
        searchPlaceholder="Search airline name or IATA code..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadAirlines}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Airline"
        description="Are you sure you want to delete this airline from the system catalog?"
      />
    </div>
  );
};
