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
      toast.error('Vui lòng điền đầy đủ tất cả thông tin bắt buộc');
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
      toast.success('Tạo tài khoản nhân viên thành công!');
      navigate('/admin/staff');
    } catch (err: any) {
      toast.error(err.message || 'Tạo tài khoản nhân viên thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Thêm Tài Khoản Nhân Viên Mới"
      description="Cấp quyền quản trị hoặc vận hành cho thành viên mới trong hệ thống."
      backPath="/admin/staff"
      mode="create"
      submitText="Tạo mới"
      breadcrumbs={[
        { label: 'Quản lý nhân viên', href: '/admin/staff' },
        { label: 'Thêm nhân viên' },
      ]}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <StaffForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
