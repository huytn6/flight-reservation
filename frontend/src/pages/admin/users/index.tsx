import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import type { AuthUser } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User & Staff Management</h1>
          <p className="text-xs text-slate-500">Manage customer accounts, register staff members, and configure access roles.</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CUSTOMERS')}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'CUSTOMERS' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab('STAFF')}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'STAFF' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Staff & Admins
          </button>
        </div>
      </div>

      {activeTab === 'STAFF' && (
        <form onSubmit={handleCreateStaff} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-3 max-w-xl">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-600" /> Register New Staff Member
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input type="email" placeholder="Email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} required className="text-xs" />
            <Input type="password" placeholder="Password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} required className="text-xs" />
            <Input placeholder="Full Name" value={staffName} onChange={(e) => setStaffName(e.target.value)} required className="text-xs" />
            <Select value={staffRole} onValueChange={(val) => setStaffRole(val as any)}>
              <SelectTrigger className="text-xs font-semibold">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STAFF">STAFF</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={creatingStaff} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl w-fit px-5 cursor-pointer">
            {creatingStaff ? 'Creating...' : 'Create Account'}
          </Button>
        </form>
      )}

      {/* Main Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 mb-3">
          {activeTab === 'CUSTOMERS' ? 'Customer Accounts' : 'Staff Members'}
        </h2>

        {loading ? (
          <p className="text-xs text-slate-500">Loading user records...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(activeTab === 'CUSTOMERS' ? customers : staffList).map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50 text-xs border-b border-slate-100">
                  <TableCell className="py-3">
                    <p className="font-bold text-slate-900">{u.full_name}</p>
                    <p className="text-slate-500 text-[11px]">{u.email}</p>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold uppercase text-[10px]">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="outline" className={`font-bold text-[10px] ${
                      u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      {u.status || 'ACTIVE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    {activeTab === 'CUSTOMERS' ? (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleUpdateCustomerStatus(u.id, 'ACTIVE')}
                          className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => handleUpdateCustomerStatus(u.id, 'BANNED')}
                          className="px-2 py-1 text-[10px] font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 cursor-pointer"
                        >
                          Ban
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleUpdateStaffRole(u.id, u.role === 'ADMIN' ? 'STAFF' : 'ADMIN')}
                          className="px-2 py-1 text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded border border-purple-200 cursor-pointer"
                        >
                          Toggle Role ({u.role === 'ADMIN' ? 'Make Staff' : 'Make Admin'})
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
