from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class EmergencyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# ─── Auth Models ──────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.PATIENT
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None


# ─── Patient Models ───────────────────────────────────────────────────────────

class PatientProfile(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    allergies: List[str] = []
    chronic_conditions: List[str] = []
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    address: Optional[str] = None


class PatientResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str]
    profile: Optional[dict]
    created_at: datetime


# ─── Doctor Models ────────────────────────────────────────────────────────────

class DoctorProfile(BaseModel):
    specialization: str
    license_number: str
    experience_years: int
    qualification: str
    hospital_name: Optional[str] = None
    consultation_fee: Optional[float] = None
    available_days: List[str] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    available_slots: List[str] = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    bio: Optional[str] = None


class DoctorResponse(BaseModel):
    id: str
    full_name: str
    email: str
    specialization: str
    experience_years: int
    consultation_fee: Optional[float]
    rating: Optional[float]


# ─── Appointment Models ───────────────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    doctor_id: str
    appointment_date: str  # "2024-06-15"
    appointment_time: str  # "10:00"
    reason: str
    appointment_type: str = "in-person"  # or "video"


class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    appointment_date: str
    appointment_time: str
    status: AppointmentStatus
    reason: str
    meeting_link: Optional[str] = None


# ─── Prescription Models ──────────────────────────────────────────────────────

class Medicine(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None


class PrescriptionCreate(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    diagnosis: str
    medicines: List[Medicine]
    notes: Optional[str] = None
    follow_up_date: Optional[str] = None


# ─── AI Prediction Models ─────────────────────────────────────────────────────

class SymptomInput(BaseModel):
    symptoms: List[str]
    age: Optional[int] = None
    gender: Optional[str] = None


class PredictionResponse(BaseModel):
    predicted_disease: str
    confidence: float
    description: str
    recommended_action: str
    risk_level: str


class DiabetesInput(BaseModel):
    pregnancies: int = 0
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree: float
    age: int


class HeartDiseaseInput(BaseModel):
    age: int
    sex: int
    chest_pain_type: int
    resting_bp: float
    cholesterol: float
    fasting_blood_sugar: int
    rest_ecg: int
    max_heart_rate: float
    exercise_angina: int
    oldpeak: float
    slope: int
    num_vessels: int
    thal: int


# ─── Chat Models ──────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    message: str
    language: str = "en"
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    language: str
    suggestions: List[str] = []


# ─── Wearable Models ─────────────────────────────────────────────────────────

class WearableData(BaseModel):
    heart_rate: Optional[float] = None
    spo2: Optional[float] = None
    steps: Optional[int] = None
    calories: Optional[float] = None
    sleep_hours: Optional[float] = None
    blood_pressure_systolic: Optional[float] = None
    blood_pressure_diastolic: Optional[float] = None
    timestamp: Optional[datetime] = None


# ─── Emergency Models ────────────────────────────────────────────────────────

class EmergencyAlert(BaseModel):
    patient_id: str
    alert_type: str
    vital_value: float
    risk_score: float
    level: EmergencyLevel
    message: str
    timestamp: datetime


# ─── Analytics Models ────────────────────────────────────────────────────────

class AnalyticsResponse(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    emergency_cases: int
    predictions_made: int
    active_users: int
