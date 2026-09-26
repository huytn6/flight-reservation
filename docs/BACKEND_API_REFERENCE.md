# Backend API Reference

Tài liệu này tập trung mô tả chức năng backend API của hệ thống Online Flight Booking, bao gồm mục đích từng nhóm chức năng và danh mục endpoint hiện có.

## Thông Tin API

- Base URL mặc định: `http://localhost:8000/api/v1`.
- Tất cả path bên dưới đều được gọi với prefix `/api/v1`.
- Các API ghi dữ liệu nhận JSON body.
- Các API danh sách thường hỗ trợ query `page`, `page_size` hoặc filter tùy controller.
- `Idempotency-Key` dùng cho workflow quan trọng như booking/payment để tránh tạo trùng khi retry.

## Chuẩn Request

Header xác thực:

```http
Authorization: Bearer <token>
Content-Type: application/json
Idempotency-Key: <optional-key>
```

## Phân Quyền

- `Public`: không cần đăng nhập.
- `Auth`: cần đăng nhập bằng bearer token.
- `Staff`: cần role `STAFF` hoặc quyền nhân viên tương ứng.
- `Admin`: cần role `ADMIN`.

## Nhóm Chức Năng Backend API

### 1. Account & Authentication

- Đăng ký, đăng nhập, đăng xuất, refresh token.
- Xem thông tin tài khoản đang đăng nhập.
- Quên mật khẩu, reset mật khẩu, đổi mật khẩu.
- Quản lý session đăng nhập.
- Quản lý saved passengers.

### 2. Flight Search & Flight Catalog

- Tra cứu sân bay, hãng bay, cabin class, quốc gia, tiền tệ.
- Tìm kiếm chuyến bay.
- Flexible dates, price calendar, weekly prices.
- Xem offer, segment, fare option, fare rule, baggage.
- Lưu và bỏ lưu chuyến bay.

### 3. Booking Draft / Checkout

- Tạo booking draft từ flight/fare đã chọn.
- Lưu contact, passengers.
- Reprice draft.
- Giữ ghế, đổi ghế giữ, nhả ghế.
- Thêm ancillary, insurance, coupon.
- Xem price breakdown và summary.

### 4. Booking Management

- Tạo booking từ draft.
- Xem booking, itinerary, e-ticket, receipt.
- Lookup booking bằng PNR.
- Gửi lại confirmation/documents.
- Hủy booking, xem cancellation/refund.
- Đổi chuyến bay, đổi ghế sau booking.
- Theo dõi check-in link, flight status, travel alerts.

### 5. Payment & Refund

- Tạo payment cho booking.
- Xem payment.
- Mô phỏng thanh toán thành công/thất bại.
- Retry payment.
- Xem payment transactions.
- Tạo và xem refund.

### 6. Price Alerts & Notifications

- Tạo, xem, cập nhật, xóa price alert.
- Lưu lịch sử giá đã kiểm tra.
- Scheduler kiểm tra price alert nền.
- Xem notification, đánh dấu đã đọc, cấu hình travel alert preferences.

### 7. Support & Reviews

- Customer tạo support ticket, nhắn tin, đóng ticket.
- Staff xử lý ticket, đổi status, assign, reply.
- Customer tạo review cho booking/airline.
- Cập nhật/xóa/report review.

### 8. Staff Operations

- Staff tra cứu và xử lý booking.
- Staff cập nhật contact/passenger, đổi ghế, hủy booking.
- Staff thêm note và xem lịch sử booking.
- Staff xử lý support ticket.

### 9. Admin Operations

- Quản lý customer, staff, role, status.
- Quản lý airports, airlines, aircraft types, flights, fares, seat maps.
- Quản lý bookings, payments, refunds.
- Quản lý coupons, contents.
- Xem dashboard summary, bookings, revenue, flights.
- Xem audit logs.

## Chi Tiết API

