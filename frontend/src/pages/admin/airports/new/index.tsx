import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { AirportForm } from '../components/AirportForm';
import type { AirportFormData } from '../components/AirportForm';
import { toast } from 'sonner';

export const AirportCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AirportFormData>({
    iata_code: '',
    name: '',
    city: '',
    country: 'Việt Nam',
    country_code: 'VN',
    timezone: 'Asia/Ho_Chi_Minh',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.iata_code || !formData.name || !formData.city) {
      toast.error('Vui lòng điền đầy đủ tất cả thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      await adminService.createAirport(formData);
      toast.success('Thêm sân bay thành công!');
      navigate('/admin/airports');
    } catch (err: any) {
      toast.error(err.message || 'Thêm sân bay thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Thêm Sân Bay Mới"
      description="Nhập đầy đủ thông tin kỹ thuật và chuẩn dữ liệu sân bay."
      backPath="/admin/airports"
      mode="create"
      submitText="Tạo mới"
      breadcrumbs={[
        { label: 'Quản lý sân bay', href: '/admin/airports' },
        { label: 'Thêm sân bay' },
      ]}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <AirportForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
