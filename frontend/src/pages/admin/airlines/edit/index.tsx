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
        toast.error('Airline not found');
        navigate('/admin/airlines');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load airline details');
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
      toast.success('Airline updated successfully!');
      navigate('/admin/airlines');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update airline');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading airline details...</div>;
  }

  return (
    <AdminFormLayout
      title={`Edit Airline: ${formData.name}`}
      description="Update airline profile details and metadata."
      backPath="/admin/airlines"
      mode="edit"
      submitText="Update Airline"
      loading={loading}
      onSubmit={handleSubmit}
    >
      <AirlineForm formData={formData} setFormData={setFormData} mode="edit" />
    </AdminFormLayout>
  );
};
