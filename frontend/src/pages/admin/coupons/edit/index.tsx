import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { CouponForm } from '../components/CouponForm';
import type { CouponFormData } from '../components/CouponForm';
import { toast } from 'sonner';

export const CouponEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    discount_type: 'FIXED',
    discount_value: 0,
    valid_from: '',
    valid_until: '',
  });

  useEffect(() => {
    if (id) loadCoupon();
  }, [id]);

  const loadCoupon = async () => {
    setFetching(true);
    try {
      const list = await adminService.getCoupons();
      const cp = list.find((c: any) => c.id === id || c.code === id);
      if (cp) {
        setFormData({
          code: cp.code || '',
          discount_type: cp.discount_type || 'FIXED',
          discount_value: cp.discount_value || 0,
          valid_from: cp.valid_from ? cp.valid_from.substring(0, 16) : '',
          valid_until: cp.valid_until ? cp.valid_until.substring(0, 16) : '',
        });
      } else {
        toast.error('Coupon not found');
        navigate('/admin/coupons');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load coupon details');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await adminService.updateCoupon(id, formData);
      toast.success('Coupon updated successfully!');
      navigate('/admin/coupons');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update coupon');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading coupon details...</div>;
  }

  return (
    <AdminFormLayout
      title={`Edit Coupon: ${formData.code}`}
      description="Update discount rate, type, or expiration dates."
      backPath="/admin/coupons"
      mode="edit"
      submitText="Update Coupon"
      loading={loading}
      onSubmit={handleSubmit}
    >
      <CouponForm formData={formData} setFormData={setFormData} mode="edit" />
    </AdminFormLayout>
  );
};
