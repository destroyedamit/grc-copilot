from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.rfi import RFI

class RFICreate(BaseModel):
    control_id: str
    framework: str
    title: str
    description: str
    evidence_requested: str
    priority: str = "Medium"
    evidence_id: int | None = None

router = APIRouter(
    prefix="/api/rfi",
    tags=["RFI"],
)


@router.post("")
def create_rfi(
    data: RFICreate,
    db: Session = Depends(get_db),
):
    rfi_count = db.query(RFI).count() + 1

    rfi_number = f"RFI-{rfi_count:04d}"

    rfi = RFI(
        rfi_number=rfi_number,
        evidence_id=data.evidence_id,
        control_id=data.control_id,
        framework=data.framework,
        title=data.title,
        description=data.description,
        evidence_requested=data.evidence_requested,
        priority=data.priority,
        status="Open",
    )

    db.add(rfi)
    db.commit()
    db.refresh(rfi)

    return rfi


@router.get("")
def get_rfis(
    db: Session = Depends(get_db),
):
    return (
        db.query(RFI)
        .order_by(RFI.created_at.desc())
        .all()
    )


@router.get("/{rfi_id}")
def get_rfi(
    rfi_id: int,
    db: Session = Depends(get_db),
):
    rfi = (
        db.query(RFI)
        .filter(RFI.id == rfi_id)
        .first()
    )

    if not rfi:
        raise HTTPException(
            status_code=404,
            detail="RFI not found",
        )

    return rfi


@router.patch("/{rfi_id}/status")
def update_rfi_status(
    rfi_id: int,
    status: str,
    db: Session = Depends(get_db),
):
    rfi = (
        db.query(RFI)
        .filter(RFI.id == rfi_id)
        .first()
    )

    if not rfi:
        raise HTTPException(
            status_code=404,
            detail="RFI not found",
        )

    rfi.status = status

    db.commit()
    db.refresh(rfi)

    return rfi