   # Tiến độ xử lý lỗi từ FIX.ipynb

> File này ghi lại: yêu cầu là gì, đã hiểu nguyên nhân ra sao, đã sửa file nào/sửa gì, và phần nào còn cần bạn làm tiếp. Viết theo hướng dễ đọc, không cần biết code cũng hiểu được đang sửa cái gì.

## 1. Yêu cầu ban đầu (từ FIX.ipynb)

File `FIX.ipynb` có 3 mục kèm ảnh chụp màn hình trang đang chạy thật (branding "Expedia" là do đây vốn là template Expedia được chỉnh lại thành UIT Air):

1. **Lịch chọn ngày ở khung tìm kiếm bị "đứng hình"**: luôn hiện cố định tháng 8 và tháng 9/2026, bấm nút mũi tên trái/phải (Previous/Next) để đổi tháng không có tác dụng.
2. **Trang kết quả tìm kiếm (sau khi bấm Search)**:
   - Dải ngày/giá phía trên (Sun Aug 9, Mon Aug 10, …) cũng bị lỗi ngày tháng tương tự.
   - Mỗi chuyến bay bị hiển thị **2 lần giống hệt nhau**.
   - Giá vé của mọi chuyến bay đều hiện **0đ**.
   - Bấm vào các thẻ ngày trong tuần không làm trang tải lại / cập nhật giá.
3. **Sau khi sửa mục 2 thì sửa luôn màn hình xem lại giá vé** (bấm chọn 1 chuyến bay → panel "Review fare to Hanoi"): giá hiện "+$0" và một số tiền vô lý dạng "$1,061,750.20", các thông tin hành lý/hạng ghế/phí đổi vé đều là chữ tiếng Anh cố định, không đúng với chuyến bay thực tế.

## 2. Vì sao lỗi xảy ra (nguyên nhân gốc)

Sau khi đọc code, gốc rễ của gần như toàn bộ nhóm lỗi 1 và 2 là **một chỗ duy nhất**: state ngày tháng của khung tìm kiếm (`DateRangeState`) trước đây **không lưu ngày thật**, mà chỉ lưu một con số ngày-trong-tháng (ví dụ `12`) cùng 2 chuỗi chữ cố định `"August 2026"` / `"September 2026"` được hard-code sẵn. Vì vậy:
- Lịch không thể "biết" tháng hiện tại là tháng nào để nhích tới/lui → nút Previous/Next vô dụng, lịch tháng 2 (tháng 9) thậm chí không có nút bấm nào cả.
- Khi qua trang kết quả, con số ngày đó bị đem gán đại vào **tháng hiện tại của máy** (`new Date().setDate(day)`), sai hoàn toàn với ngày người dùng thực sự chọn trên lịch.
- Ô "dải ngày/giá" (`DatePriceMatrix`) là dữ liệu **giả lập cứng** (`Aug 9 → Aug 15`, giá `$121, $122,...`), không lấy từ API, bấm vào chỉ đổi màu ô được chọn chứ không gọi lại tìm kiếm.

Lỗi mục 3 (giá "+$0", "$1,061,750.20") nằm ở một component khác (`FlightDetailDrawer.tsx`) — toàn bộ khối hiển thị giá/hạng ghế/hành lý/phí đổi vé ở đây là **text và số hard-code sẵn** (copy nguyên từ giao diện mẫu Expedia), không hề đọc dữ liệu chuyến bay/giá vé thật đang được xem.

**Lỗi "mỗi chuyến bay hiện 2 lần"** — kiểm tra kỹ thì đây **không phải lỗi code hiển thị**, mà là **lỗi dữ liệu thật trong database production**: mỗi chuyến bay (và toàn bộ giá vé của nó) đã bị insert **2 lần** với ID khác nhau nhưng nội dung giống hệt nhau. So khớp với `backend/database/seed.py` thì thấy các chuyến bay này (hãng Vietravel `VU`, EVA Air `BR`, China Airlines `CI`, Cathay Pacific `CX`, …) **không nằm trong file seed của repo** — tức là dữ liệu production được nạp bằng một script/nguồn khác ngoài repo, và có vẻ script đó đã chạy nạp dữ liệu **2 lần**. Gọi thẳng API production để xác minh: `VU220` SGN→HAN 09:15 có 2 bản ghi `id` khác nhau, mỗi bản ghi có bộ giá vé (fares) riêng — xác nhận đây là dữ liệu bị nhân đôi thật.

## 3. Đã sửa gì (code, chạy local, có thể build/lint sạch)

| # | File | Sửa gì | Ứng với lỗi |
|---|------|--------|--------------|
| 1 | `frontend/src/types/flight.ts` | Đổi `DateRangeState.startDate/endDate` từ số ngày-trong-tháng → chuỗi ngày ISO thật (`"2026-09-12"`). Bỏ 2 field `startMonthName/endMonthName` hard-code. | Gốc rễ lỗi 1 & 2 |
| 2 | `frontend/src/store/use-flight.ts` | Giá trị mặc định của ngày tìm kiếm giờ tính từ **ngày thật hôm nay** (+1 ngày cho chiều đi, +8 ngày cho chiều về) thay vì hard-code "12 tháng 8". | Gốc rễ lỗi 1 & 2 |
| 3 | `frontend/src/components/flight/DateRangePickerPopover.tsx` | Viết lại hoàn toàn: lịch giờ tự sinh đúng số ngày/đúng thứ của **bất kỳ tháng năm nào**, nút Previous/Next hoạt động thật (chặn không cho lùi về trước ngày hôm nay), cả 2 lưới tháng đều bấm chọn được, không cho chọn ngày trong quá khứ. | Lỗi 1 |
| 4 | `frontend/src/components/flight-results/CompactTopSearchBar.tsx` | Sửa chỗ đọc ngày từ URL: trước đây dùng `parseInt("2026-09-12")` → ra số `2026` (sai hoàn toàn); giờ dùng thẳng chuỗi ngày ISO. | Lỗi 1 & 2 |
| 5 | `frontend/src/components/flight-results/DatePriceMatrix.tsx` | Viết lại: bỏ toàn bộ dữ liệu giá giả cố định, gọi API thật `flights/flexible-dates` để lấy 7 ngày quanh ngày đang tìm kèm giá thật; bấm vào 1 ngày sẽ điều hướng sang URL tìm kiếm với ngày mới → trang tự tải lại kết quả. | Lỗi 2 (ngày tháng + không reload giá) |
| 6 | `frontend/src/pages/flight-results/index.tsx` | Bỏ đoạn code "vá" ngày kiểu số-ngày-trong-tháng (không còn cần vì lỗi gốc đã sửa). Nối `DatePriceMatrix` với dữ liệu tìm kiếm thật + hàm đổi ngày. Truyền hạng vé thật (`fare`) sang panel xem giá. | Lỗi 2 |
| 7 | `frontend/src/components/flight-results/FlightCard.tsx` | Bỏ dòng "+$0" giả (trước đây luôn hiện vì field `priceDiff` không bao giờ được set); hiện đúng giá vé thật, định dạng tiền Việt (`1.061.750 đ`) thay vì `$`. | Lỗi 2 (giá 0đ) |
| 8 | `frontend/src/components/flight-results/FlightDetailDrawer.tsx` | Bỏ toàn bộ text/số hard-code (`+$0`, `$X.20`, "Cabin: Economy", "Carry-on 15 lbs", "Change fee: $17"...). Thay bằng dữ liệu hạng vé thật đang chọn: giá thật (VNĐ), hạng ghế thật, hành lý ký gửi/xách tay thật (kg), có/không hoàn vé thật, phí đổi vé thật. | Lỗi 3 |

Đã kiểm tra sau khi sửa:
- `tsc -b --noEmit`: **0 lỗi kiểu dữ liệu**.
- `oxlint`: **0 lỗi mới** (chỉ còn các warning có sẵn từ trước, không liên quan phần vừa sửa).
- `vite build`: **build thành công**.

## 4. Dọn dữ liệu chuyến bay bị nhân đôi trên production DB

