from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "MediAI Pro"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # MongoDB
    MONGO_URL: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "healthcare_ai_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # OpenAI
    OPENAI_API_KEY: str = ""

    # Email
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"

    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"

    # Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10485760

    # Emergency thresholds
    EMERGENCY_HEART_RATE_HIGH: int = 120
    EMERGENCY_HEART_RATE_LOW: int = 40
    EMERGENCY_SPO2_LOW: int = 90
    EMERGENCY_BP_HIGH: int = 180

    # ML Model Paths
    DISEASE_MODEL_PATH: str = "ml_models/trained_models/disease_model.pkl"
    XRAY_MODEL_PATH: str = "ml_models/trained_models/xray_model.h5"
    DIABETES_MODEL_PATH: str = "ml_models/trained_models/diabetes_model.pkl"
    HEART_MODEL_PATH: str = "ml_models/trained_models/heart_model.pkl"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
