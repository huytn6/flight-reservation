import React, { useEffect, useState, useMemo } from 'react';
import { adminService } from '@/services/admin';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

export const AdminAudit: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs();
      setLogs(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Timestamp" />,
      cell: ({ row }) => <span className="font-mono text-[11px] text-slate-500">{new Date(row.getValue<string>("created_at")).toLocaleString()}</span>,
    },
    {
      accessorKey: "user_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="User ID" />,
      cell: ({ row }) => <span className="font-mono font-semibold text-slate-800">{row.getValue<string>("user_id")?.substring(0, 8) || 'SYSTEM'}</span>,
    },
    {
      accessorKey: "action",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/70 tracking-wider">
          {row.getValue("action")}
        </span>
      ),
    },
    {
      accessorKey: "resource",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Resource" />,
      cell: ({ row }) => <span className="font-semibold text-slate-700 text-xs">{row.getValue("resource")}</span>,
    },
    {
      accessorKey: "resource_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Resource ID" />,
      cell: ({ row }) => <span className="font-mono text-[11px] text-slate-500">{row.getValue<string>("resource_id")?.substring(0, 8) || '-'}</span>,
    },
    {
      accessorKey: "ip_address",
      header: ({ column }) => <DataTableColumnHeader column={column} title="IP Address" />,
      cell: ({ row }) => <span className="font-mono text-[11px] text-slate-500">{row.getValue("ip_address") || '127.0.0.1'}</span>,
    },
  ], []);

  return (
    <div className="space-y-6 font-sans">
      {/* Standardized Enterprise Page Header */}
      <AdminPageHeader
        title="System Audit Logs"
        description="Immutable security trail logging system operations, administrative changes, and user activities."
        breadcrumbs={[{ label: 'System Audit Logs' }]}
      />

      <EnterpriseDataTable
        columns={columns}
        data={logs}
        loading={loading}
        onRefresh={loadAuditLogs}
        enableRowSelection={true}
        enableGlobalFilter={true}
        searchPlaceholder="Filter action, resource, IP address..."
      />
    </div>
  );
};
