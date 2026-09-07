import React, { useEffect, useState, useMemo } from 'react';
import { adminService } from '@/services/admin';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
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
      toast.error(err.message || 'Không thể tải nhật ký audit log');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Thời Gian Thao Tác" />,
      cell: ({ row }) => <span className="font-mono text-[11px] text-slate-500">{new Date(row.getValue<string>("created_at")).toLocaleString()}</span>,
    },
    {
      accessorKey: "user_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã Người Dùng" />,
      cell: ({ row }) => <span className="font-mono font-semibold text-slate-800">{row.getValue<string>("user_id")?.substring(0, 8) || 'HỆ THỐNG'}</span>,
    },
    {
      accessorKey: "action",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hành Động Thực Thi" />,
      cell: ({ row }) => (
        <StatusBadge
          type="auditAction"
          value={row.getValue<string>("action")}
        />
      ),
    },
    {
      accessorKey: "resource",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tài Nguyên Thao Tác" />,
      cell: ({ row }) => <span className="font-semibold text-slate-700 text-xs">{row.getValue("resource")}</span>,
    },
    {
      accessorKey: "resource_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã Tài Nguyên" />,
      cell: ({ row }) => <span className="font-mono text-[11px] text-slate-500">{row.getValue<string>("resource_id")?.substring(0, 8) || '-'}</span>,
    },
    {
      accessorKey: "ip_address",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Địa Chỉ IP" />,
      cell: ({ row }) => <span className="font-mono text-[11px] text-slate-500">{row.getValue("ip_address") || '127.0.0.1'}</span>,
    },
  ], []);

  return (
    <div className="space-y-6 font-sans">
      {/* Standardized Enterprise Page Header */}
      <AdminPageHeader
        title="Nhật ký Audit Log Hệ thống"
        description="Lưu vết lịch sử thao tác quản trị, truy cập dữ liệu và các hành động bảo mật hệ thống."
        breadcrumbs={[{ label: 'Nhật ký Hệ thống' }]}
      />

      <EnterpriseDataTable
        columns={columns}
        data={logs}
        loading={loading}
        onRefresh={loadAuditLogs}
        enableRowSelection={true}
        enableGlobalFilter={true}
        searchPlaceholder="Lọc hành động, tài nguyên, địa chỉ IP..."
      />
    </div>
  );
};
