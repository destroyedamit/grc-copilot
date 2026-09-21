from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from datetime import datetime

from app.database import Base


class ControlAssignment(Base):
    __tablename__ = "control_assignments"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    control_id = Column(
        Integer,
        ForeignKey("controls.id"),
        nullable=False,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    assigned_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    assigned_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "control_id",
            "user_id",
            name="uq_control_user_assignment",
        ),
    )