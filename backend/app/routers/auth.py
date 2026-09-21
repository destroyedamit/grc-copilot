from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.services.auth_service import (
    create_access_token,
    decode_access_token,
    verify_password,
)

from app.dependencies import (
    require_admin,
    require_auditor,
    require_control_owner,
)



router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)



# ============================================================
# REQUEST SCHEMA
# ============================================================

class LoginRequest(BaseModel):
    email: str
    password: str


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    email = credentials.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    if not verify_password(
        credentials.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "business_unit": user.business_unit,
        }
    }


# ============================================================
# CURRENT USER
# ============================================================

@router.get("/me")
def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "business_unit": current_user.business_unit,
        "is_active": current_user.is_active,
    }
