import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/use-auth';
import { userService } from '@/services/user';
import { authService } from '@/services/auth';
import type { ActiveSession, SavedPassenger } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, KeyRound, Monitor, Users, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'PASSWORD' | 'SESSIONS' | 'PASSENGERS'>('PROFILE');

  // Profile Form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Saved Passengers
  const [passengers, setPassengers] = useState<SavedPassenger[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Partial<SavedPassenger> | null>(null);
  const [savingPassenger, setSavingPassenger] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'SESSIONS') {
      loadSessions();
    } else if (activeTab === 'PASSENGERS') {
      loadPassengers();
    }
  }, [activeTab]);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await userService.getSessions();
      setSessions(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load active sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadPassengers = async () => {
    setLoadingPassengers(true);
    try {
      const res = await userService.getSavedPassengers();
      setPassengers(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load saved passengers');
    } finally {
      setLoadingPassengers(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await userService.updateProfile({ full_name: fullName, phone });
      if (user) {
        setUser({ ...user, full_name: fullName });
      }
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await authService.changePassword({ old_password: oldPassword, new_password: newPassword });
      toast.success('Password changed successfully. Please sign in again.');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await userService.revokeSession(id);
      toast.success('Session revoked');
      loadSessions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke session');
    }
  };

  const handleSavePassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPassenger?.full_name) return;
    setSavingPassenger(true);
    try {
      if (editingPassenger.id) {
        await userService.updateSavedPassenger(editingPassenger.id, editingPassenger);
        toast.success('Passenger updated');
      } else {
        await userService.addSavedPassenger(editingPassenger);
        toast.success('Passenger saved');
      }
      setEditingPassenger(null);
      loadPassengers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save passenger');
    } finally {
      setSavingPassenger(false);
    }
  };

  const handleDeletePassenger = async (id: string) => {
    try {
      await userService.deleteSavedPassenger(id);
      toast.success('Passenger deleted');
      loadPassengers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete passenger');
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8 border-b pb-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-bold text-2xl flex items-center justify-center">
          {user?.full_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{user?.full_name}</h1>
          <p className="text-sm text-slate-500">{user?.email} • <span className="uppercase text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{user?.role}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${activeTab === 'PROFILE' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
          >
            <User className="w-4 h-4" /> Personal Information
          </button>
          <button
            onClick={() => setActiveTab('PASSWORD')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${activeTab === 'PASSWORD' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
          >
            <KeyRound className="w-4 h-4" /> Change Password
          </button>
          <button
            onClick={() => setActiveTab('SESSIONS')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${activeTab === 'SESSIONS' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
          >
            <Monitor className="w-4 h-4" /> Active Sessions
          </button>
          <button
            onClick={() => setActiveTab('PASSENGERS')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${activeTab === 'PASSENGERS' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
          >
            <Users className="w-4 h-4" /> Saved Passengers
          </button>
        </div>

        {/* Tab Content */}
        <div className="md:col-span-3 bg-white p-6 rounded-2xl border shadow-sm">
          {activeTab === 'PROFILE' && (
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 max-w-lg">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Personal Information</h2>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
                <Input value={user?.email || ''} disabled className="bg-slate-50 text-slate-500 border-slate-200" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Phone Number</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+84 901 234 567" />
              </div>
              <Button type="submit" disabled={updatingProfile} className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-fit mt-2">
                {updatingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}

          {activeTab === 'PASSWORD' && (
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-lg">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Change Password</h2>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Old Password</label>
                <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">New Password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={changingPassword} className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-fit mt-2">
                {changingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}

          {activeTab === 'SESSIONS' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-900">Active Login Sessions</h2>
              {loadingSessions ? (
                <p className="text-sm text-slate-500">Loading sessions...</p>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-slate-500">No active sessions found.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {sessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{s.user_agent || 'Unknown Device'}</p>
                        <p className="text-xs text-slate-500">IP: {s.ip_address || '127.0.0.1'} • Created: {new Date(s.created_at).toLocaleString()}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleRevokeSession(s.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'PASSENGERS' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Saved Passengers</h2>
                <Button onClick={() => setEditingPassenger({ full_name: '', nationality: 'Vietnam' })} size="sm" className="bg-blue-600 text-white gap-1">
                  <Plus className="w-4 h-4" /> Add Passenger
                </Button>
              </div>

              {editingPassenger && (
                <form onSubmit={handleSavePassenger} className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-blue-900">{editingPassenger.id ? 'Edit Passenger' : 'Add New Passenger'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="Full Name" value={editingPassenger.full_name || ''} onChange={(e) => setEditingPassenger({ ...editingPassenger, full_name: e.target.value })} required />
                    <Input type="date" placeholder="Date of Birth" value={editingPassenger.date_of_birth || ''} onChange={(e) => setEditingPassenger({ ...editingPassenger, date_of_birth: e.target.value })} />
                    <Input placeholder="Nationality" value={editingPassenger.nationality || ''} onChange={(e) => setEditingPassenger({ ...editingPassenger, nationality: e.target.value })} />
                    <Input placeholder="Passport Number" value={editingPassenger.passport_number || ''} onChange={(e) => setEditingPassenger({ ...editingPassenger, passport_number: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Button type="submit" size="sm" disabled={savingPassenger} className="bg-blue-600 text-white">
                      <Check className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingPassenger(null)}>
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </form>
              )}

              {loadingPassengers ? (
                <p className="text-sm text-slate-500">Loading passengers...</p>
              ) : passengers.length === 0 ? (
                <p className="text-sm text-slate-500">No saved passengers yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {passengers.map((p) => (
                    <div key={p.id} className="p-4 bg-slate-50 rounded-xl border flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{p.full_name}</h4>
                        <p className="text-xs text-slate-500">DOB: {p.date_of_birth || 'N/A'}</p>
                        <p className="text-xs text-slate-500">Nationality: {p.nationality || 'N/A'}</p>
                        {p.passport_number && <p className="text-xs text-slate-500">Passport: {p.passport_number}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingPassenger(p)} className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-200">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeletePassenger(p.id)} className="p-1.5 text-slate-600 hover:text-red-600 rounded-lg hover:bg-slate-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