### Auth

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| POST | `/auth/register` | Public | Đăng ký tài khoản. Body: `email`, `password`, `full_name`. |
| POST | `/auth/login` | Public | Đăng nhập. Body: `email`, `password`. |
| POST | `/auth/logout` | Auth | Đăng xuất session hiện tại. |
| POST | `/auth/refresh` | Auth | Refresh token/session. |
| GET | `/auth/me` | Auth | Lấy thông tin user hiện tại. |
| POST | `/auth/forgot-password` | Public | Tạo reset token mô phỏng. Body: `email`. |
| POST | `/auth/reset-password` | Public | Reset mật khẩu. Body: `token`, `new_password`. |
| PUT | `/auth/change-password` | Auth | Đổi mật khẩu. Body: `old_password`, `new_password`. |

### User

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| GET | `/users/me` | Auth | Xem hồ sơ cá nhân. |
| PATCH | `/users/me` | Auth | Cập nhật hồ sơ cá nhân. |
| GET | `/users/me/sessions` | Auth | Danh sách session đang hoạt động. |
| DELETE | `/users/me/sessions/{session_id}` | Auth | Thu hồi một session. |
| GET | `/users/me/saved-passengers` | Auth | Danh sách hành khách đã lưu. |
| POST | `/users/me/saved-passengers` | Auth | Thêm hành khách đã lưu. |
| PATCH | `/users/me/saved-passengers/{pid}` | Auth | Cập nhật hành khách đã lưu. |
| DELETE | `/users/me/saved-passengers/{pid}` | Auth | Xóa hành khách đã lưu. |

### Airport, Airline, Config

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| GET | `/airports` | Public | Danh sách sân bay, hỗ trợ query/pagination. |
| GET | `/airports/autocomplete` | Public | Gợi ý sân bay theo từ khóa `q`. |
| GET | `/airports/nearby` | Public | Tìm sân bay gần tọa độ `lat`, `lng`. |
| GET | `/airports/{airport_id}` | Public | Chi tiết sân bay. |
| GET | `/airlines` | Public | Danh sách hãng bay. |
| GET | `/airlines/{airline_id}` | Public | Chi tiết hãng bay. |
| GET | `/cabin-classes` | Public | Danh sách cabin class. |
| GET | `/config/countries` | Public | Danh sách quốc gia hỗ trợ. |
| GET | `/config/currencies` | Public | Danh sách tiền tệ hỗ trợ. |
| GET | `/config/payment-methods` | Public | Danh sách phương thức thanh toán mô phỏng. |

### Flights, Offers, Fares

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| POST | `/flights/search` | Public | Tìm kiếm chuyến bay theo origin/destination/date/passengers. |
| GET | `/flights/flexible-dates` | Public | Tìm giá theo ngày linh hoạt. |
| GET | `/flights/price-calendar` | Public | Lịch giá theo khoảng ngày. |
| GET | `/flights/weekly-prices` | Public | Giá theo tuần. |
| GET | `/flight-offers/{flight_id}` | Public | Chi tiết flight offer. |
| POST | `/flight-offers/{flight_id}/reprice` | Public | Reprice offer. |
| GET | `/flight-offers/{flight_id}/segments` | Public | Danh sách segment của offer. |
| GET | `/flight-offers/{flight_id}/fare-options` | Public | Các fare option của chuyến bay. |
| GET | `/flight-offers/{flight_id}/fare-comparison` | Public | So sánh fare. |
| GET | `/fares/{fare_id}` | Public | Chi tiết fare. |
| GET | `/fares/{fare_id}/rules` | Public | Fare rules. |
| GET | `/fares/{fare_id}/baggage` | Public | Quy định hành lý. |
| GET | `/users/me/saved-flights` | Auth | Danh sách chuyến bay đã lưu. |
| POST | `/users/me/saved-flights` | Auth | Lưu chuyến bay. Body: `flight_id`. |
| DELETE | `/users/me/saved-flights/{saved_id}` | Auth | Bỏ lưu chuyến bay. |

