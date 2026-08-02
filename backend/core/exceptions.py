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
    def __init__(self, message='Authentication required'):
        super().__init__('AUTHENTICATION_ERROR', message, 401)

class AuthorizationError(AppError):
    def __init__(self, message='Access denied'):
        super().__init__('AUTHORIZATION_ERROR', message, 403)

class NotFoundError(AppError):
    def __init__(self, resource='Resource'):
        super().__init__('NOT_FOUND', f'{resource} not found', 404)

class ConflictError(AppError):
    def __init__(self, message, code='CONFLICT'):
        super().__init__(code, message, 409)

class BusinessError(AppError):
    def __init__(self, code, message, details=None):
        super().__init__(code, message, 422, details)

class RateLimitError(AppError):
    def __init__(self):
        super().__init__('RATE_LIMIT_EXCEEDED', 'Too many requests', 429)
