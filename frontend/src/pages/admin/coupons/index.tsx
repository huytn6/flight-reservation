import React, { useEffect, useState, useMemo } from 'react';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableColumnHeader } from '@/components/datatable';
import type { ColumnDef } from '@tanstack/react-table';
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

  const couponColumns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Coupon Code" />,
      cell: ({ row }) => <span className="font-bold font-mono text-[#0065eb]">{row.getValue("code")}</span>,
    },
    {
      accessorKey: "discount_type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.getValue("discount_type")}</span>,
    },
    {
      accessorKey: "discount_value",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Discount Value" />,
      cell: ({ row }) => <span className="font-bold text-slate-900">{row.getValue<number>("discount_value")?.toLocaleString()}</span>,
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const active = row.getValue("is_active");
        return (
          <Badge variant="outline" className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
            active ? 'bg-blue-50 text-[#0065eb] border-blue-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {active ? 'Active' : 'Disabled'}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right font-semibold text-slate-700">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <button onClick={() => handleDeleteCoupon(row.original.id)} className="text-slate-400 hover:text-red-600 p-1 cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], []);

  const cmsColumns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: "slug",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Key / Slug" />,
      cell: ({ row }) => <span className="font-bold font-mono text-[#0065eb]">{row.original.slug || row.original.key}</span>,
    },
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => <span className="font-semibold text-slate-900">{row.getValue("title")}</span>,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
      cell: ({ row }) => <span className="text-slate-500">{new Date(row.getValue<string>("created_at")).toLocaleDateString()}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right font-semibold text-slate-700">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <button onClick={() => handleDeleteContent(row.original.id)} className="text-slate-400 hover:text-red-600 p-1 cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Coupons & Content Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Create discount promotional coupons and manage CMS website articles.</p>
        </div>

        <div className="flex bg-white p-1 rounded-md border border-slate-200 gap-1 text-xs font-semibold">
          <button
            onClick={() => setSubTab('COUPONS')}
            className={`px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              subTab === 'COUPONS' ? 'bg-[#0065eb] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Discount Coupons
          </button>
          <button
            onClick={() => setSubTab('CMS')}
            className={`px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              subTab === 'CMS' ? 'bg-[#0065eb] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            CMS Articles & Content
          </button>
        </div>
      </div>

      {subTab === 'COUPONS' ? (
        <form onSubmit={handleCreateCoupon} className="bg-white p-4 sm:p-5 rounded-lg border-0 shadow-none flex flex-col gap-3 max-w-2xl">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#0065eb]" /> Create Discount Coupon
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <Input placeholder="Code (SUMMER2026)" value={cpCode} onChange={(e) => setCpCode(e.target.value)} required className="text-xs uppercase font-mono bg-slate-50 border-slate-200" />
            <select value={cpType} onChange={(e) => setCpType(e.target.value as any)} className="text-xs p-2 border border-slate-200 rounded-md bg-slate-50 font-medium">
              <option value="FIXED">FIXED AMOUNT (VND)</option>
              <option value="PERCENT">PERCENTAGE (%)</option>
            </select>
            <Input type="number" placeholder="Value (100000)" value={cpValue} onChange={(e) => setCpValue(Number(e.target.value))} required className="text-xs bg-slate-50 border-slate-200" />
            <Input type="datetime-local" value={cpFrom} onChange={(e) => setCpFrom(e.target.value)} className="text-xs bg-slate-50 border-slate-200" required />
            <Input type="datetime-local" value={cpUntil} onChange={(e) => setCpUntil(e.target.value)} className="text-xs bg-slate-50 border-slate-200" required />
          </div>

          <Button type="submit" className="bg-[#0065eb] hover:bg-blue-700 text-white font-medium text-xs rounded-md w-fit px-5 cursor-pointer">Create Coupon</Button>
        </form>
      ) : (
        <form onSubmit={handleCreateContent} className="bg-white p-4 sm:p-5 rounded-lg border-0 shadow-none flex flex-col gap-3 max-w-2xl">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#0065eb]" /> Create CMS Article / Page
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Slug Key (e.g. promo-banner-1)" value={cmsKey} onChange={(e) => setCmsKey(e.target.value)} required className="text-xs font-mono bg-slate-50 border-slate-200" />
            <Input placeholder="Title" value={cmsTitle} onChange={(e) => setCmsTitle(e.target.value)} required className="text-xs bg-slate-50 border-slate-200" />
          </div>
          <textarea placeholder="Body content..." value={cmsBody} onChange={(e) => setCmsBody(e.target.value)} required className="w-full text-xs p-2 border border-slate-200 rounded-md h-24 bg-slate-50 focus:bg-white" />
          <Button type="submit" className="bg-[#0065eb] hover:bg-blue-700 text-white font-medium text-xs rounded-md w-fit px-5 cursor-pointer">Publish Content</Button>
        </form>
      )}

      {/* Main Enterprise Reusable DataTable */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border-0 shadow-none">
        <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-3">{subTab} Records</h2>

        {subTab === 'COUPONS' ? (
          <DataTable
            columns={couponColumns}
            data={coupons}
            loading={loading}
            onRefresh={loadData}
            enableRowSelection={true}
            searchPlaceholder="Search coupon code, discount type..."
          />
        ) : (
          <DataTable
            columns={cmsColumns}
            data={contents}
            loading={loading}
            onRefresh={loadData}
            enableRowSelection={true}
            searchPlaceholder="Search title, slug key..."
          />
        )}
      </div>
    </div>
  );
};

