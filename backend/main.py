from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from loguru import logger

from config import settings
from database import connect_db, close_db

# Import all routers
from routes.auth import router as auth_router
from routes.patients import router as patients_router
from routes.doctors import router as doctors_router
from routes.appointments import router as appointments_router
from routes.prescriptions import router as prescriptions_router
from routes.reports import router as reports_router
from routes.predictions import router as predictions_router
from routes.xray import router as xray_router
from routes.chatbot import router as chatbot_router
from routes.ocr import router as ocr_router
from routes.wearables import router as wearables_router
from routes.emergency import router as emergency_router
from routes.analytics import router as analytics_router
from routes.notifications import router as notifications_router
from routes.websocket import router as websocket_router
from routes.voice import router as voice_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting MediAI Pro Healthcare System...")
    await connect_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs("ml_models/trained_models", exist_ok=True)
    logger.info("✅ MediAI Pro is ready!")
    yield
    # Shutdown
    logger.info("🛑 Shutting down MediAI Pro...")
    await close_db()


app = FastAPI(
    title="MediAI Pro - AI Healthcare System",
    description="""
    ## 🏥 MediAI Pro - Complete AI-Powered Healthcare Platform
    
    ### Features:
    - 🔐 JWT Authentication & Role-Based Access
    - 👤 Patient & Doctor Management  
    - 📅 Appointment Booking System
    - 💊 Prescription Generation (PDF)
    - 🤖 AI Disease Prediction
    - 🫁 X-Ray Analysis (CNN)
    - 📄 OCR Report Scanning
    - 💬 AI Chatbot (Multilingual)
    - 🎙️ Voice Assistant
    - 📱 Wearable Integration
    - 🚨 Emergency Detection
    - 📊 Health Analytics Dashboard
    - 🔴 Real-Time WebSockets
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include all routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["🔐 Authentication"])
app.include_router(patients_router, prefix="/api/v1/patients", tags=["👤 Patients"])
app.include_router(doctors_router, prefix="/api/v1/doctors", tags=["👨‍⚕️ Doctors"])
app.include_router(appointments_router, prefix="/api/v1/appointments", tags=["📅 Appointments"])
app.include_router(prescriptions_router, prefix="/api/v1/prescriptions", tags=["💊 Prescriptions"])
app.include_router(reports_router, prefix="/api/v1/reports", tags=["📋 Medical Reports"])
app.include_router(predictions_router, prefix="/api/v1/predict", tags=["🤖 AI Predictions"])
app.include_router(xray_router, prefix="/api/v1/xray", tags=["🫁 X-Ray Analysis"])
app.include_router(chatbot_router, prefix="/api/v1/chat", tags=["💬 AI Chatbot"])
app.include_router(ocr_router, prefix="/api/v1/ocr", tags=["�️ OCR Delete"])
app.include_router(wearables_router, prefix="/api/v1/wearables", tags=["⌚ Wearables"])
app.include_router(emergency_router, prefix="/api/v1/emergency", tags=["🚨 Emergency"])
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["📊 Analytics"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["🔔 Notifications"])
app.include_router(websocket_router, prefix="/ws", tags=["🔴 WebSockets"])
app.include_router(voice_router, prefix="/api/v1/voice", tags=["🎙️ Voice Assistant"])


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "🏥 Welcome to MediAI Pro - AI Healthcare System",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health", tags=["Health Check"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
