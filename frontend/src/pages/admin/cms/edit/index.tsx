import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { CmsForm } from '../components/CmsForm';
import type { CmsFormData } from '../components/CmsForm';
import { toast } from 'sonner';

export const CmsEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<CmsFormData>({
    key: '',
    title: '',
    body: '',
    is_published: true,
  });

  useEffect(() => {
    if (id) loadContent();
  }, [id]);

  const loadContent = async () => {
    setFetching(true);
    try {
      const list = await adminService.getContents();
      const item = list.find((c: any) => c.id === id || c.slug === id);
      if (item) {
        setFormData({
          key: item.slug || '',
          title: item.title || '',
          body: item.body || '',
          is_published: Boolean(item.is_published),
        });
      } else {
        toast.error('Không tìm thấy bài viết CMS');
        navigate('/admin/cms');
      }
    } catch (err: any) {
      toast.error(err.message || 'Tải thông tin bài viết CMS thất bại');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await adminService.updateContent(id, {
        ...formData,
        is_published: formData.is_published ? 1 : 0,
      });
      toast.success('Cập nhật bài viết CMS thành công!');
      navigate('/admin/cms');
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật bài viết CMS thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Đang tải thông tin bài viết...</div>;
  }

  return (
    <AdminFormLayout
      title={`Chỉnh Sửa Bài Viết CMS: ${formData.title}`}
      description="Cập nhật nội dung chi tiết hoặc bật/tắt trạng thái xuất bản."
      backPath="/admin/cms"
      mode="edit"
      submitText="Lưu thay đổi"
      breadcrumbs={[
        { label: 'Quản lý bài viết CMS', href: '/admin/cms' },
        { label: `Chỉnh sửa ${formData.key}` },
      ]}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <CmsForm formData={formData} setFormData={setFormData} mode="edit" />
    </AdminFormLayout>
  );
};
