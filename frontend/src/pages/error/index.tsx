import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';

export const ErrorPage: React.FC = () => {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  const errorMessage =
    error?.statusText ||
    error?.message ||
    'Đã xảy ra lỗi hệ thống không mong muốn. Vui lòng thử lại sau.';

  return (
    <div className="flex min-h-[calc(100vh-5.5rem)] w-full flex-col items-center justify-center px-4 py-12 text-center bg-background font-sans">
      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Big Clean 500 Status Number */}
        <h1 className="font-black text-8xl sm:text-[10rem] tracking-tighter text-slate-200 dark:text-slate-800 select-none mb-4 leading-none">
          500
        </h1>

        {/* Main Bold Uppercase Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase mb-3">
          ĐÃ XẢY RA LỖI HỆ THỐNG
        </h2>

        {/* Italicized Description */}
        <p className="text-sm sm:text-base italic text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-8">
          {errorMessage}
        </p>

        {/* Single Pill Rounded Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(0)}
            className="inline-flex items-center justify-center rounded-full bg-[#0065eb] hover:bg-blue-700 text-white px-9 py-3 text-sm font-semibold tracking-wide cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Thử lại
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-8 py-3 text-sm font-semibold tracking-wide cursor-pointer transition-all shadow-xs active:scale-95"
          >
            Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};