### Booking Drafts

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| POST | `/booking-drafts` | Auth | Tạo draft. Body: `flights`. |
| GET | `/booking-drafts/{draft_id}` | Auth | Chi tiết draft. |
| DELETE | `/booking-drafts/{draft_id}` | Auth | Hủy draft. |
| POST | `/booking-drafts/{draft_id}/reprice` | Auth | Reprice draft. |
| GET | `/booking-drafts/{draft_id}/summary` | Auth | Tóm tắt draft. |
| PUT | `/booking-drafts/{draft_id}/contact` | Auth | Lưu contact. Body: `full_name`, `email`, `phone`. |
| GET | `/booking-drafts/{draft_id}/passengers` | Auth | Danh sách passengers trong draft. |
| PUT | `/booking-drafts/{draft_id}/passengers` | Auth | Lưu passengers. |
| GET | `/booking-drafts/{draft_id}/segments/{segment_id}/seat-map` | Auth | Seat map cho segment. |
| GET | `/booking-drafts/{draft_id}/seat-holds` | Auth | Danh sách seat hold. |
| POST | `/booking-drafts/{draft_id}/seat-holds` | Auth | Giữ ghế. Body: `seat_id`, `passenger_index`. |
| PATCH | `/booking-drafts/{draft_id}/seat-holds/{hold_id}` | Auth | Đổi ghế đang giữ. |
| DELETE | `/booking-drafts/{draft_id}/seat-holds/{hold_id}` | Auth | Nhả ghế đang giữ. |
| GET | `/booking-drafts/{draft_id}/ancillaries` | Auth | Danh sách ancillary. |
| POST | `/booking-drafts/{draft_id}/ancillaries` | Auth | Thêm ancillary. |
| PATCH | `/booking-drafts/{draft_id}/ancillaries/{item_id}` | Auth | Cập nhật ancillary. |
| DELETE | `/booking-drafts/{draft_id}/ancillaries/{item_id}` | Auth | Xóa ancillary. |
| GET | `/booking-drafts/{draft_id}/insurance-options` | Auth | Danh sách gói bảo hiểm. |
| POST | `/booking-drafts/{draft_id}/insurance` | Auth | Thêm bảo hiểm. Body: `plan_code`. |
| DELETE | `/booking-drafts/{draft_id}/insurance` | Auth | Xóa bảo hiểm. |
| GET | `/booking-drafts/{draft_id}/price-breakdown` | Auth | Chi tiết giá. |
| POST | `/booking-drafts/{draft_id}/coupons` | Auth | Áp coupon. Body: `code`. |
| DELETE | `/booking-drafts/{draft_id}/coupons/{code}` | Auth | Gỡ coupon. |

