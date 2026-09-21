from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# Models
from app.models.control import Control
from app.models.evidence import Evidence
from app.models.rfi import RFI
from app.models.risk import Risk
from app.models.user import User
from app.models.control_assignment import ControlAssignment
# Routers
from app.routers.auth import router as auth_router
from app.routers.controls import router as controls_router
from app.routers.evidence import router as evidence_router
from app.routers.rfi import router as rfi_router
from app.routers import risk
from app.routers.control_assignments import router as control_assignment_router

app = FastAPI(
    title="GRC Copilot API",
    description="AI-powered Governance, Risk and Compliance platform",
    version="1.0.0",
)


# Create database tables
Base.metadata.create_all(bind=engine)


# CORS - allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
app.include_router(controls_router)
app.include_router(evidence_router)
app.include_router(rfi_router)
app.include_router(auth_router)
app.include_router(risk.router)
app.include_router(control_assignment_router)

@app.get("/")
def root():
    return {
        "message": "GRC Copilot API is running",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }