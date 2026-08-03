import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { StaffForm } from '../components/StaffForm';
import type { StaffFormData } from '../components/StaffForm';
import { toast } from 'sonner';

export const StaffCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    email: '',
    password: '',
    full_name: '',
    role: 'STAFF',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.full_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await adminService.createStaff({
        email: formData.email,
        password: formData.password!,
        full_name: formData.full_name,
        role: formData.role,
      });
      toast.success('Staff account created successfully!');
      navigate('/admin/staff');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create staff account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Create Staff Account"
      description="Grant administrative or operational support access to a new team member."
      backPath="/admin/staff"
      mode="create"
      submitText="Create Account"
      loading={loading}
      onSubmit={handleSubmit}
    >
      <StaffForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
