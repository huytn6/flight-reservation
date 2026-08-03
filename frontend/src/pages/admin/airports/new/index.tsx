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
    country: 'Vietnam',
    country_code: 'VN',
    timezone: 'Asia/Ho_Chi_Minh',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.iata_code || !formData.name || !formData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await adminService.createAirport(formData);
      toast.success('Airport created successfully!');
      navigate('/admin/airports');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create airport');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Create New Airport"
      description="Add a new airport entry to the global flight catalog database."
      backPath="/admin/airports"
      mode="create"
      submitText="Create Airport"
      loading={loading}
      onSubmit={handleSubmit}
    >
      <AirportForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