### Bookings

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| POST | `/bookings` | Auth | Tạo booking từ draft. Body: `draft_id`. |
| GET | `/bookings/{booking_id}` | Auth | Chi tiết booking. |
| GET | `/users/me/bookings` | Auth | Danh sách booking của user hiện tại. |
| GET | `/users/me/bookings/{booking_id}` | Auth | Chi tiết booking của user hiện tại. |
| GET | `/users/me/bookings/{booking_id}/history` | Auth | Lịch sử trạng thái booking. |
| GET | `/users/me/bookings/{booking_id}/printable` | Auth | Bản in booking. |
| POST | `/users/me/bookings/{booking_id}/resend-confirmation` | Auth | Gửi lại confirmation mô phỏng. |
| POST | `/bookings/lookup` | Public | Lookup bằng PNR và last name. Body: `pnr`, `last_name`. |
| GET | `/bookings/{booking_id}/itinerary` | Auth | Itinerary. |
| GET | `/bookings/{booking_id}/e-tickets` | Auth | Danh sách e-ticket. |
| GET | `/bookings/{booking_id}/e-tickets/{ticket_id}` | Auth | Chi tiết e-ticket. |
| GET | `/bookings/{booking_id}/receipt` | Auth | Receipt. |
| POST | `/bookings/{booking_id}/documents/send-email` | Auth | Gửi documents qua email mô phỏng. |
| POST | `/users/me/bookings/{booking_id}/cancellation-preview` | Auth | Xem trước hủy booking. |
| POST | `/users/me/bookings/{booking_id}/cancel` | Auth | Hủy booking. |
| GET | `/users/me/bookings/{booking_id}/cancellation` | Auth | Chi tiết cancellation. |
| GET | `/bookings/{booking_id}/refund-preview` | Auth | Xem trước refund. |
| POST | `/bookings/{booking_id}/refunds` | Auth | Tạo refund request. |
| GET | `/bookings/{booking_id}/refunds` | Auth | Danh sách refund của booking. |
| GET | `/refunds/{refund_id}` | Auth | Chi tiết refund. |
| GET | `/bookings/{booking_id}/check-in` | Auth | Link check-in mô phỏng. |
| GET | `/bookings/{booking_id}/flight-status` | Auth | Trạng thái chuyến bay trong booking. |
| GET | `/bookings/{booking_id}/travel-alerts` | Auth | Travel alerts của booking. |
| POST | `/users/me/bookings/{booking_id}/change-search` | Auth | Tìm phương án đổi chuyến. |
| POST | `/users/me/bookings/{booking_id}/change-quote` | Auth | Báo giá đổi chuyến. Body: `new_fare_id`. |
| POST | `/users/me/bookings/{booking_id}/change-confirm` | Auth | Xác nhận đổi chuyến. Body: `new_fare_id`, `new_flight_id`. |
| GET | `/users/me/bookings/{booking_id}/change-status` | Auth | Trạng thái đổi chuyến. |
| GET | `/users/me/bookings/{booking_id}/segments/{segment_id}/seat-map` | Auth | Seat map sau booking. |
| POST | `/users/me/bookings/{booking_id}/seat-change-preview` | Auth | Xem trước đổi ghế. |
| POST | `/users/me/bookings/{booking_id}/seat-change-confirm` | Auth | Xác nhận đổi ghế. Body: `segment_id`, `passenger_id`, `new_seat_id`. |

### Payments

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| POST | `/bookings/{booking_id}/payments` | Auth | Tạo payment. Body: `payment_method`. |
| GET | `/payments/{payment_id}` | Auth | Chi tiết payment. |
| POST | `/payments/{payment_id}/simulate-success` | Auth | Mô phỏng thanh toán thành công. |
| POST | `/payments/{payment_id}/simulate-failure` | Auth | Mô phỏng thanh toán thất bại. |
| POST | `/payments/{payment_id}/retry` | Auth | Retry payment. |
| GET | `/payments/{payment_id}/transactions` | Auth | Payment transactions. |

### Price Alerts

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| GET | `/users/me/price-alerts` | Auth | Danh sách price alert. |
| POST | `/users/me/price-alerts` | Auth | Tạo price alert. Body: `origin_iata`, `destination_iata`, `departure_date`. |
| GET | `/users/me/price-alerts/{alert_id}` | Auth | Chi tiết price alert. |
| PATCH | `/users/me/price-alerts/{alert_id}` | Auth | Cập nhật price alert. |
| DELETE | `/users/me/price-alerts/{alert_id}` | Auth | Xóa price alert. |
| GET | `/users/me/price-alerts/{alert_id}/history` | Auth | Lịch sử giá của alert. |

### Notifications

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| GET | `/users/me/notifications` | Auth | Danh sách notification. |
| GET | `/users/me/notifications/unread-count` | Auth | Số notification chưa đọc. |
| PATCH | `/users/me/notifications/{notif_id}/read` | Auth | Đánh dấu đã đọc. |
| POST | `/users/me/notifications/read-all` | Auth | Đánh dấu tất cả đã đọc. |
| GET | `/users/me/travel-alert-preferences` | Auth | Xem cấu hình travel alert. |
| PATCH | `/users/me/travel-alert-preferences` | Auth | Cập nhật cấu hình travel alert. |

### Support

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| POST | `/support/tickets` | Auth | Tạo support ticket. Body: `subject`. |
| GET | `/users/me/support/tickets` | Auth | Ticket của user hiện tại. |
| GET | `/users/me/support/tickets/{ticket_id}` | Auth | Chi tiết ticket. |
| POST | `/users/me/support/tickets/{ticket_id}/messages` | Auth | Gửi message vào ticket. Body: `body`. |
| POST | `/users/me/support/tickets/{ticket_id}/close` | Auth | Đóng ticket. |

