import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { FlightForm } from '../components/FlightForm';
import type { FlightFormData } from '../components/FlightForm';
import { toast } from 'sonner';

export const FlightEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<FlightFormData>({
    flight_number: '',
    airline_id: '',
    departure_airport_id: '',
    arrival_airport_id: '',
    departure_time: '',
    arrival_time: '',
    status: 'SCHEDULED',
  });

  useEffect(() => {
    if (id) loadFlight();
  }, [id]);

  const loadFlight = async () => {
    setFetching(true);
    try {
      const fl = await adminService.getFlight(id!);
      if (fl) {
        setFormData({
          flight_number: fl.flight_number || '',
          airline_id: fl.airline_id || '',
          departure_airport_id: fl.departure_airport_id || '',
          arrival_airport_id: fl.arrival_airport_id || '',
          aircraft_type_id: fl.aircraft_type_id || '',
          departure_time: fl.departure_time ? fl.departure_time.substring(0, 16) : '',
          arrival_time: fl.arrival_time ? fl.arrival_time.substring(0, 16) : '',
          status: fl.status || 'SCHEDULED',
        });
      } else {
        toast.error('Không tìm thấy chuyến bay');
        navigate('/admin/flights');
      }
    } catch (err: any) {
      toast.error(err.message || 'Tải thông tin chuyến bay thất bại');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const durationMinutes = Math.round(
      (new Date(formData.arrival_time).getTime() - new Date(formData.departure_time).getTime()) / 60000
    );
    if (!(durationMinutes > 0)) {
      toast.error('Thời gian hạ cánh phải sau thời gian cất cánh');
      return;
    }

    setLoading(true);
    try {
      await adminService.updateFlight(id, { ...formData, duration_minutes: durationMinutes });
      toast.success('Cập nhật chuyến bay thành công!');
      navigate('/admin/flights');
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật chuyến bay thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Đang tải thông tin chuyến bay...</div>;
  }

  return (
    <AdminFormLayout
      title={`Chỉnh Sửa Chuyến Bay: ${formData.flight_number}`}
      description="Cập nhật giờ cất/hạ cánh, máy bay vận hành hoặc trạng thái chuyến bay."
      backPath="/admin/flights"
      mode="edit"
      submitText="Lưu thay đổi"
      breadcrumbs={[
        { label: 'Quản lý chuyến bay', href: '/admin/flights' },
        { label: `Chỉnh sửa ${formData.flight_number}` },
      ]}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <FlightForm formData={formData} setFormData={setFormData} mode="edit" />
    </AdminFormLayout>
  );
};
