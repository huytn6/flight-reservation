import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-5.5rem)] w-full flex-col items-center justify-center px-4 py-12 text-center bg-slate-50 font-sans">
      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Big Clean 401 Number */}
        <h1 className="font-black text-8xl sm:text-[10rem] tracking-tighter text-slate-200 select-none mb-4 leading-none">
          401
        </h1>

        {/* Main Bold Uppercase Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 uppercase mb-3">
          YÊU CẦU ĐĂNG NHẬP
        </h2>

        {/* Italicized Description */}
        <p className="text-sm sm:text-base italic text-slate-500 max-w-md leading-relaxed mb-8">
          Vui lòng đăng nhập tài khoản hệ thống để thực hiện thao tác hoặc xem thông tin này.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/signin')}
            className="inline-flex items-center justify-center rounded-full bg-[#0065eb] hover:bg-blue-700 text-white px-9 py-3 text-sm font-semibold tracking-wide cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Đăng nhập ngay
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 px-8 py-3 text-sm font-semibold tracking-wide cursor-pointer transition-all shadow-xs active:scale-95"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};
