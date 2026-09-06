import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { EnterpriseDataTable } from '@/components/datatable/EnterpriseDataTable';
import { DataTableColumnHeader } from '@/components/datatable';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2 } from 'lucide-react';
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
      toast.error(err.message || 'Không thể tải danh sách trang CMS');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteContent(deleteId);
      toast.success('Đã xóa bài viết CMS thành công');
      setDeleteId(null);
      loadContents();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa bài viết CMS');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'slug',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Đường Dẫn (Slug)" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/70 tracking-wider">
          {row.original.slug}
        </span>
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu Đề Trang" />,
      cell: ({ row }) => (
        <div className="font-semibold text-slate-900 text-xs">
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: 'is_published',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng Thái Đăng" />,
      cell: ({ row }) => (
        <StatusBadge type="content" value={row.original.is_published ? 'PUBLISHED' : 'DRAFT'} />
      ),
    },
    {
      id: 'actions',
      header: 'Thao Tác',
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
    <div className="space-y-6 font-sans">
      {/* Standardized Enterprise Page Header */}
      <AdminPageHeader
        title="Quản lý Nội dung CMS & Trang tĩnh"
        description="Quản lý các bài viết tin tức, điều khoản dịch vụ, hướng dẫn đặt vé và trang tĩnh."
        breadcrumbs={[{ label: 'Quản lý Nội dung CMS' }]}
        primaryAction={{
          label: 'Tạo Trang CMS Mới',
          onClick: () => navigate('/admin/cms/new'),
        }}
      />

      <EnterpriseDataTable
        columns={columns}
        data={contents}
        loading={loading}
        searchPlaceholder="Tìm tiêu đề trang hoặc slug đường dẫn..."
        enableGlobalFilter={true}
        enableRowSelection={true}
        onRefresh={loadContents}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Xóa Bài Viết CMS"
        description="Bạn có chắc chắn muốn xóa trang nội dung CMS này không?"
      />
    </div>
  );
};
