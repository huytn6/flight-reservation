import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border shadow-xl max-w-md w-full text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">403 Access Denied</h1>
        <p className="text-xs text-slate-500">
          You do not have permission to access this portal or resource.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-6 py-2.5 mt-2"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};