### Reviews

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| GET | `/airlines/{airline_id}/reviews` | Public | Danh sách review của airline. |
| POST | `/bookings/{booking_id}/reviews` | Auth | Tạo review. Body: `airline_id`, `rating`. |
| PATCH | `/reviews/{review_id}` | Auth | Cập nhật review. |
| DELETE | `/reviews/{review_id}` | Auth | Xóa review. |
| POST | `/reviews/{review_id}/reports` | Auth | Report review. Body: `reason`. |

### Staff

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| GET | `/staff/bookings` | Staff | Danh sách booking cho staff. |
| GET | `/staff/bookings/{booking_id}` | Staff | Chi tiết booking cho staff. |
| POST | `/staff/booking-drafts` | Staff | Tạo draft thay khách. |
| POST | `/staff/bookings` | Staff | Tạo booking thay khách. |
| PATCH | `/staff/bookings/{booking_id}/contact` | Staff | Cập nhật contact. |
| PATCH | `/staff/bookings/{booking_id}/passengers/{passenger_id}` | Staff | Cập nhật passenger. |
| POST | `/staff/bookings/{booking_id}/change-seat` | Staff | Đổi ghế cho booking. |
| POST | `/staff/bookings/{booking_id}/cancel` | Staff | Hủy booking. |
| POST | `/staff/bookings/{booking_id}/notes` | Staff | Thêm note. Body: `note`. |
| GET | `/staff/bookings/{booking_id}/notes` | Staff | Danh sách note. |
| GET | `/staff/bookings/{booking_id}/history` | Staff | Lịch sử booking. |
| GET | `/staff/support/tickets` | Staff | Danh sách support ticket. |
| GET | `/staff/support/tickets/{ticket_id}` | Staff | Chi tiết support ticket. |
| PATCH | `/staff/support/tickets/{ticket_id}/status` | Staff | Cập nhật status ticket. Body: `status`. |
| POST | `/staff/support/tickets/{ticket_id}/messages` | Staff | Staff reply ticket. Body: `body`. |
| POST | `/staff/support/tickets/{ticket_id}/assign` | Staff | Assign ticket. |

### Admin: Users & Staff

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| GET | `/admin/customers` | Admin | Danh sách customer. |
| GET | `/admin/customers/{user_id}` | Admin | Chi tiết customer. |
| PATCH | `/admin/customers/{user_id}/status` | Admin | Cập nhật status customer. Body: `status`. |
| GET | `/admin/staff` | Admin | Danh sách staff. |
| POST | `/admin/staff` | Admin | Tạo staff. Body: `email`, `password`, `full_name`. |
| GET | `/admin/staff/{user_id}` | Admin | Chi tiết staff. |
| PATCH | `/admin/staff/{user_id}` | Admin | Cập nhật staff. |
| PATCH | `/admin/staff/{user_id}/status` | Admin | Cập nhật status staff. |
| PUT | `/admin/staff/{user_id}/roles` | Admin | Cập nhật role staff/admin. Body: `role`. |

