import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import type { AuthUser } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

export const CustomersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCustomers('');
      setCustomers(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: AuthUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminService.updateCustomerStatus(user.id, nextStatus);
      toast.success(`Customer status updated to ${nextStatus}`);
      loadCustomers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update customer status');
    }
  };

  const columns: ColumnDef<AuthUser>[] = useMemo(() => [
    {
      accessorKey: 'full_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer Name" />,
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{row.original.full_name}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Account Status" />,
      cell: ({ row }) => (
        row.original.status === 'ACTIVE' ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50/80 px-2 py-0.5 rounded-md border border-red-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Suspended
          </span>
        )
      ),
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Registered On" />,
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-slate-500">
          {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/customers/${row.original.id}`)}
            className="w-7 h-7 text-slate-500 hover:text-[#0065eb] hover:bg-blue-50 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(row.original)}
            className={`h-7 text-[11px] font-medium px-2.5 cursor-pointer ${
              row.original.status === 'ACTIVE'
                ? 'text-red-600 hover:bg-red-50 border-red-200'
                : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
            }`}
          >
            {row.original.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Registered Customers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View registered traveler profiles, booking histories, and account status controls.
          </p>
        </div>
      </div>

      <EnterpriseDataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchPlaceholder="Search customer name or email..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadCustomers}
      />
    </div>
  );
};
