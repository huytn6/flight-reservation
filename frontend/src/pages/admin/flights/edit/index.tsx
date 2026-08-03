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
      const res = await adminService.getFlights();
      const fl = (res.items || []).find((f: any) => f.id === id || f.flight_number === id);
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
        toast.error('Flight not found');
        navigate('/admin/flights');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load flight details');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await adminService.updateFlight(id, formData);
      toast.success('Flight updated successfully!');
      navigate('/admin/flights');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update flight');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading flight details...</div>;
  }

  return (
    <AdminFormLayout
      title={`Edit Flight: ${formData.flight_number}`}
      description="Update departure times, assigned aircraft, or flight operational status."
      backPath="/admin/flights"
      mode="edit"
      submitText="Update Flight"
      loading={loading}
      onSubmit={handleSubmit}
    >
      <FlightForm formData={formData} setFormData={setFormData} mode="edit" />
    </AdminFormLayout>
  );
};
