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
      const item = list.find((c: any) => c.id === id || c.key === id);
      if (item) {
        setFormData({
          key: item.key || '',
          title: item.title || '',
          body: item.body || '',
          is_published: Boolean(item.is_published),
        });
      } else {
        toast.error('CMS article not found');
        navigate('/admin/cms');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load CMS details');
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
      toast.success('CMS page updated successfully!');
      navigate('/admin/cms');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update CMS page');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading article details...</div>;
  }

  return (
    <AdminFormLayout
      title={`Edit CMS: ${formData.title}`}
      description="Update article content or toggle published state."
      backPath="/admin/cms"
      mode="edit"
      submitText="Update Article"
      loading={loading}
      onSubmit={handleSubmit}
    >
      <CmsForm formData={formData} setFormData={setFormData} mode="edit" />
    </AdminFormLayout>
  );
};
