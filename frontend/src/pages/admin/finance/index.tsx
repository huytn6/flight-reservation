import React, { useEffect, useState, useMemo } from 'react';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableColumnHeader } from '@/components/datatable';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

export const AdminFinance: React.FC = () => {
  const [subTab, setSubTab] = useState<'BOOKINGS' | 'PAYMENTS' | 'REFUNDS'>('BOOKINGS');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (subTab === 'BOOKINGS') {
        const res = await adminService.getBookings();
        setItems(res.items || []);
      } else if (subTab === 'PAYMENTS') {
        const res = await adminService.getPayments();
        setItems(res.items || []);
      } else {
        const res = await adminService.getRefunds();
        setItems(res.items || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      await adminService.updateBookingStatus(id, newStatus);
      toast.success(`Booking status changed to ${newStatus}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update booking status');
    }
  };

  const handleUpdatePaymentStatus = async (id: string, newStatus: string) => {
    try {
      await adminService.updatePaymentStatus(id, newStatus);
      toast.success(`Payment status changed to ${newStatus}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update payment status');
    }
  };

  const handleUpdateRefundStatus = async (id: string, newStatus: string) => {
    try {
      await adminService.updateRefundStatus(id, newStatus);
      toast.success(`Refund status changed to ${newStatus}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update refund status');
    }
  };

  const bookingColumns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: "pnr",
      header: ({ column }) => <DataTableColumnHeader column={column} title="PNR" />,
      cell: ({ row }) => <span className="font-bold font-mono text-[#0065eb]">{row.getValue("pnr")}</span>,
    },
    {
      accessorKey: "contact_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-900">{row.original.contact_name}</p>
          <p className="text-[11px] text-slate-500">{row.original.contact_email}</p>
        </div>
      ),
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Amount" />,
      cell: ({ row }) => <span className="font-bold text-slate-900">{row.getValue<number>("total_amount")?.toLocaleString()} VND</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-[#0065eb] border-blue-200 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right font-semibold text-slate-700">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdateBookingStatus(row.original.id, 'CONFIRMED')}
            className="h-6 text-[10px] px-2 font-medium border-blue-200 bg-blue-50 text-[#0065eb] hover:bg-blue-100 cursor-pointer rounded-md"
          >
            Confirm
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdateBookingStatus(row.original.id, 'CANCELLED')}
            className="h-6 text-[10px] px-2 font-medium border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer rounded-md"
          >
            Cancel
          </Button>
        </div>
      ),
    },
  ], []);

  const paymentColumns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Payment ID" />,
      cell: ({ row }) => <span className="font-mono text-slate-700">{row.getValue<string>("id")?.substring(0, 8)}...</span>,
    },
    {
      accessorKey: "payment_method",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Method" />,
      cell: ({ row }) => <span className="font-semibold text-slate-900">{row.getValue("payment_method")}</span>,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => <span className="font-bold text-[#0065eb]">{row.getValue<number>("amount")?.toLocaleString()} VND</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-[#0065eb] border-blue-200 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right font-semibold text-slate-700">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdatePaymentStatus(row.original.id, 'SUCCESS')}
            className="h-6 text-[10px] px-2 font-medium border-blue-200 bg-blue-50 text-[#0065eb] hover:bg-blue-100 cursor-pointer rounded-md"
          >
            Set Success
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdatePaymentStatus(row.original.id, 'FAILED')}
            className="h-6 text-[10px] px-2 font-medium border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer rounded-md"
          >
            Set Failed
          </Button>
        </div>
      ),
    },
  ], []);

  const refundColumns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Refund ID" />,
      cell: ({ row }) => <span className="font-mono text-slate-700">{row.getValue<string>("id")?.substring(0, 8)}...</span>,
    },
    {
      accessorKey: "booking_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Booking ID" />,
      cell: ({ row }) => <span className="font-mono text-slate-600">{row.getValue<string>("booking_id")?.substring(0, 8)}...</span>,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => <span className="font-bold text-red-600">{row.getValue<number>("amount")?.toLocaleString()} VND</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-[#0065eb] border-blue-200 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right font-semibold text-slate-700">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdateRefundStatus(row.original.id, 'APPROVED')}
            className="h-6 text-[10px] px-2 font-medium border-blue-200 bg-blue-50 text-[#0065eb] hover:bg-blue-100 cursor-pointer rounded-md"
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdateRefundStatus(row.original.id, 'REJECTED')}
            className="h-6 text-[10px] px-2 font-medium border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer rounded-md"
          >
            Reject
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Admin Bookings & Financial Control</h1>
          <p className="text-xs text-slate-500 mt-0.5">Monitor all system bookings, override payment status, and process refund requests.</p>
        </div>

        <div className="flex bg-white p-1 rounded-md border border-slate-200 gap-1 text-xs font-semibold">
          {['BOOKINGS', 'PAYMENTS', 'REFUNDS'].map((t) => (
            <button
              key={t}
              onClick={() => setSubTab(t as any)}
              className={`px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                subTab === t ? 'bg-[#0065eb] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-lg border-0 shadow-none">
        <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-3">{subTab} Records</h2>

        {subTab === 'BOOKINGS' && (
          <DataTable
            columns={bookingColumns}
            data={items}
            loading={loading}
            onRefresh={loadData}
            enableRowSelection={true}
            searchPlaceholder="Search PNR, contact name, email..."
          />
        )}

        {subTab === 'PAYMENTS' && (
          <DataTable
            columns={paymentColumns}
            data={items}
            loading={loading}
            onRefresh={loadData}
            enableRowSelection={true}
            searchPlaceholder="Search payment ID, method..."
          />
        )}

        {subTab === 'REFUNDS' && (
          <DataTable
            columns={refundColumns}
            data={items}
            loading={loading}
            onRefresh={loadData}
            enableRowSelection={true}
            searchPlaceholder="Search refund ID, booking ID..."
          />
        )}
      </div>
    </div>
  );
};

