import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/admin';
import { AdminFormLayout } from '@/components/admin/AdminFormLayout';
import { StaffForm } from '../components/StaffForm';
import type { StaffFormData } from '../components/StaffForm';
import { toast } from 'sonner';

export const StaffEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<StaffFormData>({
    email: '',
    full_name: '',
    role: 'STAFF',
  });

  useEffect(() => {
    if (id) loadStaff();
  }, [id]);

  const loadStaff = async () => {
    setFetching(true);
    try {
      if (id) {
        const res = await adminService.getStaffDetail(id);
        if (res) {
          setFormData({
            email: res.email || '',
            full_name: res.full_name || '',
            role: (res.role as any) || 'STAFF',
          });
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Tải thông tin nhân viên thất bại');
      navigate('/admin/staff');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await adminService.updateStaff(id, { full_name: formData.full_name });
      await adminService.updateStaffRole(id, formData.role);
      toast.success('Cập nhật tài khoản nhân viên thành công!');
      navigate('/admin/staff');
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật tài khoản nhân viên thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Đang tải thông tin nhân viên...</div>;
  }

  return (
    <AdminFormLayout
      title={`Chỉnh Sửa Tài Khoản Nhân Viên: ${formData.full_name}`}
      description="Cập nhật họ tên hoặc phân quyền hệ thống cho nhân viên."
      backPath="/admin/staff"
      mode="edit"
      submitText="Lưu thay đổi"
      breadcrumbs={[
        { label: 'Quản lý nhân viên', href: '/admin/staff' },
        { label: `Chỉnh sửa ${formData.full_name}` },
      ]}
      loading={loading}
      onSubmit={handleSubmit}
    >
      <StaffForm formData={formData} setFormData={setFormData} mode="edit" />
    </AdminFormLayout>
  );
};
