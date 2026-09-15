import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth';
import { toast } from 'sonner';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Mã token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không trùng khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
    } catch (err: any) {
      setError(err.message || 'Đặt lại mật khẩu thất bại.');
      toast.error(err.message || 'Đặt lại mật khẩu thất bại');
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
          onClick={() => navigate('/signin')}
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
          <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">UITAir</span>
        </Link>

        <div className="w-9" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 flex flex-col gap-6 my-auto">
        
        {success ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Mật Khẩu Đã Đổi Thành Công</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có thể sử dụng mật khẩu mới để đăng nhập vào tài khoản UITAir của mình ngay bây giờ.
            </p>
            <Button
              onClick={() => navigate('/signin')}
              className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs h-9.5 rounded-lg shadow-none mt-2 cursor-pointer"
            >
              Đăng nhập ngay
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center flex flex-col gap-1">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Đặt Lại Mật Khẩu Mới
              </h1>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-200/80 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <div className="space-y-1">
                <Label htmlFor="new_password" className="text-xs font-medium text-slate-700">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pl-9 text-xs h-9.5 border-slate-200/80 focus:border-[#0065eb]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirm_password" className="text-xs font-medium text-slate-700">
                  Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-9 text-xs h-9.5 border-slate-200/80 focus:border-[#0065eb]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !newPassword}
                className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-normal text-xs h-9.5 rounded-lg shadow-none cursor-pointer"
              >
                {loading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
              </Button>
            </form>
          </>
        )}

      </div>

      <div className="py-2 text-center text-[11px] text-slate-400 font-sans">
        © 2026 UITAir. Bản quyền thuộc về hệ thống đặt vé chuyến bay.
      </div>
    </div>
  );
};
