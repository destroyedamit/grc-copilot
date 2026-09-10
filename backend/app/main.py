from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.control import Control
from app.routers.controls import router as controls_router
from app.models.evidence import Evidence
from app.routers.evidence import router as evidence_router
from app.models.rfi import RFI
from app.routers.rfi import router as rfi_router
from app.routers import risk
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
app.include_router(risk.router)
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