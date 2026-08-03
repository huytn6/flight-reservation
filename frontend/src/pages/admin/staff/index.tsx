import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import type { AuthUser } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export const StaffListPage: React.FC = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStaff();
      setStaffList(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<AuthUser>[] = useMemo(() => [
    {
      accessorKey: 'full_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Staff Name" />,
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{row.original.full_name}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => (
        row.original.role === 'ADMIN' ? (
          <Badge className="bg-purple-50 text-purple-700 border border-purple-200">ADMIN</Badge>
        ) : (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200">STAFF</Badge>
        )
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/admin/staff/${row.original.id}/edit`)}
          className="w-7 h-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
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
            <UserCheck className="w-5 h-5 text-[#0065eb]" />
            Staff & Administrators
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage system administrative privileges, staff operator accounts, and roles.
          </p>
        </div>

        <Button
          onClick={() => navigate('/admin/staff/new')}
          className="bg-[#0065eb] hover:bg-blue-700 text-white text-xs font-semibold h-9 px-4 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Staff Account
        </Button>
      </div>

      <EnterpriseDataTable
        columns={columns}
        data={staffList}
        loading={loading}
        searchPlaceholder="Search staff name or email..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadStaff}
      />
    </div>
  );
};
