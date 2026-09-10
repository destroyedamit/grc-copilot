from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.risk import Risk
from fastapi import Query

router = APIRouter(
    prefix="/api/risks",
    tags=["Risk Management"],
)


class RiskCreate(BaseModel):
    control_id: str
    framework: str
    title: str
    description: str | None = None

    likelihood: int
    impact: int

    owner: str | None = None
    mitigation: str | None = None
    rfi_id: int | None = None


def calculate_risk_level(score: int):
    if score >= 15:
        return "High"

    if score >= 6:
        return "Medium"

    return "Low"


@router.post("/")
def create_risk(
    data: RiskCreate,
    db: Session = Depends(get_db),
):
    if not 1 <= data.likelihood <= 5:
        raise HTTPException(
            status_code=400,
            detail="Likelihood must be between 1 and 5",
        )

    if not 1 <= data.impact <= 5:
        raise HTTPException(
            status_code=400,
            detail="Impact must be between 1 and 5",
        )

    score = data.likelihood * data.impact

    risk_level = calculate_risk_level(score)

    risk_count = db.query(Risk).count() + 1

    risk_id = f"RISK-{risk_count:04d}"

    risk = Risk(
        risk_id=risk_id,
        control_id=data.control_id,
        framework=data.framework,
        title=data.title,
        description=data.description,
        likelihood=data.likelihood,
        impact=data.impact,
        risk_score=score,
        risk_level=risk_level,
        owner=data.owner,
        mitigation=data.mitigation,
        status="Open",
        rfi_id=data.rfi_id,
    )

    db.add(risk)
    db.commit()
    db.refresh(risk)

    return {
        "message": "Risk created successfully",
        "risk": risk,
    }


@router.get("/")
def get_risks(
    db: Session = Depends(get_db),
):
    return db.query(Risk).order_by(Risk.id.desc()).all()


@router.get("/{risk_id}")
def get_risk(
    risk_id: int,
    db: Session = Depends(get_db),
):
    risk = (
        db.query(Risk)
        .filter(Risk.id == risk_id)
        .first()
    )

    if not risk:
        raise HTTPException(
            status_code=404,
            detail="Risk not found",
        )

    return risk

@router.patch("/{risk_id}/status")
def update_risk_status(
    risk_id: int,
    status: str = Query(...),
    db: Session = Depends(get_db),
):
    risk = (
        db.query(Risk)
        .filter(Risk.id == risk_id)
        .first()
    )

    if not risk:
        raise HTTPException(
            status_code=404,
            detail="Risk not found",
        )

    allowed_statuses = [
        "Open",
        "In Progress",
        "Resolved",
        "Closed",
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid risk status",
        )

    risk.status = status

    db.commit()
    db.refresh(risk)

    return risk