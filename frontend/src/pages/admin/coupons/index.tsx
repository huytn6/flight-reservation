import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const AdminCoupons: React.FC = () => {
  const [subTab, setSubTab] = useState<'COUPONS' | 'CMS'>('COUPONS');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Coupon form
  const [cpCode, setCpCode] = useState('');
  const [cpType, setCpType] = useState<'PERCENT' | 'FIXED'>('FIXED');
  const [cpValue, setCpValue] = useState(100000);
  const [cpFrom, setCpFrom] = useState('2026-01-01T00:00');
  const [cpUntil, setCpUntil] = useState('2026-12-31T23:59');

  // CMS Content form
  const [cmsKey, setCmsKey] = useState('');
  const [cmsTitle, setCmsTitle] = useState('');
  const [cmsBody, setCmsBody] = useState('');

  useEffect(() => {
    loadData();
  }, [subTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (subTab === 'COUPONS') {
        const res = await adminService.getCoupons();
        setCoupons(res || []);
      } else {
        const res = await adminService.getContents();
        setContents(res || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load marketing/content data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createCoupon({
        code: cpCode.toUpperCase(),
        discount_type: cpType,
        discount_value: cpValue,
        valid_from: cpFrom,
        valid_until: cpUntil,
      });
      toast.success('Coupon created!');
      setCpCode('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await adminService.deleteCoupon(id);
      toast.success('Coupon disabled');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to disable coupon');
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createContent({
        key: cmsKey,
        title: cmsTitle,
        body: cmsBody,
        is_published: 1,
      });
      toast.success('CMS article created!');
      setCmsKey('');
      setCmsTitle('');
      setCmsBody('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create CMS content');
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      await adminService.deleteContent(id);
      toast.success('Content deleted');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete content');
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coupons & Content Management</h1>
          <p className="text-xs text-slate-500">Create discount promotional coupons and manage CMS website articles.</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border gap-1 text-xs font-semibold">
          <button
            onClick={() => setSubTab('COUPONS')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              subTab === 'COUPONS' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Discount Coupons
          </button>
          <button
            onClick={() => setSubTab('CMS')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              subTab === 'CMS' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            CMS Articles & Content
          </button>
        </div>
      </div>

      {subTab === 'COUPONS' ? (
        <form onSubmit={handleCreateCoupon} className="bg-white p-5 rounded-2xl border shadow-xs flex flex-col gap-3 max-w-2xl">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" /> Create Discount Coupon
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <Input placeholder="Code (SUMMER2026)" value={cpCode} onChange={(e) => setCpCode(e.target.value)} required className="text-xs uppercase font-mono" />
            <select value={cpType} onChange={(e) => setCpType(e.target.value as any)} className="text-xs p-2 border rounded-xl bg-white font-semibold">
              <option value="FIXED">FIXED AMOUNT (VND)</option>
              <option value="PERCENT">PERCENTAGE (%)</option>
            </select>
            <Input type="number" placeholder="Value (100000)" value={cpValue} onChange={(e) => setCpValue(Number(e.target.value))} required className="text-xs" />
            <Input type="datetime-local" value={cpFrom} onChange={(e) => setCpFrom(e.target.value)} className="text-xs" required />
            <Input type="datetime-local" value={cpUntil} onChange={(e) => setCpUntil(e.target.value)} className="text-xs" required />
          </div>

          <Button type="submit" className="bg-emerald-600 text-white font-bold text-xs rounded-xl w-fit px-5">Create Coupon</Button>
        </form>
      ) : (
        <form onSubmit={handleCreateContent} className="bg-white p-5 rounded-2xl border shadow-xs flex flex-col gap-3 max-w-2xl">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" /> Create CMS Article / Page
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Slug Key (e.g. promo-banner-1)" value={cmsKey} onChange={(e) => setCmsKey(e.target.value)} required className="text-xs font-mono" />
            <Input placeholder="Title" value={cmsTitle} onChange={(e) => setCmsTitle(e.target.value)} required className="text-xs" />
          </div>
          <textarea placeholder="Body content..." value={cmsBody} onChange={(e) => setCmsBody(e.target.value)} required className="w-full text-xs p-2 border rounded-xl h-24" />
          <Button type="submit" className="bg-emerald-600 text-white font-bold text-xs rounded-xl w-fit px-5">Publish Content</Button>
        </form>
      )}

      {/* Main Table */}
      <div className="bg-white p-6 rounded-2xl border shadow-xs">
        <h2 className="text-base font-bold text-slate-900 border-b pb-3 mb-3">{subTab} Records</h2>

        {loading ? (
          <p className="text-xs text-slate-500">Loading records...</p>
        ) : (
          <div className="overflow-x-auto">
            {subTab === 'COUPONS' ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">Code</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Discount Value</th>
                    <th className="pb-2">Active</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold font-mono text-purple-700">{c.code}</td>
                      <td className="py-2.5 font-bold text-slate-700">{c.discount_type}</td>
                      <td className="py-2.5 font-bold text-emerald-700">{c.discount_value?.toLocaleString()}</td>
                      <td className="py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {c.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => handleDeleteCoupon(c.id)} className="text-slate-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">Key / Slug</th>
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Created At</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {contents.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-mono text-blue-700 font-bold">{item.slug || item.key}</td>
                      <td className="py-2.5 font-bold text-slate-900">{item.title}</td>
                      <td className="py-2.5 text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => handleDeleteContent(item.id)} className="text-slate-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
