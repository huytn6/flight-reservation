import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { AirlineForm } from '../components/AirlineForm';
import type { AirlineFormData } from '../components/AirlineForm';
import { toast } from 'sonner';

export const AirlineEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<AirlineFormData>({
    iata_code: '',
    name: '',
  });

  useEffect(() => {
    if (id) loadAirline();
  }, [id]);

  const loadAirline = async () => {
    setFetching(true);
    try {
      const list = await adminService.getAirlines();
      const airline = list.find((a: any) => a.id === id || a.iata_code === id);
      if (airline) {
        setFormData({
          iata_code: airline.iata_code || '',
          name: airline.name || '',
        });
      } else {
        toast.error('Không tìm thấy thông tin hãng bay');
        navigate('/admin/airlines');
      }
    } catch (err: any) {
      toast.error(err.message || 'Tải thông tin hãng bay thất bại');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await adminService.updateAirline(id, formData);
      toast.success('Cập nhật hãng bay thành công!');
      navigate('/admin/airlines');
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật hãng bay thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Đang tải thông tin hãng bay...</div>;
  }

  return (
    <AdminFormLayout
      title={`Chỉnh Sửa Hãng Bay: ${formData.name}`}
      description="Cập nhật thông tin nhận diện đối tác hãng hàng không."
      backPath="/admin/airlines"
      mode="edit"
      submitText="Lưu thay đổi"
      breadcrumbs={[
        { label: 'Quản lý hãng bay', href: '/admin/airlines' },
        { label: `Chỉnh sửa ${formData.iata_code || formData.name}` },
      ]}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <AirlineForm formData={formData} setFormData={setFormData} mode="edit" />
    </AdminFormLayout>
  );
};
