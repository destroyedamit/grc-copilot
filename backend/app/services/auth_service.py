import os
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext


# ============================================================
# JWT CONFIGURATION
# ============================================================

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "dev-only-change-this-secret"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "480"
    )
)


# ============================================================
# PASSWORD HASHING
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    """
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    password_hash: str
) -> bool:
    """
    Verify a plain-text password against
    the stored bcrypt hash.
    """
    return pwd_context.verify(
        plain_password,
        password_hash
    )


# ============================================================
# JWT TOKEN CREATION
# ============================================================

def create_access_token(
    user_id: int,
    email: str,
    role: str
) -> str:
    """
    Create a JWT access token.
    """

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ============================================================
# JWT TOKEN VALIDATION
# ============================================================

def decode_access_token(token: str):
    """
    Decode and validate a JWT access token.

    Returns:
        payload dictionary if valid
        None if invalid/expired
    """

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            return None

        return payload

    except JWTError:
        return None