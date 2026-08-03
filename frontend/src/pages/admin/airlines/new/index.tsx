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
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await adminService.createAirline(formData);
      toast.success('Airline created successfully!');
      navigate('/admin/airlines');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create airline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Create New Airline"
      description="Register a new airline partner into the flight catalog database."
      backPath="/admin/airlines"
      mode="create"
      submitText="Create Airline"
      loading={loading}
      onSubmit={handleSubmit}
    >
      <AirlineForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