Theo yêu cầu, đã viết script kiểm tra + dọn trực tiếp trên database production (`mysql.uitair.donotaccess.com`), với nguyên tắc an toàn:
- Gom nhóm các chuyến bay **giống hệt nhau 100%** (cùng số hiệu, hãng, sân bay đi/đến, giờ đi/đến).
- Với mỗi nhóm trùng: **giữ lại bản ghi cũ nhất**, xoá các bản sao còn lại (cùng toàn bộ giá vé/số ghế/sơ đồ ghế con của bản sao đó).
- **Nếu bất kỳ bản ghi nào trong nhóm đã có khách đặt vé thật** (`booking_segments`) → **bỏ qua toàn bộ nhóm đó, không đụng vào**, để không làm hỏng vé của khách đã đặt.

**Kết quả:**
- Chạy thử (dry-run, chưa xoá gì): phát hiện **5490 nhóm chuyến bay bị trùng** — 5487 nhóm an toàn để dọn, **3 nhóm bị bỏ qua** vì đã có khách đặt vé thật (`VU220` các ngày 18/8, 22/8, 12/9 — cần bạn/admin xem xét thủ công, không tự động đụng vào).
- Đã chạy xoá thật và **dừng theo yêu cầu của bạn ở giữa chừng**: đã dọn được **~1974/5487** dòng trùng, **0 lỗi**. Vì mỗi lần xoá là 1 transaction riêng (xoá xong 1 cặp mới qua cặp tiếp theo), dừng giữa chừng **không để lại dữ liệu dở dang** — chỉ là mới dọn được gần 36%, còn khoảng 3513 dòng trùng chưa dọn. Nếu muốn dọn tiếp, chỉ cần chạy lại — script tự bỏ qua các chuyến đã dọn rồi.

## 5. Đã test những gì trên production

Không sửa được code trực tiếp trên production được (xem mục 6), nên phần test chia làm 2 phần:

**A. Test API thật trên `https://uitair.donotaccess.com` (đọc dữ liệu, không tạo/xoá gì)**

Đăng nhập cả 3 tài khoản demo (`customer@example.com`, `staff@example.com`, `admin@example.com`) → **thành công cả 3**. Sau đó gọi thử các API chính của từng vai trò:

| Vai trò | Chức năng đã test | Kết quả |
|---|---|---|
| Khách hàng | Xem hồ sơ (`users/me`) | ✅ 200 |
| Khách hàng | Xem đơn đặt vé của tôi (`users/me/bookings`) | ✅ 200 |
| Khách hàng | Chuyến bay đã lưu (`users/me/saved-flights`) | ✅ 200 |
| Khách hàng | Theo dõi giá vé (`users/me/price-alerts`) | ✅ 200 |
| Khách hàng | Tìm chuyến bay một chiều & khứ hồi (`flights/search`) | ✅ 200 |
| Khách hàng | Giá theo ngày linh hoạt (`flights/flexible-dates` — dữ liệu cho `DatePriceMatrix` mới sửa) | ✅ 200, có giá thật |
| Nhân viên | Danh sách đơn đặt vé (`staff/bookings`) + xem chi tiết 1 đơn | ✅ 200 |
| Nhân viên | Danh sách ticket hỗ trợ khách hàng (`staff/support/tickets`) | ✅ 200 |
| Nhân viên | Khách hàng (role CUSTOMER) gọi API của nhân viên | ✅ bị chặn đúng, trả về 403 |
| Admin | Dashboard tổng quan (`admin/dashboard/summary`) | ✅ 200 |
| Admin | Quản lý chuyến bay, khách hàng, sân bay, hãng bay, nhân viên, mã giảm giá, thanh toán (`admin/*`) | ✅ 200 hết |
| Admin | Khách hàng (role CUSTOMER) gọi API của admin | ✅ bị chặn đúng, trả về 403 |
| Hệ thống | `health check` | ✅ ok, database kết nối bình thường |

→ **Toàn bộ chức năng backend của cả 3 vai trò đều hoạt động bình thường**, kể cả phân quyền (khách hàng không truy cập được API dành riêng cho nhân viên/admin).

Phát hiện phụ (không nằm trong FIX.ipynb, chưa sửa để tránh lan phạm vi ngoài yêu cầu): panel "Flight details" (`FlightDetailModal.tsx`) mở từ màn hình xem giá vé cũng còn vài chỗ hard-code (loại tàu bay, khoảng cách bay luôn là "721 mi"...) — style giống lỗi mục 3, nên sửa tương tự nếu bạn muốn ở lượt sau.

**B. Test code đã sửa bằng cách chạy frontend local trỏ thẳng vào backend production**
- Dùng đúng cấu hình có sẵn của dự án: `cd frontend && npm run dev:prod` (đã ghi trong bộ nhớ trước đó của mình — không cần chạy backend/MySQL ở máy local, gọi thẳng API production).
- Không có công cụ trình duyệt thật trong phiên làm việc này để tự bấm/chụp ảnh màn hình, nên phần kiểm tra bằng mắt (lịch đổi tháng mượt không, panel giá hiện đúng số không...) **bạn cần tự mở thử sau khi deploy** — mình đã kiểm tra kỹ bằng đọc code + build/type-check sạch, nhưng chưa tận mắt xác nhận trên trình duyệt.

## 6. Vòng sửa lỗi thứ 2 (lỗi số 4-8 trong FIX.ipynb + lỗi "yêu thích chuyến bay")

File `FIX.ipynb` được bổ sung thêm 5 mục lỗi mới (số 4-8) kèm ảnh chụp thật, và bạn yêu cầu sửa thêm lỗi "yêu thích chuyến bay không hoạt động". Đây là lỗi gì, do đâu, và đã sửa ra sao:

### 6.1. Lỗi 4 — Vé khứ hồi không hiện đủ 2 chặng trong "Hành Trình Chuyến Bay"

**Yêu cầu:** khi khách đặt vé khứ hồi, trang chi tiết đơn hàng phải hiện cả chuyến đi lẫn chuyến về (ngày giờ đi/đến của cả 2 chặng).

**Nguyên nhân thật sự** (đào sâu hơn hiện tượng): trang chi tiết đơn hàng (`booking-detail`) thực ra **đã code đúng** — nó lặp qua toàn bộ danh sách chặng bay trả về từ API để hiển thị, không giới hạn 1 chặng. Vấn đề nằm ở **bước chọn chuyến bay phía trước**: khi tìm kiếm khứ hồi, sau khi khách chọn xong chuyến **đi**, hệ thống **bỏ qua luôn bước chọn chuyến về** và đưa thẳng khách sang bước thanh toán — nên đơn hàng tạo ra từ đầu đã chỉ có 1 chặng, chứ không phải lỗi hiển thị. Backend (`create_booking`) và giỏ hàng tạm (`booking-drafts`) đã hỗ trợ sẵn nhiều chặng, chỉ là giao diện tìm kiếm chưa dùng tới.

**Đã sửa:**
- `frontend/src/pages/flight-results/index.tsx`: thêm luồng chọn 2 bước cho vé khứ hồi — chọn xong **chuyến đi** thì trang tự chuyển sang danh sách **chuyến về** (dữ liệu đã có sẵn từ API tìm kiếm, không cần gọi lại), có thanh trạng thái "1. Chuyến đi / 2. Chuyến về" và nút "Đổi lại chuyến đi". Chọn xong cả 2 chặng mới chuyển sang trang xem lại chuyến đi.
- `frontend/src/pages/review-trip/index.tsx`: nhận mảng nhiều chặng (`legs`) thay vì chỉ 1 chuyến, tạo giỏ hàng tạm với đủ cả 2 chặng, hiển thị rõ nhãn "CHUYẾN ĐI" / "CHUYẾN VỀ" từng chặng.
- `frontend/src/components/flight-results/FlightDetailDrawer.tsx`: nút xác nhận đổi chữ theo ngữ cảnh ("Chọn chuyến đi" / "Chọn chuyến về" / "Chọn chuyến bay này").

### 6.2. Lỗi 5 — Giá gợi ý theo từng ngày bị "cố định"

**Yêu cầu:** giá hiện ở mỗi ngày gợi ý phải là giá rẻ nhất thật của ngày đó.

**Kết quả kiểm tra: đây KHÔNG phải lỗi code.** Mình test trực tiếp API `flights/flexible-dates`:
- Đổi sang tuyến khác (HAN→DAD) → ra giá khác hẳn (818.650đ thay vì 1.061.750đ) → chứng tỏ hàm tính đúng theo tuyến.
- Hỏi ngày không có chuyến bay nào (tháng 10) → trả về `null` đúng như kỳ vọng, không trả bừa 1 số cố định.

