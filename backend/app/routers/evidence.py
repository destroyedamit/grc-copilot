from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from pypdf import PdfReader
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.evidence import Evidence
from app.models.control import Control
from app.services.ai_service import analyze_evidence_with_ai

router = APIRouter(
    prefix="/api/evidence",
    tags=["Evidence"],
)


UPLOAD_DIR = Path("uploads/evidence")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    control_id: str = Form(...),
    framework: str = Form(...),
    db: Session = Depends(get_db),
):
    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    evidence = Evidence(
        file_name=file.filename,
        control_id=control_id,
        framework=framework,
        file_type=file.content_type or "unknown",
        file_path=str(file_path),
        status="Pending Review",
    )

    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    return {
        "message": "Evidence uploaded successfully",
        "evidence": evidence,
    }


@router.get("/")
def get_evidence(
    db: Session = Depends(get_db),
):
    return db.query(Evidence).all()


@router.get("/{evidence_id}")
def get_evidence_by_id(
    evidence_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(Evidence)
        .filter(Evidence.id == evidence_id)
        .first()
    )

@router.post("/{evidence_id}/analyze")
def analyze_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
):
    # Get evidence
    evidence = (
        db.query(Evidence)
        .filter(Evidence.id == evidence_id)
        .first()
    )

    if not evidence:
        raise HTTPException(
            status_code=404,
            detail="Evidence not found",
        )

    # Get mapped control
    control = (
        db.query(Control)
        .filter(
            Control.control_id == evidence.control_id
        )
        .first()
    )

    if not control:
        raise HTTPException(
            status_code=404,
            detail="Mapped control not found",
        )

    # Currently support PDF analysis
    if evidence.file_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Currently only PDF analysis is supported",
        )

    # Extract PDF text
    reader = PdfReader(evidence.file_path)

    extracted_text = ""

    for page in reader.pages:
        text = page.extract_text()

        if text:
            extracted_text += text + "\n"

       # Send control + evidence to local AI
    ai_result = analyze_evidence_with_ai(
        control_id=control.control_id,
        title=control.title,
        framework=control.framework,
        description=control.description or "",
        requirement=control.requirement or "",
        evidence_requested=control.evidence_requested or "",
        evidence_text=extracted_text,
    )
    evidence.ai_coverage = ai_result["coverage"]
    evidence.ai_status = ai_result["status"]
    evidence.ai_risk = ai_result["risk"]
    evidence.ai_summary = ai_result["evidence_summary"]
    evidence.ai_recommendation = ai_result["recommendation"]

    evidence.status = ai_result["status"]

    db.commit()
    db.refresh(evidence)

    return {
        "message": "Evidence analyzed successfully",
        "evidence_id": evidence.id,
        "control_id": control.control_id,
        "file_name": evidence.file_name,
        "ai_analysis": ai_result,
    }