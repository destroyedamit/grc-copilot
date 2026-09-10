from sqlalchemy import Column, Integer, String

from app.database import Base


class Control(Base):
    __tablename__ = "controls"

    id = Column(Integer, primary_key=True, index=True)

    control_id = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    title = Column(
        String,
        nullable=False,
    )

    framework = Column(
        String,
        nullable=False,
    )

    description = Column(
        String,
        nullable=True,
    )

    requirement = Column(
        String,
        nullable=True,
    )

    evidence_requested = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        default="Pending",
    )

    evidence_count = Column(
        Integer,
        default=0,
    )