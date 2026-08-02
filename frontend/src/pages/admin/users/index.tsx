import React, { useEffect, useState, useMemo } from 'react';
import { adminService } from '@/services/admin';
import type { AuthUser } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableColumnHeader } from '@/components/datatable';
import type { ColumnDef } from '@tanstack/react-table';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export const AdminUsers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'STAFF'>('CUSTOMERS');
  const [customers, setCustomers] = useState<AuthUser[]>([]);
  const [staffList, setStaffList] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Create staff modal form
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [creatingStaff, setCreatingStaff] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'CUSTOMERS') {
        const res = await adminService.getCustomers('');
        setCustomers(res.items || []);
      } else {
        const res = await adminService.getStaff();
        setStaffList(res.items || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomerStatus = async (userId: string, status: string) => {
    try {
      await adminService.updateCustomerStatus(userId, status);
      toast.success(`Customer status updated to ${status}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update customer status');
    }
  };

  const handleUpdateStaffRole = async (userId: string, role: string) => {
    try {
      await adminService.updateStaffRole(userId, role);
      toast.success(`Staff role updated to ${role}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update staff role');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingStaff(true);
    try {
      await adminService.createStaff({
        email: staffEmail,
        password: staffPassword,
        full_name: staffName,
        role: staffRole,
      });
      toast.success('Staff account created successfully!');
      setStaffEmail('');
      setStaffPassword('');
      setStaffName('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create staff');
    } finally {
      setCreatingStaff(false);
    }
  };

  const customerColumns: ColumnDef<AuthUser>[] = useMemo(() => [
    {
      accessorKey: "full_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-900">{row.original.full_name}</p>
          <p className="text-[11px] text-slate-500">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-[#0065eb] border-blue-200 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
          {row.getValue("role")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const st = row.original.status || 'ACTIVE';
        return (
          <Badge variant="outline" className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
            st === 'ACTIVE' ? 'bg-blue-50 text-[#0065eb] border-blue-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {st}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right font-semibold text-slate-700">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdateCustomerStatus(row.original.id, 'ACTIVE')}
            className="h-6 text-[10px] px-2 font-medium border-blue-200 bg-blue-50 text-[#0065eb] hover:bg-blue-100 cursor-pointer rounded-md"
          >
            Activate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdateCustomerStatus(row.original.id, 'BANNED')}
            className="h-6 text-[10px] px-2 font-medium border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer rounded-md"
          >
            Ban
          </Button>
        </div>
      ),
    },
  ], []);

  const staffColumns: ColumnDef<AuthUser>[] = useMemo(() => [
    {
      accessorKey: "full_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Staff Member" />,
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-900">{row.original.full_name}</p>
          <p className="text-[11px] text-slate-500">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-[#0065eb] border-blue-200 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
          {row.getValue("role")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-[#0065eb] border-blue-200 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
          {row.original.status || 'ACTIVE'}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right font-semibold text-slate-700">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdateStaffRole(row.original.id, row.original.role === 'ADMIN' ? 'STAFF' : 'ADMIN')}
            className="h-6 text-[10px] px-2 font-medium border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer rounded-md"
          >
            Toggle Role ({row.original.role === 'ADMIN' ? 'Make Staff' : 'Make Admin'})
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">User & Staff Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage customer accounts, register staff members, and configure access roles.</p>
        </div>

        <div className="flex bg-white p-1 rounded-md border border-slate-200 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CUSTOMERS')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'CUSTOMERS' ? 'bg-[#0065eb] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab('STAFF')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'STAFF' ? 'bg-[#0065eb] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Staff & Admins
          </button>
        </div>
      </div>

      {activeTab === 'STAFF' && (
        <form onSubmit={handleCreateStaff} className="bg-white p-4 sm:p-5 rounded-lg border-0 shadow-none flex flex-col gap-3 max-w-xl">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#0065eb]" /> Register New Staff Member
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input type="email" placeholder="Email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} required className="text-xs bg-slate-50 border-slate-200" />
            <Input type="password" placeholder="Password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} required className="text-xs bg-slate-50 border-slate-200" />
            <Input placeholder="Full Name" value={staffName} onChange={(e) => setStaffName(e.target.value)} required className="text-xs bg-slate-50 border-slate-200" />
            <Select value={staffRole} onValueChange={(val) => setStaffRole(val as any)}>
              <SelectTrigger className="text-xs font-medium bg-slate-50 border-slate-200">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STAFF">STAFF</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={creatingStaff} className="bg-[#0065eb] hover:bg-blue-700 text-white font-medium text-xs rounded-md w-fit px-5 cursor-pointer">
            {creatingStaff ? 'Creating...' : 'Create Account'}
          </Button>
        </form>
      )}

      {/* Main Enterprise Reusable DataTable */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border-0 shadow-none">
        <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-3">
          {activeTab === 'CUSTOMERS' ? 'Customer Accounts' : 'Staff Members'}
        </h2>

        {activeTab === 'CUSTOMERS' ? (
          <DataTable
            columns={customerColumns}
            data={customers}
            loading={loading}
            onRefresh={loadData}
            enableRowSelection={true}
            searchPlaceholder="Search customer name, email..."
            facetedFilters={[
              {
                columnId: "status",
                title: "Status",
                options: [
                  { label: "Active", value: "ACTIVE" },
                  { label: "Banned", value: "BANNED" },
                ],
              },
            ]}
          />
        ) : (
          <DataTable
            columns={staffColumns}
            data={staffList}
            loading={loading}
            onRefresh={loadData}
            enableRowSelection={true}
            searchPlaceholder="Search staff name, email..."
            facetedFilters={[
              {
                columnId: "role",
                title: "Role",
                options: [
                  { label: "Staff", value: "STAFF" },
                  { label: "Admin", value: "ADMIN" },
                ],
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};

