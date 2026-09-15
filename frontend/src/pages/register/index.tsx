import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/use-auth';
import { toast } from 'sonner';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!agreed) {
      toast.error('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không trùng khớp.');
      toast.error('Mật khẩu nhập lại không trùng khớp.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có độ dài tối thiểu 6 ký tự.');
      toast.error('Mật khẩu quá ngắn.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authService.register({
        email,
        password,
        full_name: fullName,
      });

      toast.success('Đăng ký tài khoản thành công! Tự động đăng nhập...');
      
      // Auto login after registration
      const res = await authService.login({ email, password });
      setAuth(res.user, res.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      toast.error(err.message || 'Đăng ký thất bại');
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
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#0065eb] flex items-center justify-center rounded-md font-bold text-white">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">UITAir</span>
        </Link>

        <div className="w-9" />
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-[440px] bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 flex flex-col gap-5 my-auto">
        
        {/* Card Header Title */}
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tạo Tài Khoản Mới
          </h1>
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            Đăng ký để tích điểm thưởng và quản lý lịch trình chuyến bay dễ dàng.
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-200/80 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
          <div className="space-y-1">
            <Label htmlFor="full_name" className="text-xs font-medium text-slate-700">
              Họ và tên <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                id="full_name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="pl-9 text-xs h-9.5 border-slate-200/80 focus:border-[#0065eb]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-medium text-slate-700">
              Địa chỉ Email <span className="text-rose-500">*</span>
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

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-medium text-slate-700">
              Mật khẩu <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                id="password"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9 text-xs h-9.5 border-slate-200/80 focus:border-[#0065eb]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm_password" className="text-xs font-medium text-slate-700">
              Xác nhận mật khẩu <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                id="confirm_password"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-9 text-xs h-9.5 border-slate-200/80 focus:border-[#0065eb]"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              id="terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-[#0065eb] focus:ring-[#0065eb] cursor-pointer"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-500 leading-tight cursor-pointer">
              Tôi đồng ý với <Link to="/pages/terms" className="text-[#0065eb] hover:underline">Điều khoản dịch vụ</Link> và <Link to="/pages/privacy" className="text-[#0065eb] hover:underline">Chính sách bảo mật</Link> của UITAir.
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs py-2.5 rounded-lg transition-colors mt-2 cursor-pointer h-9.5 shadow-none"
          >
            {loading ? 'Đang khởi tạo tài khoản...' : 'Đăng Ký Tài Khoản'}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Đã có tài khoản?{' '}
          <Link to="/signin" className="text-[#0065eb] font-medium hover:underline">
            Đăng nhập ngay
          </Link>
        </div>

      </div>

      {/* Footer */}
      <div className="py-2 text-center text-[11px] text-slate-400 font-sans">
        © 2026 UITAir. Bản quyền thuộc về hệ thống đặt vé chuyến bay.
      </div>
    </div>
  );
};
