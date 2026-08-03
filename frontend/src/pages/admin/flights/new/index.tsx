import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { FlightForm } from '../components/FlightForm';
import type { FlightFormData } from '../components/FlightForm';
import { toast } from 'sonner';

export const FlightCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FlightFormData>({
    flight_number: '',
    airline_id: '',
    departure_airport_id: '',
    arrival_airport_id: '',
    departure_time: '2026-08-20T08:00',
    arrival_time: '2026-08-20T10:15',
    status: 'SCHEDULED',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.flight_number || !formData.airline_id || !formData.departure_airport_id || !formData.arrival_airport_id) {
      toast.error('Vui lòng điền đầy đủ tất cả thông tin chuyến bay bắt buộc');
      return;
    }

    setLoading(true);
    try {
      await adminService.createFlight(formData);
      toast.success('Tạo chuyến bay mới thành công!');
      navigate('/admin/flights');
    } catch (err: any) {
      toast.error(err.message || 'Tạo chuyến bay thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Thêm Lịch Khởi Hành Chuyến Bay"
      description="Thiết lập hành trình bay mới, lịch cất/hạ cánh và phân công hãng bay."
      backPath="/admin/flights"
      mode="create"
      submitText="Tạo mới"
      breadcrumbs={[
        { label: 'Quản lý chuyến bay', href: '/admin/flights' },
        { label: 'Thêm chuyến bay' },
      ]}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <FlightForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
