import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInForm } from '@/components/auth/SignInForm';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { BrandFooterLogos } from '@/components/auth/BrandFooterLogos';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccessSignIn = (email: string) => {
    console.log('User signed in with email:', email);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-between p-4 md:p-8 font-sans">
      
      {/* Top Header Bar with Back Arrow and Logo */}
      <div className="w-full max-w-[1240px] flex items-center justify-between py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full hover:bg-slate-100 transition-colors text-slate-700"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Expedia Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-6 h-6 bg-[#ffdb00] flex items-center justify-center rounded-md font-bold text-slate-900">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 font-sans">Expedia</span>
        </div>

        <div className="w-10" />
      </div>

      {/* Main Authentication Container */}
      <div className="w-full max-w-[400px] flex flex-col items-center gap-6 my-auto py-8">
        
        {/* Page Title & Subtitle */}
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Sign in or create an account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
            Unlock a world of rewards with one account across Expedia, Hotels.com, and Vrbo.
          </p>
        </div>

        {/* Email Sign In Form */}
        <SignInForm onSubmitEmail={handleSuccessSignIn} />

        {/* Divider */}
        <div className="w-full flex items-center gap-4 my-1">
          <div className="h-[1px] bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400 font-medium">or</span>
          <div className="h-[1px] bg-gray-200 flex-1" />
        </div>

        {/* Social Authentication Buttons */}
        <SocialLoginButtons />

        {/* Legal Statement */}
        <p className="text-[11px] text-gray-500 text-center leading-relaxed mt-2">
          By continuing, you have read and agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>,{' '}
          <a href="#" className="text-blue-600 hover:underline">Privacy Statement</a>, and{' '}
          <a href="#" className="text-blue-600 hover:underline">Rewards Terms</a>.
        </p>

        {/* Brand Family Footer */}
        <BrandFooterLogos />

      </div>

      <div className="py-2" />
    </div>
  );
};
