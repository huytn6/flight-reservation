import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { AirlineForm } from '../components/AirlineForm';
import type { AirlineFormData } from '../components/AirlineForm';
import { toast } from 'sonner';

export const AirlineCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AirlineFormData>({
    iata_code: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.iata_code || !formData.name) {
      toast.error('Vui lòng điền đầy đủ tất cả thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      await adminService.createAirline(formData);
      toast.success('Thêm hãng hàng không thành công!');
      navigate('/admin/airlines');
    } catch (err: any) {
      toast.error(err.message || 'Thêm hãng hàng không thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Thêm Hãng Bay Mới"
      description="Đăng ký đối tác hãng hàng không mới vào cơ sở dữ liệu."
      backPath="/admin/airlines"
      mode="create"
      submitText="Tạo mới"
      breadcrumbs={[
        { label: 'Quản lý hãng bay', href: '/admin/airlines' },
        { label: 'Thêm hãng bay' },
      ]}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <AirlineForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
