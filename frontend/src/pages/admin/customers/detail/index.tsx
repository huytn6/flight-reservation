import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/admin';
import type { AuthUser } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const CustomerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      if (id) {
        const res = await adminService.getCustomer(id);
        setCustomer(res);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading customer details...</div>;
  }

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-600">Customer profile not found.</p>
        <Button size="sm" onClick={() => navigate('/admin/customers')}>Back to Customers</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/admin/customers')}
        className="text-xs text-slate-600 hover:text-slate-900 bg-white border-slate-200 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
        Back to Customers
      </Button>

      <Card className="bg-[#fff] border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/60 p-6 border-b border-slate-200/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-[#0065eb] rounded-full flex items-center justify-center font-bold text-sm">
                {customer.full_name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  {customer.full_name}
                </CardTitle>
                <p className="text-xs text-slate-500 font-mono">{customer.email}</p>
              </div>
            </div>

            <Badge className={customer.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}>
              {customer.status || 'ACTIVE'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Email
              </span>
              <p className="font-semibold text-slate-800 text-sm font-mono">{customer.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> System Role
              </span>
              <p className="font-semibold text-slate-800 text-sm">{customer.role || 'CUSTOMER'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
