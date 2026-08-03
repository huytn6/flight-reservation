import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { AirportForm } from '../components/AirportForm';
import type { AirportFormData } from '../components/AirportForm';
import { toast } from 'sonner';

export const AirportEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<AirportFormData>({
    iata_code: '',
    name: '',
    city: '',
    country: 'Vietnam',
    country_code: 'VN',
    timezone: 'Asia/Ho_Chi_Minh',
  });

  useEffect(() => {
    if (id) {
      loadAirport();
    }
  }, [id]);

  const loadAirport = async () => {
    setFetching(true);
    try {
      const list = await adminService.getAirports();
      const airport = list.find((a: any) => a.id === id || a.iata_code === id);
      if (airport) {
        setFormData({
          iata_code: airport.iata_code || '',
          name: airport.name || '',
          city: airport.city || '',
          country: airport.country || 'Vietnam',
          country_code: airport.country_code || 'VN',
          timezone: airport.timezone || 'Asia/Ho_Chi_Minh',
        });
      } else {
        toast.error('Airport not found');
        navigate('/admin/airports');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load airport details');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await adminService.updateAirport(id, formData);
      toast.success('Airport updated successfully!');
      navigate('/admin/airports');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update airport');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading airport details...</div>;
  }

  return (
    <AdminFormLayout
      title={`Edit Airport: ${formData.iata_code}`}
      description="Update location details, name, or timezone settings for this airport."
      backPath="/admin/airports"
      mode="edit"
      submitText="Update Airport"
      loading={loading}
      onSubmit={handleSubmit}
    >
      <AirportForm formData={formData} setFormData={setFormData} mode="edit" />
    </AdminFormLayout>
  );
};
