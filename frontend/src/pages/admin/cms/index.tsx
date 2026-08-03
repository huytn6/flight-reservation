import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const CmsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    setLoading(true);
    try {
      const res = await adminService.getContents();
      setContents(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load CMS contents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteContent(deleteId);
      toast.success('CMS article deleted successfully');
      setDeleteId(null);
      loadContents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete CMS content');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'key',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Slug Key" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/70 tracking-wider">
          {row.original.key}
        </span>
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => (
        <div className="font-semibold text-slate-900 text-xs">
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: 'is_published',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Publish Status" />,
      cell: ({ row }) => (
        row.original.is_published ? (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
            Published
          </Badge>
        ) : (
          <Badge variant="outline" className="text-slate-500 text-xs">
            Draft
          </Badge>
        )
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/cms/${row.original.id}/edit`)}
            className="w-7 h-7 text-slate-500 hover:text-[#0065eb] hover:bg-blue-50 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(row.original.id)}
            className="w-7 h-7 text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ], [navigate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            CMS Content & Pages
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage storefront articles, terms of service, support guides, and dynamic copy.
          </p>
        </div>

        <Button
          onClick={() => navigate('/admin/cms/new')}
          className="bg-[#0065eb] hover:bg-blue-700 text-white text-xs font-semibold h-9 px-4 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create CMS Page
        </Button>
      </div>

      <EnterpriseDataTable
        columns={columns}
        data={contents}
        loading={loading}
        searchPlaceholder="Search article title or key..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadContents}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete CMS Article"
        description="Are you sure you want to delete this CMS content page?"
      />
    </div>
  );
};