Sở dĩ 7 ngày liền nhau đều ra đúng 1.061.750đ là vì **dữ liệu chuyến bay demo** (bộ dữ liệu bị nạp trùng nói ở mục 4) có chuyến `VU220` với giá `1.061.750đ` lặp lại y hệt mỗi ngày trong suốt giai đoạn 17/8-15/9 — đúng là giá rẻ nhất thật của từng ngày, chỉ là dữ liệu mẫu quá lặp lại nên nhìn giống bug. Không cần sửa code; sau khi dọn xong dữ liệu trùng (mục 4) và có thêm dữ liệu đa dạng hơn, giá sẽ tự nhiên khác nhau giữa các ngày.

### 6.3. Lỗi 6 — Một chiều vẫn cho chọn 2 ngày (như khứ hồi)

**Nguyên nhân:** lịch chọn ngày dùng chung cho cả 2 loại vé, không biết đang ở chế độ "Một Chiều" để chỉ cho chọn 1 ngày. Ngoài ra, khi tìm kiếm, hệ thống **luôn gửi kèm ngày về** lên URL dù là vé một chiều, khiến trang kết quả tưởng nhầm là khứ hồi.

**Đã sửa:**
- `frontend/src/components/flight/DateRangePickerPopover.tsx`: thêm chế độ `singleDate` — khi bật, chỉ hiện 1 ngày, bấm ngày nào chọn ngay ngày đó (không còn chọn khoảng).
- `frontend/src/components/flight/BookingSearchCard.tsx`, `frontend/src/components/flight-results/CompactTopSearchBar.tsx`: bật `singleDate` khi đang chọn "Một Chiều"; **không gửi ngày về lên URL** khi là một chiều.
- `frontend/src/pages/flight-results/index.tsx`: sửa cách xác định loại vé (một chiều/khứ hồi) — ưu tiên đọc đúng tham số `trip` từ URL thay vì đoán qua việc có ngày về hay không.

### 6.4. Lỗi 7 — Bộ lọc (Filter by) không lọc được gì

**Nguyên nhân:** toàn bộ khung lọc bên trái trang kết quả là giao diện tĩnh, dữ liệu và giá đều gõ chết cứng (`$156`, `Nonstop (40)`...), các ô checkbox chỉ đổi màu khi bấm chứ không có tác dụng gì với danh sách chuyến bay.

**Đã sửa:** viết lại `frontend/src/components/flight-results/FlightFilterSidebar.tsx` thành bộ lọc thật, tính toán từ đúng danh sách chuyến bay đang hiện:
- **Điểm dừng** (bay thẳng) — đếm & giá "từ" thật.
- **Hãng hàng không** — tự liệt kê đúng các hãng đang có trong kết quả, kèm số chuyến & giá thấp nhất mỗi hãng.
- **Giờ khởi hành** (Sáng/Chiều/Tối muộn/Đêm khuya) — tính theo giờ khởi hành thật của từng chuyến.
- **Giá tối đa** (VNĐ) — thanh kéo theo đúng khoảng giá thấp nhất/cao nhất của kết quả hiện tại.

Bấm lọc sẽ lọc ngay danh sách chuyến bay hiển thị (`frontend/src/pages/flight-results/index.tsx`), có thông báo riêng + nút "Xoá bộ lọc" khi lọc ra 0 kết quả. Đã bỏ 2 mục hoàn toàn giả trước đó ("Preferred class", "Travel and baggage") vì không có dữ liệu thật tương ứng để lọc.

### 6.5. Lỗi 8 — Tra cứu vé bằng mã PNR báo "Booking not found"

**Nguyên nhân (đã xác minh chính xác bằng cách gọi thử API thật):** trang tra cứu vé (cả trang "Check-in" và trang "Find Your Booking") gọi API tra cứu bằng phương thức **GET** kèm query string, nhưng backend chỉ nhận **POST** kèm dữ liệu JSON ở route `/bookings/lookup`. Vì gửi sai kiểu, request bị router hiểu nhầm thành "lấy chi tiết đơn hàng có id = lookup" (khớp với route `GET /bookings/{booking_id}`) — và vì không có đơn hàng nào có id là chữ "lookup", nên luôn báo lỗi "Booking not found", bất kể PNR nhập vào đúng hay sai.

**Đã sửa:** `frontend/src/services/booking.ts` — đổi `lookupBooking` từ GET query-string sang đúng POST kèm JSON body như backend yêu cầu. Đồng thời sửa `frontend/src/pages/booking-lookup/index.tsx` vì nó đang đọc sai cấu trúc dữ liệu trả về (tưởng lồng trong `result.booking.*` nhưng thực tế API trả phẳng `result.*`) — nếu không sửa luôn chỗ này, sau khi sửa GET→POST trang vẫn hiện "undefined" thay vì thông tin vé thật.

Đã kiểm tra trực tiếp bằng `curl`: gọi đúng kiểu POST với PNR `JWW41B` trả về đầy đủ thông tin vé thật (chuyến bay, giờ bay, hành khách...).

### 6.6. Lỗi "Yêu thích chuyến bay" không hoạt động

**Nguyên nhân:** nút tim (❤) để lưu chuyến bay yêu thích thực ra **lưu được** (API lưu/bỏ lưu chạy đúng — đã test trực tiếp), nhưng trang "Chuyến bay đã lưu" hiện **trống điểm đi/điểm đến** (hiện "undefined → undefined") vì câu truy vấn ở backend lấy danh sách chuyến bay đã lưu **quên nối bảng sân bay** để lấy mã điểm đi/đến — chỉ có số hiệu chuyến bay và giờ bay, khiến trang hiển thị trông như bị hỏng.

**Đã sửa:** `backend/repositories/user_repo.py` — hàm `list_saved_flights` nối thêm bảng `airports` (đi và đến) để trả về đầy đủ mã sân bay đi (`origin`) / đến (`destination`). Đã kiểm tra trực tiếp bằng cách chạy đúng câu truy vấn này trên database production (chỉ đọc) — trả về đúng `origin: SGN, destination: HAN`.

### Đã kiểm tra lại sau vòng sửa lỗi thứ 2

- `tsc -b --noEmit`: **0 lỗi kiểu dữ liệu**.
- `oxlint`: **0 lỗi mới**.
- `vite build`: **build thành công**.
- Test trực tiếp qua API production (chỉ đọc, có dọn lại 2 chuyến bay lưu thử để không để lại rác trong tài khoản demo): xác nhận `flights/flexible-dates`, `bookings/lookup` (POST), và câu truy vấn `saved_flights` đã sửa đều trả đúng dữ liệu thật.
- **Chưa xác nhận được bằng mắt trên trình duyệt thật** (không có công cụ trình duyệt trong phiên này) — cần bạn tự mở thử sau khi deploy, đặc biệt luồng chọn 2 chặng khứ hồi (lỗi 4) và bộ lọc (lỗi 7) vì đây là 2 thay đổi lớn nhất về luồng thao tác.

## 6.6b. Lỗi 9 — Chuyến bay đã đặt (VU220) nhưng tra "Trạng Thái Chuyến Bay" không ra

**Yêu cầu:** chuyến bay đã có trong đơn đặt vé thật (PNR TPI1VA, VU220, SGN→HAN 18/9/2026), nhưng vào trang "Tra Cứu Lịch Cất Cánh & Hạ Cánh Chuyến Bay", gõ đúng "VU220" thì báo "Tìm thấy 0 chuyến bay phù hợp".

**Nguyên nhân:** trang này khi mở lên sẽ tự gọi API tìm chuyến bay `flights/search` **mà không kèm sân bay đi/đến/ngày bay**. API đó luôn yêu cầu đủ 3 thông tin này, thiếu là nó từ chối request — nên danh sách chuyến bay ban đầu của trang **luôn luôn rỗng** (lỗi bị nuốt âm thầm, không hiện ra ngoài). Khi gõ tìm "VU220", trang chỉ đang lọc trên danh sách rỗng đó (lọc ở phía trình duyệt, không gọi lại server) → dù gõ đúng số hiệu chuyến bay thật vẫn luôn ra 0 kết quả.

