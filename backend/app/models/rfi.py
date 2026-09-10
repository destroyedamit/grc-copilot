from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database import Base


class RFI(Base):
    __tablename__ = "rfis"

    id = Column(Integer, primary_key=True, index=True)

    rfi_number = Column(String, unique=True, nullable=False, index=True)

    evidence_id = Column(Integer, nullable=True)
    control_id = Column(String, nullable=False)
    framework = Column(String, nullable=False)

    title = Column(String, nullable=False)

    description = Column(Text, nullable=False)

    evidence_requested = Column(Text, nullable=False)

    priority = Column(
        String,
        default="Medium",
        nullable=False,
    )

    status = Column(
        String,
        default="Open",
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    due_date = Column(
        DateTime,
        nullable=True,
    )