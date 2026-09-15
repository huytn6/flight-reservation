import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock3,
  Headphones,
  House,
  PlaneTakeoff,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const MaintenancePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative isolate min-h-[620px] overflow-hidden bg-gradient-to-b from-[#f4f8ff] via-white to-white px-4 py-12 sm:px-6 sm:py-16">
      <div
        aria-hidden="true"
        className="absolute -left-28 top-10 -z-10 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-28 bottom-4 -z-10 h-80 w-80 rounded-full bg-sky-100/70 blur-3xl"
      />

      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0065eb] shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          Thông báo hệ thống
        </div>

        <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-[2rem] border border-blue-100 bg-white shadow-[0_22px_60px_-24px_rgba(0,101,235,0.45)] sm:h-36 sm:w-36">
          <div className="absolute inset-3 rounded-[1.6rem] bg-gradient-to-br from-blue-50 to-sky-100" />
          <PlaneTakeoff className="relative h-14 w-14 -rotate-6 text-[#0065eb] sm:h-16 sm:w-16" strokeWidth={1.8} />
          <div className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-2xl border-4 border-white bg-amber-400 text-slate-900 shadow-md">
            <Wrench className="h-5 w-5" strokeWidth={2.2} />
          </div>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#0065eb]">
          UITAir đang nâng cấp
        </p>
        <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
          Trang này đang được bảo trì
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          Đội ngũ UITAir đang hoàn thiện nội dung để mang đến trải nghiệm tốt hơn.
          Trang sẽ sớm hoạt động trở lại, cảm ơn bạn đã kiên nhẫn chờ đợi.
        </p>

        <div className="mt-8 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
            <Clock3 className="mb-3 h-5 w-5 text-[#0065eb]" />
            <p className="text-xs font-semibold text-slate-900">Sớm quay trở lại</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">Nội dung đang được cập nhật.</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
            <ShieldCheck className="mb-3 h-5 w-5 text-emerald-600" />
            <p className="text-xs font-semibold text-slate-900">Dịch vụ vẫn ổn định</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">Đặt vé và tra cứu vẫn hoạt động.</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
            <Headphones className="mb-3 h-5 w-5 text-violet-600" />
            <p className="text-xs font-semibold text-slate-900">Luôn sẵn sàng hỗ trợ</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">Liên hệ nếu bạn cần trợ giúp.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-11 rounded-xl bg-[#0065eb] px-6 text-xs font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700"
          >
            <Link to="/">
              <House className="h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="h-11 rounded-xl border-slate-300 bg-white px-6 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang trước
          </Button>
        </div>

        <p className="mt-8 text-[11px] text-slate-400">
          Mã trạng thái: <span className="font-semibold text-slate-500">UIT-MAINTENANCE</span>
        </p>
      </div>
    </section>
  );
};
