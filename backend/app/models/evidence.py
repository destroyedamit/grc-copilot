from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)

    file_name = Column(
        String,
        nullable=False,
    )

    control_id = Column(
        String,
        nullable=False,
        index=True,
    )
    uploaded_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    framework = Column(
        String,
        nullable=False,
    )

    file_type = Column(
        String,
        nullable=False,
    )

    file_path = Column(
        String,
        nullable=False,
    )

    s3_key = Column(
        String,
        nullable=True,
        index=True,
    )


    status = Column(
        String,
        default="Pending Review",
    )

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    ai_coverage = Column(Integer, nullable=True)
    ai_status = Column(String, nullable=True)
    ai_risk = Column(String, nullable=True)
    ai_summary = Column(String, nullable=True)
    ai_recommendation = Column(String, nullable=True)

        # =========================================================
    # MANUAL VALIDATION
    # =========================================================

    manual_status = Column(
        String,
        nullable=True,
    )

    manual_risk = Column(
        String,
        nullable=True,
    )

    manual_comments = Column(
        String,
        nullable=True,
    )

    reviewed_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    reviewed_at = Column(
        DateTime,
        nullable=True,
    )