**Đã sửa:** vì trước giờ hệ thống **chưa có API tra cứu chuyến bay công khai theo số hiệu/thành phố** (chỉ có API tìm kiếm theo tuyến bay cụ thể phục vụ đặt vé), mình đã bổ sung API mới đúng mục đích:
- `backend/repositories/flight_repo.py` + `backend/services/flight_service.py`: hàm tra cứu chuyến bay theo số hiệu / tên thành phố / tên hãng bay; không nhập gì thì trả về các chuyến bay **sắp khởi hành gần nhất** (tính từ thời điểm hiện tại).
- `backend/controllers/flight_controller.py`: route mới `GET /flights/status?q=...` (công khai, không cần đăng nhập, giống cách trang này vốn được thiết kế để ai cũng tra được).
- `frontend/src/services/flight.ts`: hàm gọi API mới `searchFlightStatus`.
- `frontend/src/pages/flight-status/index.tsx`: gọi thẳng API tra cứu mới (tìm kiếm thật ở server) thay vì gọi nhầm API tìm chuyến bay theo tuyến rồi lọc tay trên danh sách rỗng.

Đã kiểm tra trực tiếp trên database production (chỉ đọc): tìm "VU220" ra đúng các chuyến bay thật đã đặt; không nhập gì thì ra đúng danh sách chuyến bay sắp khởi hành gần nhất tính từ giờ hiện tại (không còn lẫn chuyến bay đã bay từ nhiều tuần trước).

## 6.7. Lỗi 10 — Ở mục "yêu thích", bấm "Xem Giá Vé" không ra được giá

**Yêu cầu:** ở trang "Chuyến bay đã lưu", thêm chuyến bay vào yêu thích xong, bấm "Xem Giá Vé" thì không xem được giá.

**Nguyên nhân — có 2 lớp, đều đã tìm ra và sửa:**

1. **Lớp 1 (đã sửa từ mục 6.6, chỉ đang chờ deploy):** vì backend production chưa được deploy code mới, câu truy vấn "chuyến bay đã lưu" vẫn thiếu điểm đi/đến → `sf.origin`/`sf.destination` là `undefined`. Ảnh chụp của bạn cho thấy đúng hiện tượng này: card chuyến bay lưu trống điểm đi/đến.
2. **Lớp 2 (lỗi mới, vừa tìm ra và sửa):** nút "Xem Giá Vé" chỉ gửi điểm đi/đến lên trang tìm kiếm, **không gửi kèm ngày bay**. Ngay cả khi điểm đi/đến đúng, trang kết quả vẫn tự mặc định tìm chuyến bay cho "ngày mai" — khác hẳn ngày chuyến bay bạn đã lưu — nên vẫn không ra kết quả đúng như mong đợi. Ảnh chụp thứ 2 xác nhận: `leavingFrom=undefined&goingTo=undefined` → trang hiện "Leaving from: undefined (undefined)" và báo lỗi "Origin airport undefined not found".

**Đã sửa:**
- `frontend/src/pages/saved-flights/index.tsx`: nút "Xem Giá Vé" giờ gửi đúng `origin`, `destination` **và** `departure_date` (lấy từ ngày giờ bay thật của chuyến đã lưu), báo lỗi rõ ràng thay vì điều hướng mù nếu thiếu dữ liệu.
- `frontend/src/pages/flight-results/index.tsx`: thêm lớp phòng vệ — nếu link nào đó lỡ thiếu tham số và tạo ra chữ `"undefined"`/`"null"` trong URL, trang sẽ coi như không có tham số (dùng mặc định SGN/HAN) thay vì hiển thị "undefined" ra giao diện.

Lỗi này sẽ **chỉ hết hẳn sau khi bạn deploy code** (vì phụ thuộc lớp 1 — sửa backend). Nếu chưa deploy mà thử lại, "Xem Giá Vé" sẽ báo thông báo lỗi rõ ràng ("Thiếu thông tin điểm đi/điểm đến...") thay vì im lặng dẫn sang trang lỗi như trước.

## 6.8. Lỗi 11 — "Route GET /flights/status not found" khi test lại

**Đây không phải lỗi code mới.** Bạn test bằng cách chạy `npm run dev:prod` (chỉ chạy frontend ở máy bạn, gọi thẳng vào backend **production**), nhưng route `/flights/status` (vừa thêm ở mục 6.6b để sửa lỗi 9) **mới chỉ có trong code local**, chưa được deploy lên server production — nên server production trả lời "route không tồn tại" là đúng, không phải bug.

Đã xác minh bằng cách gọi thẳng production: route mới → báo not found; route cũ (`flights/search`) → vẫn chạy bình thường (200). Nghĩa là code không có gì sai thêm — chỉ đơn giản là **các fix ở backend (route `/flights/status`, lỗi "yêu thích chuyến bay" ở mục 6.6) sẽ luôn báo lỗi/không có tác dụng cho tới khi bạn deploy code lên production.**

→ Đã hỏi bạn và bạn chọn: tiếp tục để mình sửa các lỗi tiếp theo, phần deploy bạn sẽ tự làm sau. Ghi nhớ: **danh sách các thay đổi backend đang chờ deploy** tính đến thời điểm này:
- `backend/repositories/user_repo.py` (lỗi yêu thích chuyến bay — mục 6.6)
- `backend/repositories/flight_repo.py`, `backend/services/flight_service.py`, `backend/controllers/flight_controller.py` (route `/flights/status` — mục 6.6b)

## 6.9. Đã đẩy code lên GitHub — và phát hiện quan trọng

Bạn yêu cầu đẩy các fix lên repo (`https://github.com/huytn6/flight-reservation`). Trước khi push, phát hiện: **repo này đã có rất nhiều commit gần đây từ một nguồn khác** (có vẻ một phiên làm việc khác cũng đang sửa lỗi qua git, song song với phiên này) — khoảng 50 file khác với bản local mình đang sửa. Bạn xác nhận đó là công việc hợp lệ, cần giữ nguyên.

**Cách xử lý:** mình không đẩy nguyên bản local lên (sẽ ghi đè mất việc của người khác). Thay vào đó, với từng file mình đã sửa, mình so sánh kỹ với bản mới nhất trên GitHub:
- Phần lớn file (17/20) không bị ai động vào — đẩy thẳng bản đã sửa.
- `backend/repositories/user_repo.py`: phát hiện **người khác đã sửa đúng lỗi "yêu thích chuyến bay" này rồi, và sửa tốt hơn bản của mình** (có thêm tên thành phố, tên hãng bay) — mình bỏ qua, giữ nguyên bản của họ.
- `frontend/src/services/booking.ts`: người khác đã đổi tên nhiều đường dẫn API khác (không liên quan lỗi mình sửa) — mình chỉ ghép thêm đúng phần mình cần (kiểu dữ liệu tra cứu PNR), không đụng phần của họ.
- `backend/repositories/flight_repo.py`: tương tự — họ đã cải tiến vài hàm khác, mình chỉ chèn thêm đúng hàm tra cứu chuyến bay mới của mình vào, giữ nguyên phần còn lại.

Đã push 2 commit lên nhánh `main`:
1. `d3881b7` — toàn bộ fix từ lỗi 1 đến lỗi 10.
2. `99bbe7d` — **một lỗi phát sinh phát hiện khi push**: pipeline test tự động (GitHub Actions) đang **fail sẵn từ trước** (không phải do mình) vì file migration `V3__support_category_aircraft_unique.sql` (của người khác) tạo unique key nhưng code chưa xử lý lỗi "key đã tồn tại" cho đúng loại lỗi đó khi chạy test nhiều lần — khiến **pipeline fail liên tục, kể cả 2 lần push gần nhất của người kia cũng vậy**. Mình sửa 1 dòng để pipeline tolerant với lỗi này (giống cách nó đã tolerant với "bảng đã tồn tại"). Sau khi sửa, bước test/build **đã chạy pass hoàn toàn**.

**Vướng mắc cuối cùng — cần bạn (hoặc người quản lý server) xử lý:** Bước deploy thật lên server (`103.186.64.195`) bị lỗi **3 lần liên tiếp**, cùng 1 nguyên nhân: server không tải được Docker image `python:3.12-slim` từ Docker Hub (`dial tcp ...:443: i/o timeout` khi kéo image). Đây là **lỗi kết nối mạng từ server tới Docker Hub**, không phải lỗi code — mình không có quyền SSH vào server đó nên không tự sửa được. Tin tốt: script deploy có cơ chế **tự động rollback về bản cũ an toàn** mỗi lần fail, nên **production hiện không bị gián đoạn**, chỉ là chưa cập nhật fix mới.

