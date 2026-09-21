from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.control import Control
from app.models.user import User
from app.models.control_assignment import ControlAssignment
from app.dependencies import (
    get_current_user,
    require_auditor,
    require_control_owner,
)

router = APIRouter(
    prefix="/api/control-assignments",
    tags=["Control Assignments"],
)


# =========================================================
# ASSIGN CONTROL
# Administrator / Auditor
# =========================================================

@router.post("")
def assign_control(
    control_id: str,
    user_email: str,
    current_user=Depends(require_auditor),
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

    user = (
        db.query(User)
        .filter(User.email == user_email.lower().strip())
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if user.role != "CONTROL_OWNER":
        raise HTTPException(
            status_code=400,
            detail="Control can only be assigned to a Control Owner",
        )

    existing_assignment = (
        db.query(ControlAssignment)
        .filter(
            ControlAssignment.control_id == control.id,
            ControlAssignment.user_id == user.id,
        )
        .first()
    )

    if existing_assignment:
        raise HTTPException(
            status_code=400,
            detail="Control is already assigned to this user",
        )

    assignment = ControlAssignment(
        control_id=control.id,
        user_id=user.id,
        assigned_by=current_user.id,
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return {
        "message": "Control assigned successfully",
        "control_id": control.control_id,
        "assigned_to": user.email,
        "assigned_by": current_user.email,
        "assignment_id": assignment.id,
    }


# =========================================================
# MY ASSIGNED CONTROLS
# Control Owner
# =========================================================

@router.get("/my-controls")
def get_my_controls(
    current_user=Depends(require_control_owner),
    db: Session = Depends(get_db),
):
    assignments = (
        db.query(ControlAssignment)
        .filter(
            ControlAssignment.user_id == current_user.id
        )
        .all()
    )

    controls = []

    for assignment in assignments:
        control = (
            db.query(Control)
            .filter(Control.id == assignment.control_id)
            .first()
        )

        if control:
            controls.append(control)

    return controls


# =========================================================
# VIEW ALL ASSIGNMENTS
# Administrator / Auditor
# =========================================================

@router.get("")
def get_assignments(
    current_user=Depends(require_auditor),
    db: Session = Depends(get_db),
):
    assignments = db.query(ControlAssignment).all()

    result = []

    for assignment in assignments:
        control = (
            db.query(Control)
            .filter(Control.id == assignment.control_id)
            .first()
        )

        user = (
            db.query(User)
            .filter(User.id == assignment.user_id)
            .first()
        )

        assigned_by = (
            db.query(User)
            .filter(User.id == assignment.assigned_by)
            .first()
        )

        result.append({
            "assignment_id": assignment.id,
            "control_id": control.control_id if control else None,
            "control_title": control.title if control else None,
            "assigned_to": user.email if user else None,
            "assigned_to_name": user.name if user else None,
            "assigned_by": assigned_by.email if assigned_by else None,
            "assigned_at": assignment.assigned_at,
        })

    return result