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
      toast.error('Please complete all required flight fields');
      return;
    }

    setLoading(true);
    try {
      await adminService.createFlight(formData);
      toast.success('Flight created successfully!');
      navigate('/admin/flights');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create flight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Create Flight Schedule"
      description="Set up a new flight route, departure schedule, and carrier information."
      backPath="/admin/flights"
      mode="create"
      submitText="Create Flight"
      loading={loading}
      onSubmit={handleSubmit}
    >
      <FlightForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