## 6.10. Lỗi 12 — Lịch chọn ngày khứ hồi bị "cố định" sau khi chọn xong

**Yêu cầu:** chọn ngày đi/ngày về (VD ngày 11 và 12) thì được, nhưng sau đó muốn quay lại đổi ngày đi thì lịch không cho bấm nữa, ngày đi cứ đứng yên.

**Nguyên nhân:** `DateRangePickerPopover.tsx` dùng 1 biến ẩn `activeTab` để nhớ đang sửa "ngày đi" hay "ngày về". Bấm xong ngày đi, biến này tự chuyển sang "ngày về" — hợp lý cho lần bấm đầu. Nhưng sau khi bấm xong cả 2 ngày, **không có chỗ nào chuyển nó về lại "ngày đi"**, kể cả khi đóng lịch lại rồi mở lên lần sau. Hậu quả: mọi cú bấm tiếp theo (kể cả ở phiên mở lịch mới) đều bị hiểu nhầm là đang sửa ngày về, nên ngày đi hiển thị đứng yên không đổi — đúng như hiện tượng bạn mô tả.

**Đã sửa:** `frontend/src/components/flight/DateRangePickerPopover.tsx` — thêm đoạn tự động đưa về chế độ "sửa ngày đi" mỗi khi mở lịch lên lại (kèm đưa lịch về đúng tháng của ngày đi hiện tại), thay vì giữ nguyên trạng thái ẩn từ lần trước.

**Đã kiểm tra:** đọc kỹ lại toàn bộ logic bấm chọn ngày, dựng lại từng bước bấm (11 → 12 → đóng lịch → mở lại → bấm ngày khác) để xác nhận đúng chỗ hỏng trước khi sửa. Không có công cụ trình duyệt trong phiên này để tự bấm-thử trực quan — **bạn nên tự mở thử lại đúng kịch bản trên** sau khi có bản build mới.

> **Cập nhật — lỗi 12 chưa hết hẳn (bạn báo lại thành lỗi 14):** fix ở trên chỉ tự động về "sửa ngày đi" khi **đóng lịch rồi mở lại**. Nếu chọn xong 2 ngày (VD 17-18) mà **chưa đóng lịch**, bấm tiếp một ngày lớn hơn ngày đi vẫn bị hiểu nhầm là đang sửa ngày về → ngày đi vẫn đứng yên ở 17. Xem lỗi 14 (mục 6.12) — đã sửa dứt điểm cả 2 trường hợp.

## 6.12. Lỗi 14 — Lịch chọn ngày vẫn "cố định" ngay trong lúc đang mở (không cần đóng lịch)

**Yêu cầu:** chọn ngày 17 và 18 thì được, nhưng sau đó nếu bấm 1 ngày lớn hơn 17 (VD 20), ngày đi cứ đứng yên ở 17, không đổi.

**Nguyên nhân:** đây là phần lỗi 12 chưa sửa hết. Sau khi bấm xong ngày về (ngày 18), biến ẩn nhớ "đang sửa ngày đi hay ngày về" vẫn đứng ở "ngày về" — bản sửa lần trước chỉ đưa nó về "ngày đi" lúc **mở lại lịch**, chưa xử lý lúc **vẫn đang mở lịch** mà bấm tiếp. Nên hễ bấm ngày nào từ 17 trở lên (chưa đóng lịch), hệ thống vẫn tưởng đang chỉnh ngày về → ngày đi không bao giờ đổi trừ khi bấm ngày nhỏ hơn ngày đi hiện tại.

**Đã sửa:** `frontend/src/components/flight/DateRangePickerPopover.tsx` — ngay khi bấm xong ngày về (chọn xong trọn 1 cặp ngày đi/về), tự động chuyển lại về chế độ "sửa ngày đi" **luôn, không cần đóng lịch**. Nhờ vậy, mỗi lần vừa chọn xong 1 cặp ngày, cú bấm tiếp theo mặc định sẽ chọn lại ngày đi mới (giống cách Google Flights hoạt động) — muốn chỉnh riêng ngày về thì bấm vào chữ ngày về ở đầu lịch (nút này vẫn hoạt động như cũ).

**Đã kiểm tra:** dựng lại đúng kịch bản bạn mô tả (17 → 18 → 20) từng bước trên giấy theo code mới — ngày đi đổi đúng thành 20 (không còn đứng yên). Chạy `tsc -b --noEmit`: 0 lỗi. Không có công cụ trình duyệt trong phiên này để tự bấm-thử — **bạn nên tự mở thử lại đúng kịch bản 17 → 18 → 20** sau khi có bản build mới để xác nhận bằng mắt.

## 6.11. Lỗi 13 — Tra cứu chuyến bay ra kết quả trùng lặp

**Yêu cầu:** tìm chuyến bay bị hiện trùng lặp nhiều chuyến giống hệt nhau.

**Nguyên nhân:** kiểm tra lại đúng như đã ghi ở mục 2 (dòng 26) — đây không phải lỗi ở code tìm kiếm (đã tự gọi thử API tìm kiếm với database sạch, ra đúng kết quả không trùng), mà là **dữ liệu `flights` trong database production còn sót bản ghi trùng thật**. Gọi thẳng API production để xác minh lại (tuyến SGN→HAN ngày 08/09/2026): 20 dòng trả về cho 13 chuyến thực, 7 số hiệu chuyến bay bị lặp đúng 2 lần (khác `id`, giống hệt số hiệu/giờ bay/giá). Khớp với việc đợt dọn dữ liệu ở mục 4 mới xử lý được **~1974/5487** nhóm trùng rồi dừng theo yêu cầu của bạn — còn khoảng **3513 nhóm chưa dọn**, nay lộ ra thành lỗi 13 này.

**Đã sửa (khác cách làm ở mục 4 — lần này sửa tận gốc):** thay vì chạy script xoá tay 1 lần trên production, lần này viết thành migration chính thức `backend/database/migrations/V4__dedupe_flights_and_prevent_recurrence.sql`:
1. Dọn nốt các bản ghi trùng — vẫn giữ đúng nguyên tắc an toàn cũ: **bỏ qua** mọi nhóm đã có khách đặt vé thật, giữ ghế, hoặc đã được ai lưu yêu thích; chỉ xoá các bản trùng "sạch" (chưa ai đụng tới) và luôn giữ lại bản ghi cũ nhất trong mỗi nhóm.
2. Thêm ràng buộc `UNIQUE(flight_number, departure_time)` ở tầng database — đảm bảo lỗi này **không thể tái diễn nữa** dù có seed lại dữ liệu mẫu hay tạo chuyến bay tay qua trang admin, thay vì phải nhớ dọn tay mỗi lần như trước.

**Đã kiểm tra:** chạy thử migration này trên database local (XAMPP) — dọn sạch không lỗi; khởi động lại backend nhiều lần để xác nhận nó **tự chạy lại an toàn** mỗi lần backend khởi động (theo đúng cơ chế `init_schema()` sẵn có của dự án) mà không báo lỗi ràng buộc đã tồn tại.

**CHƯA áp dụng lên production** — migration này sẽ tự chạy trên production vào lần deploy kế tiếp (qua Flyway), nhưng cần bạn xác nhận trước vì nó xoá dữ liệu thật (dù đã giới hạn phạm vi an toàn giống hệt nguyên tắc mục 4). Lưu ý: đợt deploy trước đang bị chặn bởi lỗi hạ tầng ở mục 6.9 (server không kéo được Docker image) — chưa rõ đã được xử lý xong chưa.

## 6.13. Lỗi 15 & 16 — Chọn khứ hồi/một chiều "hết vé" rất nhiều, local và production khác nhau

**Yêu cầu (lỗi 15):** kiểm tra vì sao chọn khứ hồi/một chiều lại ra "hết vé" nhiều đến vậy, kiểm tra dữ liệu và giải thích.
**Yêu cầu (lỗi 16):** trên link deploy (production) thông tin chuyến bay vẫn bình thường, nhưng ở máy local lại bị "hết vé" — kiểm tra vì sao khác nhau. (VD: khứ hồi SGN→HAN, đi 06/09/2026, về 10/09/2026.)

