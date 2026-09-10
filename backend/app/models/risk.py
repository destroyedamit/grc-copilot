from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from app.database import Base


class Risk(Base):
    __tablename__ = "risks"

    id = Column(Integer, primary_key=True, index=True)

    risk_id = Column(String, unique=True, nullable=False, index=True)

    control_id = Column(String, nullable=False, index=True)

    framework = Column(String, nullable=False)

    title = Column(String, nullable=False)

    description = Column(Text, nullable=True)

    likelihood = Column(Integer, nullable=False, default=1)

    impact = Column(Integer, nullable=False, default=1)

    risk_score = Column(Integer, nullable=False, default=1)

    risk_level = Column(String, nullable=False, default="Low")

    owner = Column(String, nullable=True)

    mitigation = Column(Text, nullable=True)

    status = Column(String, nullable=False, default="Open")

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
    rfi_id = Column(Integer, nullable=True, index=True)