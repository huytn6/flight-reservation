import React from 'react';
import type { BookingDetail, ETicket } from '@/services/booking';
import { Plane, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ETicketPrintableProps {
  detail: BookingDetail;
  etickets: ETicket[];
}

export const ETicketPrintable: React.FC<ETicketPrintableProps> = ({ detail, etickets }) => {
  const { booking, segments, passengers } = detail;

  const totalAmount = Number(booking.total_amount || 0);
  const taxFee = Math.round(totalAmount * 0.1);
  const basePrice = totalAmount - taxFee;

  return (
    <div className="print-only hidden bg-white text-slate-900 font-sans p-2 max-w-4xl mx-auto border-0 shadow-none my-0">
      {/* 1. Clean Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0065eb] text-white flex items-center justify-center rounded-lg font-bold">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">UITAir Flight Reservation</h1>
            <p className="text-[11px] text-slate-500 font-medium">Vé Máy Bay Điện Tử & Xác Nhận Đặt Chỗ (E-Ticket Receipt)</p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-bold uppercase mb-0.5">
            <CheckCircle2 className="w-3 h-3" /> {booking.status === 'CONFIRMED' ? 'Đã Xác Nhận' : booking.status}
          </div>
          <p className="text-[10px] text-slate-500">Mã đặt chỗ (PNR)</p>
          <p className="text-xl font-black font-mono tracking-widest text-[#0065eb]">{booking.pnr}</p>
        </div>
      </div>

      {/* 2. Primary Information */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50/80 rounded-lg text-xs">
        <div>
          <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider mb-0.5">Người liên hệ đặt vé</p>
          <p className="font-bold text-slate-900 text-xs sm:text-sm">{booking.contact_name}</p>
          <p className="text-slate-600 text-[11px]">{booking.contact_email} • {booking.contact_phone || 'Chưa có'}</p>
        </div>
        <div>
          <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider mb-0.5">Thông tin xuất vé</p>
          <p className="font-semibold text-slate-800 text-[11px]">Ngày đặt: {new Date(booking.created_at).toLocaleString('vi-VN')}</p>
          <p className="text-slate-600 text-[11px]">Mã đơn hàng: {booking.id.substring(0, 13)}...</p>
        </div>
      </div>

      {/* 3. Flight Itinerary Details */}
      <div className="mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
          <Plane className="w-3.5 h-3.5 text-[#0065eb]" /> 1. Lịch Trình Chuyến Bay (Flight Itinerary)
        </h2>

        <div className="space-y-2">
          {segments?.map((seg: any, idx: number) => {
            const depIata = seg.departure_iata || seg.dep_iata || '---';
            const arrIata = seg.arrival_iata || seg.arr_iata || '---';
            const depCity = seg.departure_city || seg.dep_city || 'Khởi hành';
            const arrCity = seg.arrival_city || seg.arr_city || 'Điểm đến';

            return (
              <div key={idx} className="p-3 bg-slate-50/70 rounded-lg flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 text-xs">
                  <span className="font-bold text-slate-900">{seg.airline_name || 'Hãng hàng không'} — {seg.flight_number || 'VN-123'}</span>
                  <span className="text-[#0065eb] font-semibold text-[11px]">Hạng Phổ Thông (Economy)</span>
                </div>

                <div className="grid grid-cols-3 gap-2 items-center text-center">
                  <div className="text-left">
                    <p className="text-xl font-black text-slate-900">{depIata}</p>
                    <p className="text-xs font-semibold text-slate-700">{depCity}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {seg.departure_time ? new Date(seg.departure_time).toLocaleString('vi-VN') : '---'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Bay thẳng</span>
                    <div className="w-full flex items-center justify-center gap-1 my-0.5">
                      <div className="h-[1px] bg-slate-300 flex-1" />
                      <Plane className="w-3.5 h-3.5 text-[#0065eb] rotate-90" />
                      <div className="h-[1px] bg-slate-300 flex-1" />
                    </div>
                    <span className="text-[9px] text-slate-500">Hành lý 23kg ký gửi</span>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">{arrIata}</p>
                    <p className="text-xs font-semibold text-slate-700">{arrCity}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {seg.arrival_time ? new Date(seg.arrival_time).toLocaleString('vi-VN') : '---'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Passenger & E-Ticket Numbers Table */}
      <div className="mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
          2. Danh Sách Hành Khách & Số Vé Điện Tử (Passengers & E-Tickets)
        </h2>

        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px]">
              <th className="p-2">STT</th>
              <th className="p-2">Họ và Tên Hành Khách</th>
              <th className="p-2">Loại Khách</th>
              <th className="p-2">Số Vé Điện Tử</th>
              <th className="p-2 text-right">Chỗ Nhồi / Ghế</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {passengers?.map((pax: any, idx: number) => (
              <tr key={idx}>
                <td className="p-2 font-bold text-slate-500">{idx + 1}</td>
                <td className="p-2 font-bold text-slate-900 uppercase">{pax.full_name}</td>
                <td className="p-2 text-slate-600">{pax.type || pax.passenger_type || 'ADULT'}</td>
                <td className="p-2 font-mono font-bold text-[#0065eb]">{etickets[idx]?.ticket_number || `738-${booking.pnr}-${idx + 1}`}</td>
                <td className="p-2 text-right font-semibold text-slate-800">Xác nhận tại quầy</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Payment Summary */}
      <div className="mb-4 p-3 bg-slate-50/80 rounded-lg flex justify-between items-center text-xs">
        <div>
          <p className="font-bold text-slate-900 mb-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Xác nhận thanh toán
          </p>
          <p className="text-slate-500 text-[11px]">Giá vé cơ bản: {basePrice.toLocaleString('vi-VN')} VNĐ • Thuế & Phí: {taxFee.toLocaleString('vi-VN')} VNĐ</p>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-[9px] uppercase font-bold">Tổng số tiền đã thanh toán</p>
          <p className="text-lg font-black text-[#0065eb] font-mono">{totalAmount.toLocaleString('vi-VN')} VNĐ</p>
        </div>
      </div>

      {/* 6. Barcode Visual & Terms */}
      <div className="border-t border-slate-200 pt-3 flex items-center justify-between gap-4 text-[9px] text-slate-500">
        <div className="space-y-0.5 max-w-xl">
          <p className="font-bold text-slate-800 text-[10px]">LƯU Ý QUAN TRỌNG CHO HÀNH KHÁCH:</p>
          <p>• Vui lòng xuất trình vé điện tử này cùng Giấy tờ tùy thân (Hộ chiếu/CCCD) bản gốc khi làm thủ tục.</p>
          <p>• Quầy làm thủ tục mở trước 2 tiếng và đóng cửa trước 40 phút so với giờ cất cánh chuyến bay nội địa.</p>
          <p>• Cửa khởi hành sẽ đóng trước 15 phút so với giờ khởi hành ghi trên vé.</p>
        </div>

        <div className="flex flex-col items-center justify-center shrink-0">
          {/* Simulated Barcode */}
          <div className="h-8 w-32 bg-slate-900 flex items-center justify-center rounded p-1">
            <div className="w-full h-full bg-white flex justify-between px-1">
              {[...Array(24)].map((_, i) => (
                <div key={i} className={`h-full ${i % 3 === 0 ? 'w-1 bg-black' : 'w-0.5 bg-black'}`} />
              ))}
            </div>
          </div>
          <span className="font-mono text-[9px] text-slate-600 mt-0.5 font-bold">{booking.pnr}-BOARDING</span>
        </div>
      </div>
    </div>
  );
};
