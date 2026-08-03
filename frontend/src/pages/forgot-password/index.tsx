import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth';
import { toast } from 'sonner';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
      toast.success('Yêu cầu đặt lại mật khẩu đã được gửi!');
    } catch (err: any) {
      toast.error(err.message || 'Gửi yêu cầu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col items-center justify-between p-4 sm:p-6 font-sans">
      
      {/* Top Header Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full hover:bg-slate-200/60 transition-colors text-slate-700 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#0065eb] flex items-center justify-center rounded-md font-bold text-white">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">Expedia</span>
        </Link>

        <div className="w-9" />
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 flex flex-col gap-6 my-auto">
        
        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Kiểm Tra Email Của Bạn</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu tới địa chỉ <span className="font-mono font-semibold text-slate-700">{email}</span>. Vui lòng kiểm tra hộp thư.
            </p>
            <Button
              onClick={() => navigate('/signin')}
              className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs h-9.5 rounded-lg shadow-none mt-2"
            >
              Quay lại trang Đăng nhập
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center flex flex-col gap-1">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Quên Mật Khẩu?
              </h1>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu mới.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                  Địa chỉ Email tài khoản <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 text-xs h-9.5 border-slate-200/80 focus:border-[#0065eb]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs h-9.5 rounded-lg shadow-none cursor-pointer"
              >
                {loading ? 'Đang gửi yêu cầu...' : 'Gửi Liên Kết Đặt Lại Mật Khẩu'}
              </Button>
            </form>

            <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
              Nhớ mật khẩu?{' '}
              <Link to="/signin" className="text-[#0065eb] font-medium hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </>
        )}

      </div>

      <div className="py-2 text-center text-[11px] text-slate-400 font-sans">
        © 2026 Expedia, Inc. Bản quyền thuộc về hệ thống đặt vé chuyến bay.
      </div>
    </div>
  );
};
