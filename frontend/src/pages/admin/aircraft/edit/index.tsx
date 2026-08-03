import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { AircraftForm } from '../components/AircraftForm';
import type { AircraftFormData } from '../components/AircraftForm';
import { toast } from 'sonner';

export const AircraftEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<AircraftFormData>({
    code: '',
    model: '',
    manufacturer: '',
    capacity: 0,
  });

  useEffect(() => {
    if (id) loadAircraft();
  }, [id]);

  const loadAircraft = async () => {
    setFetching(true);
    try {
      const list = await adminService.getAircraftTypes();
      const item = list.find((a: any) => a.id === id || a.code === id);
      if (item) {
        setFormData({
          code: item.code || '',
          model: item.model || '',
          manufacturer: item.manufacturer || '',
          capacity: item.capacity || 0,
        });
      } else {
        toast.error('Không tìm thấy thông tin loại máy bay');
        navigate('/admin/aircraft');
      }
    } catch (err: any) {
      toast.error(err.message || 'Tải thông tin loại máy bay thất bại');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await adminService.updateAircraftType(id, formData);
      toast.success('Cập nhật dòng máy bay thành công!');
      navigate('/admin/aircraft');
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật dòng máy bay thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Đang tải thông tin dòng máy bay...</div>;
  }

  return (
    <AdminFormLayout
      title={`Chỉnh Sửa Dòng Máy Bay: ${formData.code}`}
      description="Cập nhật thông tin chi tiết kỹ thuật và sức chứa ghế ngồi."
      backPath="/admin/aircraft"
      mode="edit"
      submitText="Lưu thay đổi"
      breadcrumbs={[
        { label: 'Quản lý tàu bay', href: '/admin/aircraft' },
        { label: `Chỉnh sửa ${formData.code}` },
      ]}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <AircraftForm formData={formData} setFormData={setFormData} mode="edit" />
    </AdminFormLayout>
  );
};
