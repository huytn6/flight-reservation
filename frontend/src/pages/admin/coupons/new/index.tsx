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
      toast.error('Vui lòng điền đầy đủ thông tin mã giảm giá bắt buộc');
      return;
    }

    setLoading(true);
    try {
      await adminService.createCoupon(formData);
      toast.success('Tạo mã giảm giá thành công!');
      navigate('/admin/coupons');
    } catch (err: any) {
      toast.error(err.message || 'Tạo mã giảm giá thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayout
      title="Thêm Mã Giảm Giá Mới"
      description="Phát hành mã voucher khuyến mãi ưu đãi cho khách hàng khi đặt vé."
      backPath="/admin/coupons"
      mode="create"
      submitText="Tạo mới"
      breadcrumbs={[
        { label: 'Quản lý mã giảm giá', href: '/admin/coupons' },
        { label: 'Thêm mã giảm giá' },
      ]}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <CouponForm formData={formData} setFormData={setFormData} mode="create" />
    </AdminFormLayout>
  );
};
