import React, { useEffect, useState, useMemo } from 'react';
import { adminService } from '@/services/admin';
import { FileText } from 'lucide-react';
import { DataTable, DataTableColumnHeader } from '@/components/datatable';
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
      cell: ({ row }) => <span className="font-bold text-[#0065eb]">{row.getValue("action")}</span>,
    },
    {
      accessorKey: "resource",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Resource" />,
      cell: ({ row }) => <span className="font-semibold text-slate-700">{row.getValue("resource")}</span>,
    },
    {
      accessorKey: "resource_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Resource ID" />,
      cell: ({ row }) => <span className="font-mono text-slate-500">{row.getValue<string>("resource_id")?.substring(0, 8) || '-'}</span>,
    },
    {
      accessorKey: "ip_address",
      header: ({ column }) => <DataTableColumnHeader column={column} title="IP Address" />,
      cell: ({ row }) => <span className="text-slate-500">{row.getValue("ip_address") || '127.0.0.1'}</span>,
    },
  ], []);

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0065eb]" /> System Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Immutable trace log of security, authentication, and management actions.</p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-lg border-0 shadow-none">
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          onRefresh={loadAuditLogs}
          enableRowSelection={true}
          searchPlaceholder="Filter action, resource, IP address..."
        />
      </div>
    </div>
  );
};

