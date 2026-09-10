from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database import Base


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