**Đã kiểm tra dữ liệu thật (không sửa code trước, chỉ đọc):**
- Gọi API `flights/flexible-dates` trên **production** cho nhiều tuyến (SGN-HAN, SGN-DAD, HAN-DAD, SGN-PQC, SGN-BKK, SGN-SIN, SGN-NRT, HAN-SIN) ở nhiều mốc ngày: **mọi tuyến đều có giá mỗi ngày liên tục từ hiện tại đến hết 30/09/2026**, nhưng **từ 01/10/2026 trở đi thì hoàn toàn không còn chuyến bay nào** (`min_price: null` mọi tuyến, mọi ngày).
- Đối chiếu với `backend/services/background_jobs.py`: dự án có 6 job chạy nền (giải phóng ghế giữ chỗ, hết hạn giỏ hàng tạm, cảnh báo giá, cập nhật trạng thái bay, hoàn tất đơn, thông báo) nhưng **không có job nào tự tạo thêm chuyến bay mới** cho tương lai.

**Nguyên nhân gốc (giải thích cho lỗi 15):** dữ liệu chuyến bay thật trên production **không đến từ `seed.py` trong repo** (đã ghi nhận từ mục 2) — nó được nạp 1 lần từ một nguồn ngoài repo, tạo lịch cố định cho khoảng 1 tháng rồi dừng hẳn, không có cơ chế tự nối dài. Đây là "quả bom hẹn giờ": mỗi ngày trôi qua lịch còn lại càng ngắn, và sau 30/09/2026 **mọi tìm kiếm khứ hồi/một chiều, ở mọi tuyến, đều sẽ ra "hết vé"** vì không còn chuyến bay nào ở tương lai — không phải lỗi logic tìm kiếm.

**Nguyên nhân khác biệt local vs production (giải thích cho lỗi 16):** máy local dùng đúng `backend/database/seed.py` của repo — script này (trước khi sửa) chỉ tạo chuyến bay cho **~1 tuần kể từ ngày chạy seed**, không phải cả tháng như production. Ví dụ bạn test ngày đi 06/09/2026 — nhưng nếu bạn seed local vào khoảng 07-08/09/2026, script chỉ tạo chuyến từ 08/09 trở đi → 06/09 **chưa từng có dữ liệu**, nên báo "hết vé" dù trên production (đã có sẵn cả tháng) vẫn tra ra bình thường. Đây không phải lỗi code tìm kiếm, mà do 2 nơi có 2 tập dữ liệu khác độ dài khác nhau.

**Đã sửa tận gốc (xử lý cả 2 lỗi cùng lúc, đúng hướng bạn chọn — thêm job tự động):**
1. Viết mới `backend/services/flight_schedule_service.py`: gom lịch bay hàng ngày (14 tuyến, bay đều mỗi ngày) thành 1 danh sách mẫu (`DAILY_FLIGHT_TEMPLATE`) và 1 hàm dùng chung `ensure_schedule_range(db, ngày_bắt_đầu, ngày_kết_thúc)` — tạo chuyến bay + giá vé + tồn kho ghế + sơ đồ ghế cho bất kỳ khoảng ngày nào còn thiếu (bỏ qua ngày đã có sẵn, an toàn để gọi lại nhiều lần).
2. `backend/database/seed.py`: bỏ hẳn danh sách gần 70 dòng chuyến bay gõ tay theo từng ngày lệch (`flight_definitions` + `day_offset`) — giờ chỉ còn 1 dòng gọi `ensure_schedule_range` cho 7 ngày tới, dễ đọc hơn hẳn (đúng yêu cầu ở lỗi 13).
3. Thêm job mới `extend_flight_schedule` (`backend/services/background_jobs.py`) — tự động đảm bảo **luôn có sẵn chuyến bay từ hôm nay đến 45 ngày sau**, chạy ngay khi backend khởi động và lặp lại mỗi 6 giờ (đăng ký ở `backend/main.py`). Nhờ vậy production sẽ không bao giờ hết lịch bay nữa (kể cả sau khi bàn giao, không ai đụng vào code), và local mỗi lần chạy backend cũng tự có đủ 45 ngày dữ liệu — không còn khác biệt local/production nữa.

**Đã kiểm tra:** chạy thử trên database local (XAMPP) — job tự chạy khi backend khởi động, tạo thêm chuyến bay đúng thứ tự ngày tăng dần, không lỗi; gọi lại API tìm kiếm trong lúc job đang chạy vẫn trả về bình thường (job chạy nền, không chặn request). Lưu ý: lần chạy đầu tiên khá chậm (do tạo hàng nghìn dòng ghế cho từng chuyến — chấp nhận được vì chỉ chậm ở lần đầu, các lần sau mỗi 6h chỉ thêm đúng 1 ngày mới nên rất nhanh). `tsc -b --noEmit` (frontend, không đổi gì) vẫn 0 lỗi; cú pháp Python của cả 4 file đã sửa: hợp lệ.

**Chưa deploy lên production** — cùng nằm trong danh sách chờ xác nhận ở mục 7.

## 6.14. Lỗi 13 (tái phát) — Tìm theo mã chuyến bay ra rất nhiều kết quả trông như trùng lặp

**Yêu cầu:** tra cứu theo mã chuyến bay (trang "Tra Cứu Lịch Cất Cánh & Hạ Cánh") bị liệt kê ra rất nhiều chuyến bay.

**Nguyên nhân — hệ quả trực tiếp của fix lỗi 15/16 vừa làm:** trước đây mỗi số hiệu (VD `VN100`) chỉ tồn tại vài ngày trong dữ liệu mẫu, nên tra cứu ít khi ra nhiều dòng. Sau khi thêm job tự nối dài lịch bay (mục 6.13), `VN100` giờ bay **đều đặn mỗi ngày** trong suốt 45 ngày tới — tra cứu đúng mã này sẽ khớp tối đa 20 dòng (giới hạn có sẵn của API), mỗi dòng là 1 ngày khác nhau. Đây **không phải dữ liệu trùng lặp giả** (khác lỗi 13 gốc), nhưng giao diện thẻ kết quả (`frontend/src/pages/flight-status/index.tsx`) **chỉ hiện giờ bay, không hiện ngày** — nên 20 chuyến bay hợp lệ của 20 ngày khác nhau nhìn y hệt nhau (cùng mã, cùng giờ, cùng tuyến) như thể bị liệt kê trùng lặp.

**Đã sửa:** thêm hiển thị **ngày bay** (thứ + ngày/tháng/năm) ngay cạnh tên hãng bay trên mỗi thẻ kết quả, để phân biệt rõ các ngày khác nhau của cùng 1 số hiệu chuyến bay thay vì trông như bị trùng.

**Đã kiểm tra:** `tsc -b --noEmit`: 0 lỗi.

## 6.15. Lỗi 16 — Admin trả lời hỗ trợ khách hàng nhưng hiện thành tin nhắn của khách

**Yêu cầu:** bên khách hàng nhắn thì đúng chiều, nhưng khi admin trả lời, tin nhắn của admin lại hiện với nhãn/giao diện "Khách hàng" thay vì "Nhân viên hỗ trợ".

**Nguyên nhân:** backend lưu và trả đúng field `sender_role` (`backend/repositories/support_repo.py`, cột `sender_role` trong bảng `support_messages`) — đã kiểm tra trực tiếp qua API: tin nhắn khách trả `sender_role: "CUSTOMER"`, tin nhắn staff trả `sender_role: "STAFF"`, không hề có field `sender_type`. Nhưng **3 nơi ở frontend đều đọc nhầm field `sender_type`** (không tồn tại → luôn `undefined` → so sánh `=== 'STAFF'` luôn `false` → mọi tin nhắn, kể cả của admin/staff, đều hiện như tin nhắn khách hàng). Lỗi không chỉ ở trang admin mà còn ở cả 2 trang phía khách hàng (dùng chung field sai này).

