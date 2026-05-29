from dataclasses import dataclass
from uuid import UUID

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.exceptions import ForbiddenError, UnauthorizedError
from core.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class TokenUser:
    id: UUID
    role: str
    email: str | None = None


def _user_from_token(token: str) -> TokenUser:
    try:
        payload = decode_access_token(token)
        return TokenUser(
            id=UUID(payload["sub"]),
            role=payload["role"],
            email=payload.get("email"),
        )
    except Exception as exc:
        raise UnauthorizedError("Invalid or expired token.") from exc


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> TokenUser | None:
    if credentials is None:
        return None
    return _user_from_token(credentials.credentials)


async def get_current_user(
    user: TokenUser | None = Depends(get_current_user_optional),
) -> TokenUser:
    if user is None:
        raise UnauthorizedError("Authentication required.")
    return user


async def require_staff(user: TokenUser = Depends(get_current_user)) -> TokenUser:
    if user.role != "staff":
        raise ForbiddenError("Staff privileges required.")
    return user
