import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2, Eye, Plane, ArrowRight } from 'lucide-react';
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
      toast.error(err.message || 'Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteFlight(deleteId);
      toast.success('Flight deleted successfully');
      setDeleteId(null);
      loadFlights();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete flight');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
        return <Badge className="bg-blue-50 text-blue-700 border border-blue-200">Scheduled</Badge>;
      case 'BOARDING':
        return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">Boarding</Badge>;
      case 'DEPARTED':
        return <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200">In Flight</Badge>;
      case 'ARRIVED':
        return <Badge className="bg-slate-100 text-slate-700 border border-slate-200">Arrived</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-50 text-red-700 border border-red-200">Cancelled</Badge>;
      case 'DELAYED':
        return <Badge className="bg-amber-50 text-amber-700 border border-amber-200">Delayed</Badge>;
      default:
        return <Badge variant="outline">{status || 'SCHEDULED'}</Badge>;
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'flight_number',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Flight #" />,
      cell: ({ row }) => (
        <Badge className="font-mono text-xs font-bold bg-blue-50 text-[#0065eb] border border-blue-200 px-2 py-0.5">
          {row.original.flight_number}
        </Badge>
      ),
    },
    {
      accessorKey: 'airline',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Airline" />,
      cell: ({ row }) => (
        <span className="font-medium text-slate-900 text-xs">
          {row.original.airline_name || row.original.airline_code || 'Carrier'}
        </span>
      ),
    },
    {
      id: 'route',
      header: 'Route',
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Departure Time" />,
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-slate-600">
          {row.original.departure_time ? new Date(row.original.departure_time).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/flights/${row.original.id}`)}
            className="w-7 h-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/flights/${row.original.id}/edit`)}
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
            <Plane className="w-5 h-5 text-[#0065eb]" />
            Flights Catalog & Schedules
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage active commercial flights, departure schedules, fares, and seat maps.
          </p>
        </div>

        <Button
          onClick={() => navigate('/admin/flights/new')}
          className="bg-[#0065eb] hover:bg-blue-700 text-white text-xs font-semibold h-9 px-4 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create Flight
        </Button>
      </div>

      <EnterpriseDataTable
        columns={columns}
        data={flights}
        loading={loading}
        searchPlaceholder="Search flight number, route, airline..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadFlights}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Flight Schedule"
        description="Are you sure you want to cancel and delete this flight? Passengers with active bookings will be notified."
      />
    </div>
  );
};
