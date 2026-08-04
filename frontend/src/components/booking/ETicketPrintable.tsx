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
    <div className="print-only hidden bg-white text-slate-900 font-sans p-6 max-w-4xl mx-auto border border-slate-300 rounded-xl my-4">
      {/* 1. Official Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0065eb] text-white flex items-center justify-center rounded-xl font-bold">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">Expedia Flight Reservation</h1>
            <p className="text-xs text-slate-500 font-medium">Vé Máy Bay Điện Tử & Xác Nhận Đặt Chỗ (E-Ticket Receipt)</p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {booking.status === 'CONFIRMED' ? 'Đã Xác Nhận' : booking.status}
          </div>
          <p className="text-xs text-slate-500">Mã đặt chỗ (PNR)</p>
          <p className="text-2xl font-black font-mono tracking-widest text-[#0065eb]">{booking.pnr}</p>
        </div>
      </div>

      {/* 2. Primary Information Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <div>
          <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider mb-0.5">Người liên hệ đặt vé</p>
          <p className="font-bold text-slate-900 text-sm">{booking.contact_name}</p>
          <p className="text-slate-600">{booking.contact_email} • {booking.contact_phone || 'N/A'}</p>
        </div>
        <div>
          <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider mb-0.5">Thông tin xuất vé</p>
          <p className="font-semibold text-slate-800">Ngày đặt: {new Date(booking.created_at).toLocaleString('vi-VN')}</p>
          <p className="text-slate-600">Mã đơn hàng: {booking.id.substring(0, 13)}...</p>
        </div>
      </div>

      {/* 3. Flight Itinerary Details */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 mb-3 flex items-center gap-2">
          <Plane className="w-4 h-4 text-[#0065eb]" /> 1. Lịch Trình Chuyến Bay (Flight Itinerary)
        </h2>

        <div className="space-y-3">
          {segments?.map((seg: any, idx: number) => (
            <div key={idx} className="p-4 border border-slate-300 rounded-xl bg-white flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
                <span className="font-bold text-slate-900 text-sm">{seg.airline_name || 'Hãng hàng không'} — {seg.flight_number || 'VN-123'}</span>
                <span className="bg-blue-50 text-[#0065eb] px-2.5 py-0.5 rounded font-semibold text-[11px]">Hạng Phổ Thông (Economy)</span>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center text-center">
                <div className="text-left">
                  <p className="text-2xl font-black text-slate-900">{seg.departure_iata}</p>
                  <p className="text-xs font-semibold text-slate-700">{seg.departure_city || 'Khởi hành'}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {seg.departure_time ? new Date(seg.departure_time).toLocaleString('vi-VN') : '---'}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Bay thẳng</span>
                  <div className="w-full flex items-center justify-center gap-1 my-1">
                    <div className="h-[2px] bg-slate-300 flex-1" />
                    <Plane className="w-4 h-4 text-[#0065eb] rotate-90" />
                    <div className="h-[2px] bg-slate-300 flex-1" />
                  </div>
                  <span className="text-[10px] text-slate-500">Hành lý 23kg ký gửi</span>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">{seg.arrival_iata}</p>
                  <p className="text-xs font-semibold text-slate-700">{seg.arrival_city || 'Điểm đến'}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {seg.arrival_time ? new Date(seg.arrival_time).toLocaleString('vi-VN') : '---'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Passenger & E-Ticket Numbers Table */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 mb-3">
          2. Danh Sách Hành Khách & Số Vé Điện Tử (Passengers & E-Tickets)
        </h2>

        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
              <th className="p-2.5">STT</th>
              <th className="p-2.5">Họ và Tên Hành Khách</th>
              <th className="p-2.5">Loại Khách</th>
              <th className="p-2.5">Số Vé Điện Tử</th>
              <th className="p-2.5 text-right">Chỗ Nhồi / Ghế</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {passengers?.map((pax: any, idx: number) => (
              <tr key={idx}>
                <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                <td className="p-2.5 font-bold text-slate-900 uppercase">{pax.full_name}</td>
                <td className="p-2.5 text-slate-600">{pax.type || pax.passenger_type || 'ADULT'}</td>
                <td className="p-2.5 font-mono font-bold text-[#0065eb]">{etickets[idx]?.ticket_number || `738-${booking.pnr}-${idx + 1}`}</td>
                <td className="p-2.5 text-right font-semibold text-slate-800">Xác nhận tại quầy</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Payment Summary */}
      <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
        <div>
          <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Xác nhận thanh toán
          </p>
          <p className="text-slate-500">Giá vé cơ bản: {basePrice.toLocaleString('vi-VN')} VNĐ • Thuế & Phí: {taxFee.toLocaleString('vi-VN')} VNĐ</p>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-[10px] uppercase font-bold">Tổng số tiền đã thanh toán</p>
          <p className="text-xl font-black text-[#0065eb] font-mono">{totalAmount.toLocaleString('vi-VN')} VNĐ</p>
        </div>
      </div>

      {/* 6. Barcode Visual & Terms */}
      <div className="border-t-2 border-dashed border-slate-300 pt-4 flex items-center justify-between gap-6 text-[10px] text-slate-500">
        <div className="space-y-1 max-w-xl">
          <p className="font-bold text-slate-800 text-xs">LƯU Ý QUAN TRỌNG CHO HÀNH KHÁCH:</p>
          <p>• Vui lòng xuất trình vé điện tử này cùng Giấy tờ tùy thân (Hộ chiếu/CCCD) bản gốc khi làm thủ tục.</p>
          <p>• Quầy làm thủ tục mở trước 2 tiếng và đóng cửa trước 40 phút so với giờ cất cánh chuyến bay nội địa.</p>
          <p>• Cửa khởi hành sẽ đóng trước 15 phút so với giờ khởi hành ghi trên vé.</p>
        </div>

        <div className="flex flex-col items-center justify-center shrink-0">
          {/* Simulated Barcode */}
          <div className="h-10 w-36 bg-slate-900 flex items-center justify-center rounded p-1">
            <div className="w-full h-full bg-white flex justify-between px-1">
              {[...Array(24)].map((_, i) => (
                <div key={i} className={`h-full ${i % 3 === 0 ? 'w-1 bg-black' : 'w-0.5 bg-black'}`} />
              ))}
            </div>
          </div>
          <span className="font-mono text-[9px] text-slate-600 mt-1 font-bold">{booking.pnr}-BOARDING</span>
        </div>
      </div>
    </div>
  );
};
