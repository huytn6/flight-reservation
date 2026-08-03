import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { AircraftForm } from '../components/AircraftForm';
import type { AircraftFormData } from '../components/AircraftForm';
import { toast } from 'sonner';

export const AircraftCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AircraftFormData>({
    code: '',
    model: '',
    manufacturer: 'Airbus',
    capacity: 180,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.model || !formData.capacity) {
      toast.error('Vui lòng điền đầy đủ tất cả thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      await adminService.createAircraftType(formData);
      toast.success('Thêm loại máy bay thành công!');
      navigate('/admin/aircraft');
    } catch (err: any) {
      toast.error(err.message || 'Thêm loại máy bay thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Thêm Dòng Máy Bay Mới"
      description="Nhập đầy đủ thông tin kỹ thuật và sức chứa ghế để lưu vào danh mục tàu bay."
      backPath="/admin/aircraft"
      mode="create"
      submitText="Tạo mới"
      breadcrumbs={[
        { label: 'Quản lý tàu bay', href: '/admin/aircraft' },
        { label: 'Thêm dòng máy bay' },
      ]}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <AircraftForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
