import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export const BookingsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getBookings();
      setBookings(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">CONFIRMED</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-50 text-amber-700 border border-amber-200">PENDING</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-50 text-red-700 border border-red-200">CANCELLED</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-purple-50 text-purple-700 border border-purple-200">REFUNDED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'pnr',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Booking PNR" />,
      cell: ({ row }) => (
        <Badge className="font-mono text-xs font-bold bg-blue-50 text-[#0065eb] border border-blue-200 px-2 py-0.5">
          {row.original.pnr || row.original.booking_reference || row.original.id?.substring(0, 8)}
        </Badge>
      ),
    },
    {
      accessorKey: 'customer_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Passenger / Customer" />,
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{row.original.customer_name || row.original.contact_name || 'Passenger'}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.original.contact_email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'total_amount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Price" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {Number(row.original.total_amount || 0).toLocaleString('vi-VN')} VND
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Booking Status" />,
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Booked Date" />,
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-slate-500">
          {row.original.created_at ? new Date(row.original.created_at).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/admin/bookings/${row.original.id}`)}
          className="w-7 h-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ], [navigate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Bookings & Reservations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit system bookings, manage passenger itineraries, payments, and refund requests.
          </p>
        </div>
      </div>

      <EnterpriseDataTable
        columns={columns}
        data={bookings}
        loading={loading}
        searchPlaceholder="Search PNR code, passenger name, email..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadBookings}
      />
    </div>
  );
};
