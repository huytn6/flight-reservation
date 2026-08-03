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
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await adminService.createAircraftType(formData);
      toast.success('Aircraft type created successfully!');
      navigate('/admin/aircraft');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create aircraft type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Create Aircraft Type"
      description="Add a new aircraft specification to the fleet catalog."
      backPath="/admin/aircraft"
      mode="create"
      submitText="Create Aircraft"
      loading={loading}
      onSubmit={handleSubmit}
    >
      <AircraftForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
