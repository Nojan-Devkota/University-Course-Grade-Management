class DomainError(Exception):
    """Base class for business-rule errors raised by the service layer.

    Services stay framework-agnostic by raising these instead of HTTP errors.
    The API layer maps each one to an HTTP status code via global handlers.
    """

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class NotFoundError(DomainError):
    """A requested record does not exist (maps to HTTP 404)."""


class ConflictError(DomainError):
    """The request conflicts with existing data, e.g. a duplicate (maps to 409)."""


class BusinessRuleViolation(DomainError):
    """A university academic rule was violated, e.g. the credit cap (maps to 422)."""


def register_exception_handlers(app) -> None:
    """Translate domain errors into HTTP responses at the app boundary.

    Keeping this mapping in one place means routes and services never need to
    know about HTTP status codes.
    """
    from fastapi import Request
    from fastapi.responses import JSONResponse

    status_by_error = {
        NotFoundError: 404,
        ConflictError: 409,
        BusinessRuleViolation: 422,
    }

    async def handle_domain_error(request: "Request", exc: DomainError) -> "JSONResponse":
        status_code = status_by_error.get(type(exc), 400)
        return JSONResponse(status_code=status_code, content={"detail": exc.message})

    for error_type in status_by_error:
        app.add_exception_handler(error_type, handle_domain_error)