### Admin: Flight Data

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| GET | `/admin/airports` | Admin | Danh sách airports. |
| POST | `/admin/airports` | Admin | Tạo airport. Body: `iata_code`, `name`, `city`, `country`, `country_code`, `timezone`. |
| PATCH | `/admin/airports/{airport_id}` | Admin | Cập nhật airport. |
| DELETE | `/admin/airports/{airport_id}` | Admin | Xóa airport. |
| GET | `/admin/airlines` | Admin | Danh sách airlines. |
| POST | `/admin/airlines` | Admin | Tạo airline. Body: `iata_code`, `name`. |
| PATCH | `/admin/airlines/{airline_id}` | Admin | Cập nhật airline. |
| DELETE | `/admin/airlines/{airline_id}` | Admin | Xóa airline. |
| GET | `/admin/aircraft-types` | Admin | Danh sách aircraft types. |
| POST | `/admin/aircraft-types` | Admin | Tạo aircraft type. Body: `iata_code`, `name`. |
| PATCH | `/admin/aircraft-types/{at_id}` | Admin | Cập nhật aircraft type. |
| DELETE | `/admin/aircraft-types/{at_id}` | Admin | Xóa aircraft type. |
| GET | `/admin/flights` | Admin | Danh sách flights. |
| POST | `/admin/flights` | Admin | Tạo flight. Body chính: `flight_number`, `airline_id`, `departure_airport_id`, `arrival_airport_id`, `departure_time`, `arrival_time`, `duration_minutes`. |
| PATCH | `/admin/flights/{flight_id}` | Admin | Cập nhật flight. |
| DELETE | `/admin/flights/{flight_id}` | Admin | Hủy/xóa flight. |
| PATCH | `/admin/flights/{flight_id}/status` | Admin | Cập nhật status flight. Body: `status`. |
| GET | `/admin/flights/{flight_id}/fares` | Admin | Danh sách fare của flight. |
| POST | `/admin/flights/{flight_id}/fares` | Admin | Tạo fare. Body: `cabin_class_id`, `fare_code`, `fare_name`, `base_price`. |
| PATCH | `/admin/fares/{fare_id}` | Admin | Cập nhật fare. |
| DELETE | `/admin/fares/{fare_id}` | Admin | Xóa fare. |
| GET | `/admin/flights/{flight_id}/seat-map` | Admin | Xem seat map. |
| PUT | `/admin/flights/{flight_id}/seat-map` | Admin | Cập nhật seat map. Body: `layout`. |
| PATCH | `/admin/flights/{flight_id}/seats/{seat_id}` | Admin | Cập nhật seat. |

### Admin: Booking, Payment, Refund

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| GET | `/admin/bookings` | Admin | Danh sách booking. |
| GET | `/admin/bookings/{booking_id}` | Admin | Chi tiết booking. |
| PATCH | `/admin/bookings/{booking_id}/status` | Admin | Cập nhật status booking. Body: `status`. |
| POST | `/admin/bookings/{booking_id}/cancel` | Admin | Admin hủy booking. |
| GET | `/admin/payments` | Admin | Danh sách payment. |
| GET | `/admin/payments/{payment_id}` | Admin | Chi tiết payment. |
| PATCH | `/admin/payments/{payment_id}/status` | Admin | Cập nhật payment status. Body: `status`. |
| GET | `/admin/refunds` | Admin | Danh sách refund. |
| GET | `/admin/refunds/{refund_id}` | Admin | Chi tiết refund. |
| PATCH | `/admin/refunds/{refund_id}` | Admin | Cập nhật refund status. Body: `status`. |

### Admin: Coupon, Content, Dashboard

| Method | Path | Quyền | Mục đích |
|---|---|---:|---|
| GET | `/admin/coupons` | Admin | Danh sách coupon. |
| POST | `/admin/coupons` | Admin | Tạo coupon. Body: `code`, `discount_type`, `discount_value`, `valid_from`, `valid_until`. |
| GET | `/admin/coupons/{coupon_id}` | Admin | Chi tiết coupon. |
| PATCH | `/admin/coupons/{coupon_id}` | Admin | Cập nhật coupon. |
| DELETE | `/admin/coupons/{coupon_id}` | Admin | Disable coupon. |
| GET | `/admin/contents` | Admin | Danh sách content. |
| POST | `/admin/contents` | Admin | Tạo content. Body: `key`, `title`, `body`. |
| GET | `/admin/contents/{content_id}` | Admin | Chi tiết content. |
| PATCH | `/admin/contents/{content_id}` | Admin | Cập nhật content. |
| DELETE | `/admin/contents/{content_id}` | Admin | Xóa content. |
| GET | `/admin/dashboard/summary` | Admin | Dashboard summary. |
| GET | `/admin/dashboard/bookings` | Admin | Dashboard booking metrics. |
| GET | `/admin/dashboard/revenue` | Admin | Dashboard revenue metrics. |
| GET | `/admin/dashboard/flights` | Admin | Dashboard flight metrics. |
| GET | `/admin/audit-logs` | Admin | Danh sách audit logs. |
