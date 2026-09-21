from pathlib import Path
import os
import uuid
import tempfile

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
from fastapi.responses import FileResponse

from app.database import get_db
from app.models.evidence import Evidence
from app.models.control import Control
from app.models.control_assignment import ControlAssignment
from app.models.user import User
from app.dependencies import (
    get_current_user,
    require_admin,
    require_auditor,
    require_control_owner,
)
from app.services.ai_service import (
    analyze_evidence_with_ai,
    analyze_image_evidence_with_ai,
    analyze_evidence_with_gemini,
    analyze_image_evidence_with_gemini,
)
from app.services.s3_service import (
    upload_file_to_s3,
    delete_file_from_s3,
    generate_presigned_url,
    download_file_from_s3,
)
router = APIRouter(
    prefix="/api/evidence",
    tags=["Evidence"],
)


UPLOAD_DIR = Path(
    os.getenv(
        "UPLOAD_DIR",
        "/tmp/uploads/evidence"
    )
)

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# =========================================================
# UPLOAD EVIDENCE
# =========================================================

@router.post("/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    control_id: str = Form(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # =========================
    # VALIDATE FILE
    # =========================

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected",
        )

    allowed_extensions = {
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".png",
        ".jpg",
        ".jpeg",
    }

    extension = Path(file.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Allowed: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG"
            ),
        )

    # =========================
    # FIND CONTROL
    # =========================

    control = (
        db.query(Control)
        .filter(
            Control.control_id == control_id.strip()
        )
        .first()
    )

    if not control:
        raise HTTPException(
            status_code=404,
            detail=f"Control '{control_id}' not found",
        )

    # =========================================================
    # CHECK CONTROL OWNER ASSIGNMENT
    # =========================================================

    if current_user.role == "CONTROL_OWNER":
        assignment = (
            db.query(ControlAssignment)
            .filter(
                ControlAssignment.control_id == control.id,
                ControlAssignment.user_id == current_user.id,
            )
            .first()
        )

        if not assignment:
            raise HTTPException(
                status_code=403,
                detail="You are not assigned to this control",
            )

    elif current_user.role not in {
        "ADMINISTRATOR",
    }:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to upload evidence",
        )

    # =========================
    # READ FILE
    # =========================

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty",
        )

    # =========================
    # CREATE UNIQUE FILE NAME
    # =========================

    safe_file_name = (
        f"{uuid.uuid4().hex}_{Path(file.filename).name}"
    )

    # Temporary local file
    file_path = UPLOAD_DIR / safe_file_name

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    # =========================================================
    # UPLOAD TO AWS S3
    # =========================================================

    s3_key = (
        f"evidence/{control.control_id}/{safe_file_name}"
    )

    try:
        upload_file_to_s3(
            file_path=str(file_path),
            object_key=s3_key,
            content_type=file.content_type or "application/octet-stream",
        )

    except Exception as error:
        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Unable to upload evidence to S3: {str(error)}",
        )

    # =========================
    # CREATE EVIDENCE
    # =========================

    evidence = Evidence(
        file_name=file.filename,
        control_id=control.control_id,
        uploaded_by=current_user.id,
        framework=control.framework,
        file_type=file.content_type or "unknown",
        file_path=str(file_path),
        s3_key=s3_key,
        status="Pending Review",
    )

    db.add(evidence)

    # =========================
    # UPDATE CONTROL
    # =========================

    control.evidence_count = (
        control.evidence_count or 0
    ) + 1

    # =========================
    # COMMIT
    # =========================

    try:
        db.commit()
        db.refresh(evidence)

    except Exception as error:
        db.rollback()

        if file_path.exists():
            file_path.unlink()

        # Remove S3 object if DB save failed
        try:
            delete_file_from_s3(s3_key)
        except Exception:
            pass

        raise HTTPException(
            status_code=500,
            detail=f"Unable to save evidence: {str(error)}",
        )

    # Remove temporary local copy
    if file_path.exists():
        file_path.unlink()

    return {
        "message": "Evidence uploaded successfully",
        "evidence": evidence,
    }


# =========================================================
# GET ALL EVIDENCE
# =========================================================

