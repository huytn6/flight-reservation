import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import { FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [resourceFilter, setResourceFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs(resourceFilter);
      setLogs(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAuditLogs();
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" /> System Audit Logs
          </h1>
          <p className="text-xs text-slate-500">Immutable trace log of security, authentication, and management actions.</p>
        </div>

        <form onSubmit={handleFilterSubmit} className="flex gap-2">
          <Input
            placeholder="Filter resource (e.g. users, bookings)"
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="text-xs bg-white w-56"
          />
          <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1">
            <Search className="w-3.5 h-3.5" /> Filter
          </Button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-xs">
        {loading ? (
          <p className="text-xs text-slate-500">Loading audit logs...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-slate-500 font-bold uppercase text-[10px]">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">User ID</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Resource</th>
                  <th className="pb-2">Resource ID</th>
                  <th className="pb-2">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono text-[11px] text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="py-2.5 font-mono font-semibold text-slate-800">{log.user_id?.substring(0, 8) || 'SYSTEM'}</td>
                    <td className="py-2.5 font-bold text-emerald-700">{log.action}</td>
                    <td className="py-2.5 font-semibold text-slate-700">{log.resource}</td>
                    <td className="py-2.5 font-mono text-slate-500">{log.resource_id?.substring(0, 8) || '-'}</td>
                    <td className="py-2.5 text-slate-500">{log.ip_address || '127.0.0.1'}</td>
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
