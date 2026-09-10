from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.control import Control

router = APIRouter(
    prefix="/api/controls",
    tags=["Controls"],
)


@router.get("/")
def get_controls(db: Session = Depends(get_db)):
    controls = db.query(Control).all()

    return controls


@router.get("/{control_id}")
def get_control(
    control_id: str,
    db: Session = Depends(get_db),
):
    control = (
        db.query(Control)
        .filter(Control.control_id == control_id)
        .first()
    )

    if not control:
        raise HTTPException(
            status_code=404,
            detail="Control not found",
        )

    return control

@router.post("/")
def create_control(
    control_id: str,
    title: str,
    framework: str,
    description: str = "",
    requirement: str = "",
    evidence_requested: str = "",
    status: str = "Pending",
    db: Session = Depends(get_db),
):
    existing_control = (
        db.query(Control)
        .filter(Control.control_id == control_id)
        .first()
    )

    if existing_control:
        raise HTTPException(
            status_code=400,
            detail="Control already exists",
        )

    control = Control(
        control_id=control_id,
        title=title,
        framework=framework,
        description=description,
        requirement=requirement,
        evidence_requested=evidence_requested,
        status=status,
        evidence_count=0,
    )

    db.add(control)
    db.commit()
    db.refresh(control)

    return control