**Đã sửa (đổi `sender_type` → `sender_role`):**
- `frontend/src/services/support.ts` (type `SupportMessage`)
- `frontend/src/pages/staff/tickets/index.tsx` (trang admin/nhân viên xem trong ảnh chụp lỗi)
- `frontend/src/pages/support/index.tsx` (trang hỗ trợ của khách hàng)
- `frontend/src/pages/profile/index.tsx` (khung xem hội thoại hỗ trợ trong hồ sơ khách hàng)

**Đã kiểm tra:** gọi API thật (tạo ticket + admin trả lời) trên backend local — xác nhận response trả đúng `sender_role: "CUSTOMER"` / `"STAFF"`, không có `sender_type`.

## 6.16. Lỗi 17 (và 15) — Tạo/tìm chuyến bay xong không thấy trong trang Admin dù tra cứu công khai vẫn ra

**Yêu cầu:** thêm chuyến bay mới (hoặc tra 1 mã chuyến bay có thật, VD `VN1997`) thì trang quản trị "Quản lý Chuyến bay" báo "Không tìm thấy dữ liệu", nhưng trang tra cứu công khai (Theo Dõi Tình Trạng Chuyến Bay) vẫn tìm ra bình thường.

**Nguyên nhân:** `frontend/src/pages/admin/flights/index.tsx` gọi `adminService.getFlights()` **không kèm tham số tìm kiếm** → chỉ tải đúng **20 dòng đầu** (trang 1). Backend sắp toàn bộ bảng `flights` theo `departure_time DESC` rồi mới cắt trang ở tầng Python (không giới hạn ở SQL). Ô tìm kiếm trên trang admin trước giờ chỉ lọc trên 20 dòng **đã tải sẵn** đó (dùng bộ lọc client-side có sẵn của bảng dữ liệu), không hề gọi lại server. Vì có job tự động `extend_flight_schedule` sinh chuyến bay đều đặn mỗi ngày trong 45 ngày × 14 tuyến, bảng `flights` có hàng nghìn dòng — gần như bất kỳ chuyến bay cụ thể nào (mới tạo, hoặc chuyến cũ đã bay xong) đều rơi ngoài 20 dòng đó nên tìm không ra, dù chuyến bay có thật. Cùng lỗi này ở 2 trang con `flights/detail` và `flights/edit` (cũng `getFlights().find(...)` trên cùng 20 dòng) — mở chi tiết/sửa 1 chuyến bay không nằm trong trang 1 sẽ báo "Không tìm thấy chuyến bay".

**Đã sửa tận gốc:**
- `backend/repositories/flight_repo.py`: `list_flights_admin` nhận thêm tham số `q` — tìm theo số hiệu chuyến bay, tên hãng bay, mã/tên sân bay đi-đến (LIKE, giống hệt cách `search_flight_status` đã làm cho trang tra cứu công khai). Thêm hàm `get_flight_admin(db, flight_id)` lấy đúng 1 chuyến bay theo ID (đầy đủ tên hãng/sân bay như trang danh sách).
- `backend/controllers/admin_controller.py`: route `GET /admin/flights` đọc thêm query `q`; thêm route mới `GET /admin/flights/{flight_id}` trả về 1 chuyến bay theo ID.
- `frontend/src/services/admin.ts`: `getFlights()` nhận thêm `q`; thêm hàm `getFlight(flightId)` gọi route mới.
- `frontend/src/pages/admin/flights/index.tsx`: ô tìm kiếm giờ gọi lại API thật (debounce 300ms) thay vì chỉ lọc trên 20 dòng đã tải.
- `frontend/src/pages/admin/flights/detail/index.tsx`, `frontend/src/pages/admin/flights/edit/index.tsx`: dùng `adminService.getFlight(id)` (lấy đúng 1 chuyến bay theo ID) thay vì tải danh sách rồi `.find()`.

**Phát hiện thêm khi rà toàn bộ trang admin (đúng yêu cầu kiểm tra rộng hơn):** trang **Quản lý Đặt vé** (`admin/bookings`) bị đúng lỗi kiến trúc y hệt (gọi `getBookings()` không tham số, ô tìm kiếm "Tìm mã PNR, tên hành khách, email..." chỉ lọc trên 20 dòng đầu) — đã sửa cùng cách: `backend/repositories/booking_repo.py` (`list_all_bookings` thêm `q`, tìm theo `pnr`/`contact_name`/`contact_email`), `backend/controllers/admin_controller.py` (route đọc thêm `q`), `frontend/src/services/admin.ts` (`getBookings()` thêm `q`), `frontend/src/pages/admin/bookings/index.tsx` (ô tìm kiếm gọi lại API thật). Các trang admin khác (`customers` đã có sẵn tìm kiếm server-side đúng cách; `airports`/`airlines`/`aircraft-types`/`staff` không phân trang, tải hết nên không dính lỗi này) không phát hiện thêm lỗi tương tự.

**Đã kiểm tra bằng cách gọi API thật trên backend local (không phải chỉ đọc code):** tạo 1 chuyến bay test mới (`ZT999`, SGN→SIN) → xác nhận **không** nằm trong 20 dòng mặc định (tái hiện đúng lỗi) → gọi `GET /admin/flights?q=ZT999` ra đúng chuyến vừa tạo → gọi `GET /admin/flights/{id}` (route mới) trả đúng dữ liệu đầy đủ → đã dọn (hủy) chuyến bay test sau khi kiểm tra xong. `tsc -b --noEmit`: 0 lỗi. Syntax Python cả 3 file backend đã sửa: hợp lệ.

**Chưa xác nhận bằng mắt trên trình duyệt thật** (không có công cụ trình duyệt trong phiên này) — bạn nên tự mở lại đúng kịch bản: tạo chuyến bay mới → tìm ngay trong "Quản lý Chuyến bay" bằng số hiệu vừa tạo; và mở 1 ticket hỗ trợ, trả lời với tài khoản admin/staff, xác nhận tin nhắn của admin hiện đúng bên phải/nhãn "Nhân viên hỗ trợ (Bạn)".

**Lưu ý về tiến độ vòng 5 cũ:** khi rà lại, thấy các fix lỗi 12/13/14/15/16 (mục 6.10–6.13, trước đây ghi "chưa commit, chưa push") **thực ra đã được commit** vào `main` (`29dacaf`, `1786263`) — có vẻ do phiên làm việc song song khác đã đẩy lên. Mục "5" ở phần "Việc còn lại" bên dưới vì vậy đã xong, không cần xác nhận deploy riêng nữa.

## 7. Việc còn lại / cần bạn làm

1. **Deploy đang bị chặn bởi lỗi hạ tầng, không phải code**: code đã lên GitHub `main` (commit `d3881b7`, `99bbe7d`) và **đã pass toàn bộ test/build**. Chỉ còn bước deploy thật lên server bị lỗi mạng khi kéo Docker image (mục 6.9) — **cần bạn hoặc người quản lý server `103.186.64.195` kiểm tra kết nối tới Docker Hub** (thử `docker pull python:3.12-slim` trực tiếp trên server, kiểm tra DNS/firewall/proxy), rồi vào GitHub Actions bấm "Re-run failed jobs" cho lần chạy mới nhất, hoặc mình chạy lại giúp khi bạn báo đã kiểm tra xong.
2. **Mở thử trên trình duyệt** sau khi deploy thành công để xác nhận bằng mắt, đặc biệt: luồng chọn chuyến đi → chuyến về cho vé khứ hồi (lỗi 4), một chiều chỉ chọn được 1 ngày (lỗi 6), bộ lọc bên trái hoạt động (lỗi 7), tra cứu PNR ra đúng vé (lỗi 8), tra cứu trạng thái chuyến bay theo số hiệu (lỗi 9), trang "Chuyến bay đã lưu" hiện đúng điểm đi/đến (lỗi 10).
3. **Dữ liệu chuyến bay trùng**: theo yêu cầu ở vòng 1, mình đã **dừng lại giữa chừng** — hiện còn khoảng **3513 dòng trùng chưa dọn** (đã dọn ~1974/5487) và **3 nhóm cần bạn tự xem xét thủ công** vì đã có khách đặt vé thật. Muốn dọn tiếp thì báo mình chạy lại script. (Lưu ý: dọn dữ liệu này cũng sẽ giúp lỗi 5 — giá theo ngày — trông tự nhiên hơn vì bớt lặp dữ liệu.)
4. (Tuỳ chọn) Sửa nốt các chỗ hard-code còn sót trong `FlightDetailModal.tsx` (loại tàu bay, khoảng cách bay luôn "721 mi"...) nếu bạn muốn đồng bộ hoàn toàn — phát hiện phụ, không nằm trong yêu cầu FIX.ipynb.
5. **Xác nhận cho phép deploy fix lỗi 12 & 13**: 2 fix này (mục 6.10, 6.11) hiện chỉ nằm ở máy local, **chưa commit, chưa push**. Riêng migration V4 (lỗi 13) sẽ xoá dữ liệu trùng thật trên production khi deploy — báo lại khi bạn đồng ý để tiến hành commit/push, và kiểm tra xem lỗi hạ tầng Docker Hub ở mục 6.9 đã được xử lý chưa trước khi deploy.
6. **Mở thử lịch chọn ngày khứ hồi** (lỗi 12 & 14) sau khi deploy: chọn 2 ngày (VD 17-18), **không đóng lịch**, bấm tiếp 1 ngày lớn hơn (VD 20) — xác nhận ngày đi đổi đúng, không còn "cố định". Thử luôn cả kịch bản cũ (đóng lịch rồi mở lại).
7. **Sau khi deploy fix lỗi 15/16**: theo dõi log backend production lần đầu khởi động lại — sẽ thấy job `extend_flight_schedule` chạy và tạo thêm rất nhiều chuyến bay (nối dài lịch từ mốc hiện có tới 45 ngày sau), có thể mất vài phút cho lần đầu. Sau đó thử tìm kiếm khứ hồi/một chiều cho ngày xa hơn 30/09/2026 (mốc cũ từng hết dữ liệu) để xác nhận không còn "hết vé" nữa.

