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
      toast.error('Please fill in all required CMS fields');
      return;
    }

    setLoading(true);
    try {
      await adminService.createContent({
        ...formData,
        is_published: formData.is_published ? 1 : 0,
      });
      toast.success('CMS page created successfully!');
      navigate('/admin/cms');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create CMS page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Create CMS Article"
      description="Publish news, support articles, or system policies."
      backPath="/admin/cms"
      mode="create"
      submitText="Publish Article"
      loading={loading}
      onSubmit={handleSubmit}
    >
      <CmsForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
