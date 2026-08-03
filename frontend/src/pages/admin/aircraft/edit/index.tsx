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
        toast.error('Aircraft type not found');
        navigate('/admin/aircraft');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load aircraft details');
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
      toast.success('Aircraft type updated successfully!');
      navigate('/admin/aircraft');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update aircraft type');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading aircraft details...</div>;
  }

  return (
    <AdminFormLayout
      title={`Edit Aircraft: ${formData.code}`}
      description="Update aircraft capacity and model specifications."
      backPath="/admin/aircraft"
      mode="edit"
      submitText="Update Aircraft"
      loading={loading}
      onSubmit={handleSubmit}
    >
      <AircraftForm formData={formData} setFormData={setFormData} mode="edit" />
    </AdminFormLayout>
  );
};