## 8. Danh sách file đã thay đổi

**Vòng 1 (lỗi 1-3):**
- `frontend/src/types/flight.ts`
- `frontend/src/store/use-flight.ts`
- `frontend/src/components/flight/DateRangePickerPopover.tsx`
- `frontend/src/components/flight-results/CompactTopSearchBar.tsx`
- `frontend/src/pages/flight-results/index.tsx`
- `frontend/src/components/flight-results/DatePriceMatrix.tsx`
- `frontend/src/components/flight-results/FlightCard.tsx`
- `frontend/src/components/flight-results/FlightDetailDrawer.tsx`
- Dữ liệu (không phải file code): dọn bản ghi `flights`/`fares`/`fare_inventories`/`seats`/`seat_maps` bị nhân đôi trực tiếp trên MySQL production.

**Vòng 2 (lỗi 4-8 + yêu thích chuyến bay):**
- `frontend/src/pages/flight-results/index.tsx` (thêm luồng chọn chuyến đi/về, nối bộ lọc thật, sửa cách xác định một chiều/khứ hồi)
- `frontend/src/pages/review-trip/index.tsx` (nhận & hiển thị nhiều chặng bay, tạo giỏ hàng tạm nhiều chặng)
- `frontend/src/components/flight/DateRangePickerPopover.tsx` (chế độ chọn 1 ngày cho vé một chiều)
- `frontend/src/components/flight/BookingSearchCard.tsx` (không gửi ngày về khi một chiều)
- `frontend/src/components/flight-results/CompactTopSearchBar.tsx` (không gửi ngày về khi một chiều)
- `frontend/src/components/flight-results/FlightFilterSidebar.tsx` (viết lại thành bộ lọc thật)
- `frontend/src/components/flight-results/FlightDetailDrawer.tsx` (chữ nút xác nhận đổi theo ngữ cảnh)
- `frontend/src/services/booking.ts` (sửa `lookupBooking` GET→POST, đúng kiểu dữ liệu trả về)
- `frontend/src/pages/booking-lookup/index.tsx` (đọc đúng cấu trúc dữ liệu tra cứu PNR)
- `backend/repositories/user_repo.py` (nối bảng sân bay cho danh sách chuyến bay đã lưu)

**Vòng 3 (lỗi 9 & 10):**
- `backend/repositories/flight_repo.py` (API tra cứu chuyến bay công khai theo số hiệu/thành phố/hãng bay)
- `backend/services/flight_service.py` (service tương ứng)
- `backend/controllers/flight_controller.py` (route mới `GET /flights/status`)
- `frontend/src/services/flight.ts` (hàm gọi API `searchFlightStatus`, type `FlightStatusItem`)
- `frontend/src/pages/flight-status/index.tsx` (dùng đúng API tra cứu thay vì lọc tay trên danh sách luôn rỗng)
- `frontend/src/pages/saved-flights/index.tsx` (nút "Xem Giá Vé" gửi đúng điểm đi/đến + ngày bay thật)
- `frontend/src/pages/flight-results/index.tsx` (phòng vệ chống hiện chữ "undefined" khi link thiếu tham số)

**Vòng 4 (fix CI/pipeline, phát sinh khi đẩy code lên GitHub):**
- `backend/database/connection.py` (bỏ qua lỗi "duplicate key name" khi chạy lại migration nhiều lần — đang chặn toàn bộ pipeline test/deploy)

**Vòng 5 (lỗi 12, 13, 14, 15 & 16 — đã commit lên `main` bởi phiên khác, xem ghi chú ở mục 6.16):**
- `frontend/src/components/flight/DateRangePickerPopover.tsx` (tự đưa về "sửa ngày đi" mỗi lần mở lịch — lỗi 12; và ngay sau khi chọn xong 1 cặp ngày, kể cả chưa đóng lịch — lỗi 14)
- `backend/database/migrations/V4__dedupe_flights_and_prevent_recurrence.sql` (dọn nốt chuyến bay trùng còn sót + thêm ràng buộc chống trùng vĩnh viễn — lỗi 13)
- `backend/services/flight_schedule_service.py` (mới — hàm dùng chung tạo/nối dài lịch bay theo ngày — lỗi 15/16)
- `backend/database/seed.py` (bỏ danh sách chuyến bay gõ tay theo ngày lệch, gọi hàm dùng chung ở trên — lỗi 15/16)
- `backend/services/background_jobs.py` (job mới `extend_flight_schedule`, tự nối dài lịch bay mỗi 6h — lỗi 15/16)
- `backend/main.py` (đăng ký job `extend_flight_schedule` vào scheduler)
- `frontend/src/pages/flight-status/index.tsx` (hiện thêm ngày bay trên thẻ kết quả — tránh nhìn như trùng lặp khi 1 mã chuyến bay có nhiều ngày)

**Vòng 6 (lỗi 16 "chat hiện sai chiều" & lỗi 17/15 "chuyến bay admin tìm không ra" — chưa commit/push):**
- `frontend/src/services/support.ts` (type `SupportMessage`: `sender_type` → `sender_role` — lỗi 16)
- `frontend/src/pages/staff/tickets/index.tsx` (đọc đúng `sender_role` để phân biệt tin nhắn admin/khách — lỗi 16)
- `frontend/src/pages/support/index.tsx`, `frontend/src/pages/profile/index.tsx` (cùng lỗi field sai, ảnh hưởng cả phía khách hàng — lỗi 16)
- `backend/repositories/flight_repo.py` (`list_flights_admin` thêm tìm kiếm `q` thật; hàm mới `get_flight_admin` lấy 1 chuyến bay theo ID — lỗi 17)
- `backend/controllers/admin_controller.py` (route `GET /admin/flights` nhận `q`; route mới `GET /admin/flights/{flight_id}` — lỗi 17)
- `frontend/src/services/admin.ts` (`getFlights`/`getBookings` nhận `q`; hàm mới `getFlight(id)` — lỗi 17)
- `frontend/src/pages/admin/flights/index.tsx` (ô tìm kiếm gọi API thật thay vì lọc trên 20 dòng đã tải — lỗi 17)
- `frontend/src/pages/admin/flights/detail/index.tsx`, `frontend/src/pages/admin/flights/edit/index.tsx` (dùng `getFlight(id)` thay vì tải danh sách rồi `.find()` — lỗi 17)
- `backend/repositories/booking_repo.py` (`list_all_bookings` thêm tìm kiếm `q` thật — phát hiện thêm, cùng lỗi kiến trúc với lỗi 17)
- `frontend/src/pages/admin/bookings/index.tsx` (ô tìm kiếm gọi API thật — phát hiện thêm)
