import {
  BookingStatusEnum,
  PaymentStatusEnum,
  PaymentMethodEnum,
  FlightStatusEnum,
  UserStatusEnum,
  UserRoleEnum,
  TicketStatusEnum,
  TicketCategoryEnum,
  SeatStatusEnum,
  DraftStatusEnum,
  CabinClassEnum,
  GenderEnum,
  CouponStatusEnum,
  AuditActionEnum,
  AuditActionCategoryEnum,
} from '@/types/enums';

export interface StatusConfig {
  label: string;
  className: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

// 1. Booking Status Config
export const BOOKING_STATUS_CONFIG: Record<string, StatusConfig> = {
  [BookingStatusEnum.CONFIRMED]: {
    label: 'Đã xác nhận',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    variant: 'secondary',
  },
  [BookingStatusEnum.PENDING]: {
    label: 'Chờ thanh toán',
    className: 'bg-amber-50 text-amber-700 border-amber-200/80',
    variant: 'secondary',
  },
  [BookingStatusEnum.PENDING_PAYMENT]: {
    label: 'Chờ thanh toán',
    className: 'bg-amber-50 text-amber-700 border-amber-200/80',
    variant: 'secondary',
  },
  [BookingStatusEnum.PAYMENT_PROCESSING]: {
    label: 'Đang xử lý thanh toán',
    className: 'bg-blue-50 text-blue-700 border-blue-200/80',
    variant: 'secondary',
  },
  [BookingStatusEnum.PAYMENT_FAILED]: {
    label: 'Thanh toán thất bại',
    className: 'bg-rose-50 text-rose-700 border-rose-200/80',
    variant: 'secondary',
  },
  [BookingStatusEnum.CANCELLED]: {
    label: 'Đã hủy',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    variant: 'outline',
  },
  [BookingStatusEnum.COMPLETED]: {
    label: 'Hoàn thành',
    className: 'bg-sky-50 text-sky-700 border-sky-200/80',
    variant: 'secondary',
  },
};

export const getBookingStatusConfig = (status?: string | null): StatusConfig => {
  if (!status) return { label: 'Không rõ', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  return BOOKING_STATUS_CONFIG[status] || { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' };
};

// 2. Payment Status Config
export const PAYMENT_STATUS_CONFIG: Record<string, StatusConfig> = {
  [PaymentStatusEnum.SUCCESS]: {
    label: 'Thành công',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  [PaymentStatusEnum.PENDING]: {
    label: 'Đang chờ',
    className: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
  [PaymentStatusEnum.PROCESSING]: {
    label: 'Đang xử lý',
    className: 'bg-blue-50 text-blue-700 border-blue-200/80',
  },
  [PaymentStatusEnum.FAILED]: {
    label: 'Thất bại',
    className: 'bg-rose-50 text-rose-700 border-rose-200/80',
  },
  [PaymentStatusEnum.REFUNDED]: {
    label: 'Đã hoàn tiền',
    className: 'bg-purple-50 text-purple-700 border-purple-200/80',
  },
};

export const getPaymentStatusConfig = (status?: string | null): StatusConfig => {
  if (!status) return { label: 'Chưa thanh toán', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  return PAYMENT_STATUS_CONFIG[status] || { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' };
};

// 3. Flight Status Config
export const FLIGHT_STATUS_CONFIG: Record<string, StatusConfig> = {
  [FlightStatusEnum.SCHEDULED]: {
    label: 'Đúng lịch khởi hành',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  [FlightStatusEnum.DELAYED]: {
    label: 'Bị hoãn chuyến',
    className: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
  [FlightStatusEnum.CANCELLED]: {
    label: 'Hủy chuyến',
    className: 'bg-rose-50 text-rose-700 border-rose-200/80',
  },
  [FlightStatusEnum.IN_FLIGHT]: {
    label: 'Đang trên không',
    className: 'bg-blue-50 text-blue-700 border-blue-200/80',
  },
  [FlightStatusEnum.LANDED]: {
    label: 'Đã hạ cánh',
    className: 'bg-sky-50 text-sky-700 border-sky-200/80',
  },
  [FlightStatusEnum.COMPLETED]: {
    label: 'Hoàn tất lịch trình',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export const getFlightStatusConfig = (status?: string | null): StatusConfig => {
  if (!status) return { label: 'Đang cập nhật', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  return FLIGHT_STATUS_CONFIG[status] || { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' };
};

// 4. User Status Config
export const USER_STATUS_CONFIG: Record<string, StatusConfig> = {
  [UserStatusEnum.ACTIVE]: {
    label: 'Đang hoạt động',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  [UserStatusEnum.INACTIVE]: {
    label: 'Ngừng hoạt động',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  [UserStatusEnum.BANNED]: {
    label: 'Đã bị khóa',
    className: 'bg-rose-50 text-rose-700 border-rose-200/80',
  },
  [UserStatusEnum.BLOCKED]: {
    label: 'Đã chặn',
    className: 'bg-rose-50 text-rose-700 border-rose-200/80',
  },
  [UserStatusEnum.SUSPENDED]: {
    label: 'Tạm đình chỉ',
    className: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
};

export const getUserStatusConfig = (status?: string | null): StatusConfig => {
  if (!status) return { label: 'Không rõ', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  return USER_STATUS_CONFIG[status] || { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' };
};

// 5. User Role Config
export const USER_ROLE_CONFIG: Record<string, StatusConfig> = {
  [UserRoleEnum.ADMIN]: {
    label: 'Quản trị viên (Admin)',
    className: 'bg-purple-50 text-purple-700 border-purple-200/80',
  },
  [UserRoleEnum.STAFF]: {
    label: 'Nhân viên dịch vụ',
    className: 'bg-blue-50 text-blue-700 border-blue-200/80',
  },
  [UserRoleEnum.CUSTOMER]: {
    label: 'Khách hàng',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export const getUserRoleConfig = (role?: string | null): StatusConfig => {
  if (!role) return { label: 'Khách', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  return USER_ROLE_CONFIG[role] || { label: role, className: 'bg-slate-100 text-slate-700 border-slate-200' };
};

// 6. Support Ticket Status Config
export const TICKET_STATUS_CONFIG: Record<string, StatusConfig> = {
  [TicketStatusEnum.OPEN]: {
    label: 'Mới khởi tạo',
    className: 'bg-blue-50 text-blue-700 border-blue-200/80',
  },
  [TicketStatusEnum.IN_PROGRESS]: {
    label: 'Đang xử lý',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  [TicketStatusEnum.WAITING_CUSTOMER]: {
    label: 'Chờ khách phản hồi',
    className: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
  [TicketStatusEnum.RESOLVED]: {
    label: 'Đã giải quyết',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  [TicketStatusEnum.CLOSED]: {
    label: 'Đã đóng',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export const getTicketStatusConfig = (status?: string | null): StatusConfig => {
  if (!status) return { label: 'Không rõ', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  return TICKET_STATUS_CONFIG[status] || { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' };
};

// 7. Ticket Category Labels
export const getTicketCategoryLabel = (category?: string | null): string => {
  switch (category) {
    case TicketCategoryEnum.BOOKING: return 'Đặt vé & Lịch trình';
    case TicketCategoryEnum.REFUND: return 'Hoàn vé & Thanh toán';
    case TicketCategoryEnum.BAGGAGE: return 'Hành lý & Dịch vụ';
    default: return 'Khác';
  }
};

// 8. Payment Method Labels
export const getPaymentMethodLabel = (method?: string | null): string => {
  switch (method) {
    case PaymentMethodEnum.CARD: return 'Thẻ quốc tế (Visa / Mastercard)';
    case PaymentMethodEnum.MOMO: return 'Ví MoMo';
    case PaymentMethodEnum.BANK_TRANSFER: return 'Chuyển khoản ngân hàng (VietQR)';
    case PaymentMethodEnum.VNPAY: return 'Cổng VNPAY QR';
    case PaymentMethodEnum.PAYPAL: return 'Ví PayPal';
    default: return method || 'Chưa chọn';
  }
};

// 9. Cabin Class Labels
export const getCabinClassLabel = (cabin?: string | null): string => {
  switch (cabin) {
    case CabinClassEnum.ECONOMY: return 'Phổ thông (Economy)';
    case CabinClassEnum.PREMIUM_ECONOMY: return 'Phổ thông đặc biệt (Premium Economy)';
    case CabinClassEnum.BUSINESS: return 'Thương gia (Business)';
    case CabinClassEnum.FIRST: return 'Hạng nhất (First Class)';
    default: return cabin || 'Phổ thông';
  }
};

// 10. Gender Labels
export const getGenderLabel = (gender?: string | null): string => {
  switch (gender) {
    case GenderEnum.MALE: return 'Nam';
    case GenderEnum.FEMALE: return 'Nữ';
    default: return 'Khác';
  }
};

// 11. Seat Status Config
export const SEAT_STATUS_CONFIG: Record<string, StatusConfig> = {
  [SeatStatusEnum.AVAILABLE]: {
    label: 'Còn trống',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  [SeatStatusEnum.HELD]: {
    label: 'Đang giữ chỗ',
    className: 'bg-amber-50 text-amber-700 border-amber-300',
  },
  [SeatStatusEnum.BOOKED]: {
    label: 'Đã đặt',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  [SeatStatusEnum.BLOCKED]: {
    label: 'Khóa ghế',
    className: 'bg-slate-200 text-slate-500 border-slate-300',
  },
  [SeatStatusEnum.SELECTED]: {
    label: 'Ghế bạn chọn',
    className: 'bg-blue-600 text-white border-blue-600',
  },
};

export const getSeatStatusConfig = (status?: string | null): StatusConfig => {
  if (!status) return { label: 'Còn trống', className: 'bg-slate-100 text-slate-700 border-slate-300' };
  return SEAT_STATUS_CONFIG[status] || { label: status, className: 'bg-slate-100 text-slate-700 border-slate-300' };
};

// 12. Draft Status Config
export const DRAFT_STATUS_CONFIG: Record<string, StatusConfig> = {
  [DraftStatusEnum.ACTIVE]: {
    label: 'Đang giữ chỗ',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [DraftStatusEnum.CONVERTED]: {
    label: 'Đã tạo vé thành công',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [DraftStatusEnum.EXPIRED]: {
    label: 'Hết hạn giữ chỗ',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  [DraftStatusEnum.CANCELLED]: {
    label: 'Đã hủy',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export const getDraftStatusConfig = (status?: string | null): StatusConfig => {
  if (!status) return { label: 'Không rõ', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  return DRAFT_STATUS_CONFIG[status] || { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' };
};

// 13. Coupon Status Config
export const COUPON_STATUS_CONFIG: Record<string, StatusConfig> = {
  [CouponStatusEnum.ACTIVE]: {
    label: 'Đang áp dụng',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [CouponStatusEnum.INACTIVE]: {
    label: 'Tạm ngừng',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  [CouponStatusEnum.EXPIRED]: {
    label: 'Hết hạn sử dụng',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const getCouponStatusConfig = (status?: string | null): StatusConfig => {
  if (!status) return { label: 'Không rõ', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  return COUPON_STATUS_CONFIG[status] || { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200' };
};

// 14. CMS Content Publish Status Config
export const CONTENT_STATUS_CONFIG: Record<string, StatusConfig> = {
  PUBLISHED: {
    label: 'Đã xuất bản',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  DRAFT: {
    label: 'Bản nháp',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export const getContentStatusConfig = (status?: string | null): StatusConfig => {
  return CONTENT_STATUS_CONFIG[status || 'DRAFT'] || CONTENT_STATUS_CONFIG.DRAFT;
};

// 15. Audit Log Action Config
// Every AuditActionEnum member is mapped to a color category once here, so any
// screen that renders an audit action (log table, activity widget, filters, ...)
// gets the same badge color for free via getAuditActionConfig / <StatusBadge type="auditAction" />.
export const AUDIT_ACTION_CATEGORY_MAP: Record<AuditActionEnum, AuditActionCategoryEnum> = {
  [AuditActionEnum.CREATE_BOOKING]: AuditActionCategoryEnum.CREATE,
  [AuditActionEnum.REGISTER]: AuditActionCategoryEnum.CREATE,
  [AuditActionEnum.CREATE_PAYMENT]: AuditActionCategoryEnum.CREATE,
  [AuditActionEnum.CREATE_STAFF]: AuditActionCategoryEnum.CREATE,
  [AuditActionEnum.CREATE_AIRPORT]: AuditActionCategoryEnum.CREATE,
  [AuditActionEnum.CREATE_AIRLINE]: AuditActionCategoryEnum.CREATE,
  [AuditActionEnum.CREATE_AIRCRAFT_TYPE]: AuditActionCategoryEnum.CREATE,
  [AuditActionEnum.CREATE_FLIGHT]: AuditActionCategoryEnum.CREATE,
  [AuditActionEnum.CREATE_COUPON]: AuditActionCategoryEnum.CREATE,
  [AuditActionEnum.CREATE_CONTENT]: AuditActionCategoryEnum.CREATE,

  [AuditActionEnum.CHANGE_SEAT]: AuditActionCategoryEnum.UPDATE,
  [AuditActionEnum.CHANGE_FLIGHT]: AuditActionCategoryEnum.UPDATE,
  [AuditActionEnum.CHANGE_PASSWORD]: AuditActionCategoryEnum.UPDATE,
  [AuditActionEnum.UPDATE_STATUS]: AuditActionCategoryEnum.UPDATE,
  [AuditActionEnum.UPDATE_AIRPORT]: AuditActionCategoryEnum.UPDATE,
  [AuditActionEnum.UPDATE_AIRLINE]: AuditActionCategoryEnum.UPDATE,
  [AuditActionEnum.UPDATE_AIRCRAFT_TYPE]: AuditActionCategoryEnum.UPDATE,
  [AuditActionEnum.UPDATE_FLIGHT]: AuditActionCategoryEnum.UPDATE,
  [AuditActionEnum.UPDATE_BOOKING_STATUS]: AuditActionCategoryEnum.UPDATE,
  [AuditActionEnum.UPDATE_PAYMENT_STATUS]: AuditActionCategoryEnum.UPDATE,
  [AuditActionEnum.UPDATE_REFUND_STATUS]: AuditActionCategoryEnum.UPDATE,
  [AuditActionEnum.UPDATE_COUPON]: AuditActionCategoryEnum.UPDATE,
  [AuditActionEnum.UPDATE_CONTENT]: AuditActionCategoryEnum.UPDATE,
  [AuditActionEnum.UPDATE_CONTACT]: AuditActionCategoryEnum.UPDATE,

  [AuditActionEnum.CANCEL_BOOKING]: AuditActionCategoryEnum.DELETE,
  [AuditActionEnum.DELETE_AIRPORT]: AuditActionCategoryEnum.DELETE,
  [AuditActionEnum.DELETE_AIRLINE]: AuditActionCategoryEnum.DELETE,
  [AuditActionEnum.DELETE_AIRCRAFT_TYPE]: AuditActionCategoryEnum.DELETE,
  [AuditActionEnum.CANCEL_FLIGHT]: AuditActionCategoryEnum.DELETE,
  [AuditActionEnum.DEACTIVATE_COUPON]: AuditActionCategoryEnum.DELETE,
  [AuditActionEnum.DELETE_CONTENT]: AuditActionCategoryEnum.DELETE,
  [AuditActionEnum.PAYMENT_FAILED]: AuditActionCategoryEnum.DELETE,

  // PAYMENT_SUCCESS is a positive outcome, same color as CREATE.
  [AuditActionEnum.PAYMENT_SUCCESS]: AuditActionCategoryEnum.CREATE,

  // LOGIN/LOGOUT are neither a mutation nor a failure — neutral, same as DEFAULT.
  [AuditActionEnum.LOGIN]: AuditActionCategoryEnum.DEFAULT,
  [AuditActionEnum.LOGOUT]: AuditActionCategoryEnum.DEFAULT,
};

// Standard 3-color CRUD-outcome palette + 1 neutral — deliberately not one hue per action.
export const AUDIT_ACTION_CATEGORY_STYLE: Record<AuditActionCategoryEnum, string> = {
  [AuditActionCategoryEnum.CREATE]: 'bg-green-50 text-green-700 border-green-200',
  [AuditActionCategoryEnum.UPDATE]: 'bg-amber-50 text-amber-700 border-amber-200',
  [AuditActionCategoryEnum.DELETE]: 'bg-red-50 text-red-700 border-red-200',
  [AuditActionCategoryEnum.DEFAULT]: 'bg-slate-100 text-slate-700 border-slate-200',
};

// Human-readable Vietnamese label for each action code, so the UI never shows a
// raw backend constant like "PAYMENT_SUCCESS" to the admin.
export const AUDIT_ACTION_LABEL: Record<AuditActionEnum, string> = {
  [AuditActionEnum.CREATE_BOOKING]: 'Tạo đặt vé',
  [AuditActionEnum.CANCEL_BOOKING]: 'Hủy đặt vé',
  [AuditActionEnum.CHANGE_SEAT]: 'Đổi ghế ngồi',
  [AuditActionEnum.CHANGE_FLIGHT]: 'Đổi chuyến bay',
  [AuditActionEnum.REGISTER]: 'Đăng ký tài khoản',
  [AuditActionEnum.LOGIN]: 'Đăng nhập',
  [AuditActionEnum.LOGOUT]: 'Đăng xuất',
  [AuditActionEnum.CHANGE_PASSWORD]: 'Đổi mật khẩu',
  [AuditActionEnum.CREATE_PAYMENT]: 'Tạo thanh toán',
  [AuditActionEnum.PAYMENT_SUCCESS]: 'Thanh toán thành công',
  [AuditActionEnum.PAYMENT_FAILED]: 'Thanh toán thất bại',
  [AuditActionEnum.UPDATE_STATUS]: 'Cập nhật trạng thái',
  [AuditActionEnum.CREATE_STAFF]: 'Tạo tài khoản nhân viên',
  [AuditActionEnum.CREATE_AIRPORT]: 'Thêm sân bay',
  [AuditActionEnum.UPDATE_AIRPORT]: 'Cập nhật sân bay',
  [AuditActionEnum.DELETE_AIRPORT]: 'Xóa sân bay',
  [AuditActionEnum.CREATE_AIRLINE]: 'Thêm hãng hàng không',
  [AuditActionEnum.UPDATE_AIRLINE]: 'Cập nhật hãng hàng không',
  [AuditActionEnum.DELETE_AIRLINE]: 'Xóa hãng hàng không',
  [AuditActionEnum.CREATE_AIRCRAFT_TYPE]: 'Thêm loại máy bay',
  [AuditActionEnum.UPDATE_AIRCRAFT_TYPE]: 'Cập nhật loại máy bay',
  [AuditActionEnum.DELETE_AIRCRAFT_TYPE]: 'Xóa loại máy bay',
  [AuditActionEnum.CREATE_FLIGHT]: 'Tạo chuyến bay',
  [AuditActionEnum.UPDATE_FLIGHT]: 'Cập nhật chuyến bay',
  [AuditActionEnum.CANCEL_FLIGHT]: 'Hủy chuyến bay',
  [AuditActionEnum.UPDATE_BOOKING_STATUS]: 'Cập nhật trạng thái đặt vé',
  [AuditActionEnum.UPDATE_PAYMENT_STATUS]: 'Cập nhật trạng thái thanh toán',
  [AuditActionEnum.UPDATE_REFUND_STATUS]: 'Cập nhật trạng thái hoàn tiền',
  [AuditActionEnum.CREATE_COUPON]: 'Tạo mã giảm giá',
  [AuditActionEnum.UPDATE_COUPON]: 'Cập nhật mã giảm giá',
  [AuditActionEnum.DEACTIVATE_COUPON]: 'Vô hiệu hóa mã giảm giá',
  [AuditActionEnum.CREATE_CONTENT]: 'Tạo nội dung CMS',
  [AuditActionEnum.UPDATE_CONTENT]: 'Cập nhật nội dung CMS',
  [AuditActionEnum.DELETE_CONTENT]: 'Xóa nội dung CMS',
  [AuditActionEnum.UPDATE_CONTACT]: 'Cập nhật thông tin liên hệ',
};

export const getAuditActionConfig = (action?: string | null): StatusConfig => {
  if (!action) return { label: '-', className: AUDIT_ACTION_CATEGORY_STYLE[AuditActionCategoryEnum.DEFAULT] };
  const category = AUDIT_ACTION_CATEGORY_MAP[action as AuditActionEnum] ?? AuditActionCategoryEnum.DEFAULT;
  // Unknown/future action codes fall back to the raw string instead of crashing.
  const label = AUDIT_ACTION_LABEL[action as AuditActionEnum] ?? action;
  return { label, className: AUDIT_ACTION_CATEGORY_STYLE[category] };
};
