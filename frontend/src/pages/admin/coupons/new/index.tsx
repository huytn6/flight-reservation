import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { CouponForm } from '../components/CouponForm';
import type { CouponFormData } from '../components/CouponForm';
import { toast } from 'sonner';

export const CouponCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    discount_type: 'FIXED',
    discount_value: 100000,
    valid_from: '2026-01-01T00:00',
    valid_until: '2026-12-31T23:59',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_value) {
      toast.error('Please fill in all required coupon fields');
      return;
    }

    setLoading(true);
    try {
      await adminService.createCoupon(formData);
      toast.success('Coupon created successfully!');
      navigate('/admin/coupons');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Create Discount Coupon"
      description="Issue a new promotional voucher code for customer checkout discounts."
      backPath="/admin/coupons"
      mode="create"
      submitText="Create Coupon"
      loading={loading}
      onSubmit={handleSubmit}
    >
      <CouponForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
