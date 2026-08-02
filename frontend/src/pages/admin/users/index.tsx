import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import type { AuthUser } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

        <div className="flex bg-white p-1 rounded-xl border gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CUSTOMERS')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'CUSTOMERS' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab('STAFF')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'STAFF' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Staff & Admins
          </button>
        </div>
      </div>

      {activeTab === 'STAFF' && (
        <form onSubmit={handleCreateStaff} className="bg-white p-5 rounded-2xl border shadow-xs flex flex-col gap-3 max-w-xl">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-600" /> Register New Staff Member
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input type="email" placeholder="Email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} required className="text-xs" />
            <Input type="password" placeholder="Password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} required className="text-xs" />
            <Input placeholder="Full Name" value={staffName} onChange={(e) => setStaffName(e.target.value)} required className="text-xs" />
            <select value={staffRole} onChange={(e) => setStaffRole(e.target.value as any)} className="text-xs p-2 border rounded-xl bg-white font-semibold">
              <option value="STAFF">STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <Button type="submit" disabled={creatingStaff} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl w-fit px-5">
            {creatingStaff ? 'Creating...' : 'Create Account'}
          </Button>
        </form>
      )}

      {/* Main Table */}
      <div className="bg-white p-6 rounded-2xl border shadow-xs">
        <h2 className="text-base font-bold text-slate-900 border-b pb-3 mb-3">
          {activeTab === 'CUSTOMERS' ? 'Customer Accounts' : 'Staff Members'}
        </h2>

        {loading ? (
          <p className="text-xs text-slate-500">Loading user records...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-slate-500 uppercase font-bold text-[10px]">
                  <th className="pb-2">User</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(activeTab === 'CUSTOMERS' ? customers : staffList).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3">
                      <p className="font-bold text-slate-900">{u.full_name}</p>
                      <p className="text-slate-500 text-[11px]">{u.email}</p>
                    </td>
                    <td className="py-3">
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {activeTab === 'CUSTOMERS' ? (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleUpdateCustomerStatus(u.id, 'ACTIVE')}
                            className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded"
                          >
                            Activate
                          </button>
                          <button
                            onClick={() => handleUpdateCustomerStatus(u.id, 'BANNED')}
                            className="px-2 py-1 text-[10px] font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded"
                          >
                            Ban
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleUpdateStaffRole(u.id, u.role === 'ADMIN' ? 'STAFF' : 'ADMIN')}
                            className="px-2 py-1 text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded"
                          >
                            Toggle Role ({u.role === 'ADMIN' ? 'Make Staff' : 'Make Admin'})
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