@router.get("")
def get_evidence(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role in {
        "ADMINISTRATOR",
        "AUDITOR",
    }:
        return db.query(Evidence).all()

    # Control Owner sees evidence for assigned controls
    assignments = (
        db.query(ControlAssignment)
        .filter(
            ControlAssignment.user_id == current_user.id
        )
        .all()
    )

    assigned_control_ids = [
        assignment.control_id
        for assignment in assignments
    ]

    controls = (
        db.query(Control)
        .filter(Control.id.in_(assigned_control_ids))
        .all()
    )

    control_ids = [
        control.control_id
        for control in controls
    ]

    return (
        db.query(Evidence)
        .filter(Evidence.control_id.in_(control_ids))
        .all()
    )


# =========================================================
# GET EVIDENCE BY ID
# =========================================================

@router.get("/{evidence_id}")
def get_evidence_by_id(
    evidence_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
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

    # =========================================================
    # CONTROL OWNER ACCESS CHECK
    # =========================================================

    if current_user.role == "CONTROL_OWNER":
        control = (
            db.query(Control)
            .filter(
                Control.control_id == evidence.control_id
            )
            .first()
        )

        assignment = None

        if control:
            assignment = (
                db.query(ControlAssignment)
                .filter(
                    ControlAssignment.control_id == control.id,
                    ControlAssignment.user_id == current_user.id,
                )
                .first()
            )

        if not assignment:
            raise HTTPException(
                status_code=403,
                detail="You do not have access to this evidence",
            )

    return evidence



# =========================================================
# VIEW EVIDENCE FILE
# =========================================================

@router.get("/{evidence_id}/file")
def view_evidence_file(
    evidence_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
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

    # =========================================================
    # CONTROL OWNER ACCESS CHECK
    # =========================================================

    if current_user.role == "CONTROL_OWNER":
        control = (
            db.query(Control)
            .filter(
                Control.control_id == evidence.control_id
            )
            .first()
        )

        assignment = None

        if control:
            assignment = (
                db.query(ControlAssignment)
                .filter(
                    ControlAssignment.control_id == control.id,
                    ControlAssignment.user_id == current_user.id,
                )
                .first()
            )

        if not assignment:
            raise HTTPException(
                status_code=403,
                detail="You do not have access to this evidence",
            )

    # =========================================================
    # S3 EVIDENCE
    # =========================================================

    if evidence.s3_key:
        try:
            url = generate_presigned_url(
                evidence.s3_key,
                expires_in=900,
            )

            return {
                "file_name": evidence.file_name,
                "file_type": evidence.file_type,
                "url": url,
                "expires_in": 900,
            }

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"Unable to generate evidence URL: {str(error)}",
            )

    # =========================================================
    # LEGACY LOCAL EVIDENCE
    # =========================================================

    file_path = Path(evidence.file_path)

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Evidence file not found",
        )

    return FileResponse(
        path=file_path,
        media_type=evidence.file_type or "application/octet-stream",
        filename=evidence.file_name,
        content_disposition_type="inline",
    )

# =========================================================
# AI EVIDENCE ANALYSIS
# =========================================================

@router.post("/{evidence_id}/analyze")
def analyze_evidence(
    evidence_id: int,
    provider: str = "gemini",
    current_user=Depends(require_auditor),
    db: Session = Depends(get_db),
):
    # =====================================================
    # VALIDATE PROVIDER
    # =====================================================

    provider = provider.strip().lower()

    allowed_providers = {
        "llama",
        "gemini",
    }

    if provider not in allowed_providers:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid AI provider. "
                "Supported providers: llama, gemini"
            ),
        )

    # =====================================================
    # GET EVIDENCE
    # =====================================================

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

    # =====================================================
    # GET MAPPED CONTROL
    # =====================================================

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

    # =====================================================
    # CHECK FILE TYPE
    # =====================================================

    is_pdf = evidence.file_name.lower().endswith(
        ".pdf"
    )

    is_image = evidence.file_name.lower().endswith(
        (".png", ".jpg", ".jpeg")
    )

    if not is_pdf and not is_image:
        raise HTTPException(
            status_code=400,
            detail=(
                "AI analysis currently supports "
                "PDF, PNG, JPG and JPEG files"
            ),
        )
    # =====================================================
    # PREPARE EVIDENCE FILE FOR AI ANALYSIS
    # =====================================================

    analysis_file_path = evidence.file_path
    temporary_file = None

    if evidence.s3_key:
        try:
            suffix = Path(evidence.file_name).suffix

            temporary_file = tempfile.NamedTemporaryFile(
                delete=False,
                suffix=suffix,
            )

            temporary_file.close()

            download_file_from_s3(
                object_key=evidence.s3_key,
                local_path=temporary_file.name,
            )

            analysis_file_path = temporary_file.name

        except Exception as error:
            if temporary_file:
                try:
                    os.unlink(temporary_file.name)
                except Exception:
                    pass

            raise HTTPException(
                status_code=500,
                detail=f"Unable to download evidence from S3: {str(error)}",
            )
    # =====================================================
    # PDF AI ANALYSIS
    # =====================================================

    if is_pdf:

        try:
            reader = PdfReader(analysis_file_path)

            extracted_text = ""

            for page in reader.pages:
                text = page.extract_text()

                if text:
                    extracted_text += text + "\n"

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"Unable to read PDF: {str(error)}",
            )

        # -------------------------------------------------
        # GEMINI
        # -------------------------------------------------

        if provider == "gemini":

            ai_result = analyze_evidence_with_gemini(
                control_id=control.control_id,
                title=control.title,
                framework=control.framework,
                description=control.description or "",
                requirement=control.requirement or "",
                evidence_requested=control.evidence_requested or "",
                evidence_text=extracted_text,
            )

        # -------------------------------------------------
        # LLAMA
        # -------------------------------------------------

        else:

            ai_result = analyze_evidence_with_ai(
                control_id=control.control_id,
                title=control.title,
                framework=control.framework,
                description=control.description or "",
                requirement=control.requirement or "",
                evidence_requested=control.evidence_requested or "",
                evidence_text=extracted_text,
            )

    # =====================================================
    # IMAGE / SCREENSHOT AI ANALYSIS
    # =====================================================

    else:

        # -------------------------------------------------
        # GEMINI
        # -------------------------------------------------

        if provider == "gemini":

            ai_result = analyze_image_evidence_with_gemini(
                control_id=control.control_id,
                title=control.title,
                framework=control.framework,
                description=control.description or "",
                requirement=control.requirement or "",
                evidence_requested=control.evidence_requested or "",
                image_path=analysis_file_path,
            )

        # -------------------------------------------------
        # LLAVA
        # -------------------------------------------------

        else:

            ai_result = analyze_image_evidence_with_ai(
                control_id=control.control_id,
                title=control.title,
                framework=control.framework,
                description=control.description or "",
                requirement=control.requirement or "",
                evidence_requested=control.evidence_requested or "",
                image_path=analysis_file_path,
            )

    # =====================================================
    # VALIDATE AI RESULT
    # =====================================================

    if not isinstance(ai_result, dict):
        raise HTTPException(
            status_code=500,
            detail="AI provider returned an invalid response",
        )

    required_fields = {
        "coverage",
        "status",
        "risk",
        "missing_requirements",
        "evidence_summary",
        "recommendation",
    }

    missing_fields = required_fields - set(ai_result.keys())

    if missing_fields:
        raise HTTPException(
            status_code=500,
            detail=(
                "AI provider returned an incomplete result. "
                f"Missing fields: {', '.join(missing_fields)}"
            ),
        )
    # =====================================================
    # CLEANUP TEMPORARY S3 FILE
    # =====================================================

    if temporary_file:
        try:
            os.unlink(temporary_file.name)
        except Exception:
            pass
    # =====================================================
    # SAVE AI RESULT
    # =====================================================

    evidence.ai_coverage = ai_result["coverage"]
    evidence.ai_status = ai_result["status"]
    evidence.ai_risk = ai_result["risk"]
    evidence.ai_summary = ai_result["evidence_summary"]
    evidence.ai_recommendation = ai_result["recommendation"]

    # Update evidence status
    evidence.status = ai_result["status"]

    # =====================================================
    # COMMIT
    # =====================================================

    try:
        db.commit()
        db.refresh(evidence)

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Unable to save AI analysis: {str(error)}",
        )

    # =====================================================
    # RESPONSE
    # =====================================================

    return {
        "message": "Evidence analyzed successfully",
        "evidence_id": evidence.id,
        "control_id": control.control_id,
        "file_name": evidence.file_name,
        "provider": provider,
        "ai_analysis": ai_result,
    }

