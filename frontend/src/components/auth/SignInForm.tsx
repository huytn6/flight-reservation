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
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => { setMode('LOGIN'); setError(null); }}
          className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'LOGIN' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('REGISTER'); setError(null); }}
          className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'REGISTER' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Register
        </button>
        <button
          type="button"
          onClick={() => { setMode('FORGOT'); setError(null); }}
          className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'FORGOT' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Forgot Password
        </button>
      </div>

      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        {mode === 'REGISTER' && (
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Full Name</label>
            <Input
              type="text"
              placeholder="Nguyen Van A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-sm border-slate-300 focus:border-[#0065eb] rounded-xl"
              required
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">Email address</label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm border-slate-300 focus:border-[#0065eb] rounded-xl"
            required
          />
        </div>

        {mode !== 'FORGOT' && (
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm border-slate-300 focus:border-[#0065eb] rounded-xl"
              required
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-full shadow-md transition-colors mt-2"
        >
          {loading ? 'Processing...' : mode === 'LOGIN' ? 'Sign In' : mode === 'REGISTER' ? 'Create Account' : 'Send Reset Link'}
        </Button>
      </form>

      {/* Demo Quick Accounts fill buttons */}
      <div className="mt-2 border-t pt-3">
        <p className="text-[11px] font-semibold text-slate-500 mb-2 text-center uppercase tracking-wider">
          Demo Accounts Quick Fill:
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          <button
            type="button"
            onClick={() => handleFillDemo('customer@example.com', 'Customer@123')}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg border transition-colors"
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('staff@example.com', 'Staff@123')}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-600 rounded-lg border transition-colors"
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('admin@example.com', 'Admin@123')}
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 rounded-lg border transition-colors"
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};
