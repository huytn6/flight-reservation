import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/use-auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface SignInFormProps {
  onSubmitEmail?: (email: string) => void;
}

export const SignInForm: React.FC<SignInFormProps> = () => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const handleFillDemo = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setMode('LOGIN');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        const res = await authService.login({ email, password });
        setAuth(res.user, res.token);
        toast.success(`Welcome back, ${res.user.full_name}!`);

        if (returnUrl) {
          navigate(decodeURIComponent(returnUrl));
        } else if (res.user.role === 'ADMIN') {
          navigate('/admin');
        } else if (res.user.role === 'STAFF') {
          navigate('/staff');
        } else {
          navigate('/');
        }
      } else if (mode === 'REGISTER') {
        await authService.register({ email, password, full_name: fullName });
        toast.success('Registration successful! Logging you in...');
        const res = await authService.login({ email, password });
        setAuth(res.user, res.token);
        navigate(returnUrl ? decodeURIComponent(returnUrl) : '/');
      } else if (mode === 'FORGOT') {
        await authService.forgotPassword(email);
        toast.info('Reset instructions sent to your email (simulated)');
        setMode('LOGIN');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Mode Switcher */}
      <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => { setMode('LOGIN'); setError(null); }}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            mode === 'LOGIN' ? 'bg-white shadow-[0_2px_8px_rgb(0,0,0,0.04)] text-[#0065eb] font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('REGISTER'); setError(null); }}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            mode === 'REGISTER' ? 'bg-white shadow-[0_2px_8px_rgb(0,0,0,0.04)] text-[#0065eb] font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Register
        </button>
        <button
          type="button"
          onClick={() => { setMode('FORGOT'); setError(null); }}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            mode === 'FORGOT' ? 'bg-white shadow-[0_2px_8px_rgb(0,0,0,0.04)] text-[#0065eb] font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200/80 rounded-xl font-normal">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        {mode === 'REGISTER' && (
          <div>
            <label className="text-[11px] font-normal text-slate-600 block mb-1">Full Name</label>
            <Input
              type="text"
              placeholder="Nguyen Van A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs border-slate-300 focus:border-[#0065eb] rounded-xl h-10"
              required
            />
          </div>
        )}

        <div>
          <label className="text-[11px] font-normal text-slate-600 block mb-1">Email address</label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-xs border-slate-300 focus:border-[#0065eb] rounded-xl h-10"
            required
          />
        </div>

        {mode !== 'FORGOT' && (
          <div>
            <label className="text-[11px] font-normal text-slate-600 block mb-1">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs border-slate-300 focus:border-[#0065eb] rounded-xl h-10"
              required
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-full shadow-none transition-colors mt-2 cursor-pointer h-10"
        >
          {loading ? 'Processing...' : mode === 'LOGIN' ? 'Sign In' : mode === 'REGISTER' ? 'Create Account' : 'Send Reset Link'}
        </Button>
      </form>

      {/* Quick Fill Test Accounts */}
      <div className="mt-2 border-t border-slate-100 pt-3 flex flex-col gap-2">
        <p className="text-[10px] font-normal text-slate-400 text-center uppercase tracking-wider">
          Quick Fill Test Accounts:
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          <button
            type="button"
            onClick={() => handleFillDemo('customer@example.com', 'Customer@123')}
            className="px-3 py-1 text-[11px] font-normal bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#0065eb] rounded-full border border-slate-200/80 transition-colors cursor-pointer"
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('staff@example.com', 'Staff@123')}
            className="px-3 py-1 text-[11px] font-normal bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 rounded-full border border-slate-200/80 transition-colors cursor-pointer"
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('admin@example.com', 'Admin@123')}
            className="px-3 py-1 text-[11px] font-normal bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-full border border-slate-200/80 transition-colors cursor-pointer"
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};
