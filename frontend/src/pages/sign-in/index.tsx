import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInForm } from '@/components/auth/SignInForm';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col items-center justify-between p-4 sm:p-6 font-sans">
      
      {/* Top Header Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full hover:bg-slate-200/60 transition-colors text-slate-700 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        {/* Expedia Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-6 h-6 bg-[#ffdb00] flex items-center justify-center rounded-md font-bold text-slate-900">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 font-sans">Expedia</span>
        </div>

        <div className="w-9" />
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 flex flex-col gap-6 my-auto">
        
        {/* Card Header Title */}
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Sign in to your account
          </h1>
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            Access your flight bookings, saved trips, and account details.
          </p>
        </div>

        {/* Email Authentication Form */}
        <SignInForm />

      </div>

      {/* Footer */}
      <div className="py-2 text-center text-[11px] text-slate-400">
        © 2026 Expedia, Inc. All rights reserved.
      </div>
    </div>
  );
};
