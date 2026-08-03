import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { CmsForm } from '../components/CmsForm';
import type { CmsFormData } from '../components/CmsForm';
import { toast } from 'sonner';

export const CmsCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CmsFormData>({
    key: '',
    title: '',
    body: '',
    is_published: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key || !formData.title || !formData.body) {
      toast.error('Vui lòng điền đầy đủ thông tin bài viết bắt buộc');
      return;
    }

    setLoading(true);
    try {
      await adminService.createContent({
        ...formData,
        is_published: formData.is_published ? 1 : 0,
      });
      toast.success('Tạo bài viết CMS thành công!');
      navigate('/admin/cms');
    } catch (err: any) {
      toast.error(err.message || 'Tạo bài viết CMS thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Thêm Bài Viết CMS Mới"
      description="Soạn thảo tin tức, bài viết hướng dẫn hoặc điều khoản chính sách."
      backPath="/admin/cms"
      mode="create"
      submitText="Tạo mới"
      breadcrumbs={[
        { label: 'Quản lý bài viết CMS', href: '/admin/cms' },
        { label: 'Thêm bài viết' },
      ]}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <CmsForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
