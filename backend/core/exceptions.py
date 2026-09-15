class AppError(Exception):
    def __init__(self, code, message, status=400, details=None):
        self.code = code
        self.message = message
        self.status = status
        self.details = details or {}
        super().__init__(message)

class ValidationError(AppError):
    def __init__(self, message, details=None):
        super().__init__('VALIDATION_ERROR', message, 400, details)

class AuthenticationError(AppError):
    def __init__(self, message='Vui lòng đăng nhập để tiếp tục'):
        super().__init__('AUTHENTICATION_ERROR', message, 401)

class AuthorizationError(AppError):
    def __init__(self, message='Bạn không có quyền thực hiện thao tác này'):
        super().__init__('AUTHORIZATION_ERROR', message, 403)

class NotFoundError(AppError):
    def __init__(self, resource='Resource'):
        resource_names = {
            'Resource': 'tài nguyên',
            'Booking': 'đơn đặt vé',
            'Booking draft': 'đơn đặt vé nháp',
            'E-Ticket': 'vé điện tử',
            'Cancellation': 'yêu cầu hủy vé',
            'Refund': 'yêu cầu hoàn tiền',
            'Fare': 'hạng vé',
            'Segment': 'chặng bay',
            'Seat map': 'sơ đồ ghế',
            'Seat': 'ghế',
            'Seat hold': 'thông tin giữ ghế',
            'Ancillary item': 'dịch vụ bổ sung',
            'Payment': 'giao dịch thanh toán',
            'Session': 'phiên đăng nhập',
            'Saved passenger': 'hành khách đã lưu',
            'Passenger': 'hành khách',
        }
        resource_name = resource_names.get(resource, resource)
        super().__init__('NOT_FOUND', f'Không tìm thấy {resource_name}', 404)

class ConflictError(AppError):
    def __init__(self, message, code='CONFLICT'):
        super().__init__(code, message, 409)

class BusinessError(AppError):
    def __init__(self, code, message, details=None):
        super().__init__(code, message, 422, details)

class RateLimitError(AppError):
    def __init__(self):
        super().__init__('RATE_LIMIT_EXCEEDED', 'Bạn thao tác quá nhanh, vui lòng thử lại sau', 429)