# =========================================================
# MANUAL EVIDENCE REVIEW
# Administrator / Auditor
# =========================================================

@router.post("/{evidence_id}/manual-review")
def manual_review_evidence(
    evidence_id: int,
    manual_status: str,
    manual_risk: str,
    manual_comments: str = "",
    current_user=Depends(require_auditor),
    db: Session = Depends(get_db),
):
    # =====================================================
    # GET EVIDENCE
    # =====================================================

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

    # =====================================================
    # VALIDATE STATUS
    # =====================================================

    allowed_statuses = {
        "Compliant",
        "Partial",
        "Insufficient",
    }

    if manual_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid manual status. "
                "Allowed values: Compliant, Partial, Insufficient"
            ),
        )

    # =====================================================
    # VALIDATE RISK
    # =====================================================

    allowed_risks = {
        "Low",
        "Medium",
        "High",
    }

    if manual_risk not in allowed_risks:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid manual risk. "
                "Allowed values: Low, Medium, High"
            ),
        )

    # =====================================================
    # SAVE MANUAL REVIEW
    # =====================================================

    from datetime import datetime

    evidence.manual_status = manual_status
    evidence.manual_risk = manual_risk
    evidence.manual_comments = manual_comments
    evidence.reviewed_by = current_user.id
    evidence.reviewed_at = datetime.utcnow()

    # =====================================================
    # FINAL EVIDENCE STATUS
    # =====================================================

    evidence.status = manual_status

    # =====================================================
    # COMMIT
    # =====================================================

    try:
        db.commit()
        db.refresh(evidence)

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Unable to save manual review: {str(error)}",
        )

    return {
        "message": "Manual evidence review completed",
        "evidence_id": evidence.id,
        "control_id": evidence.control_id,
        "manual_review": {
            "status": evidence.manual_status,
            "risk": evidence.manual_risk,
            "comments": evidence.manual_comments,
            "reviewed_by": current_user.email,
            "reviewed_at": evidence.reviewed_at,
        },
    }