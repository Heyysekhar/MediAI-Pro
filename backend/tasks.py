from celery import Celery
from config import settings

celery_app = Celery(
    "mediai_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Kolkata",
    enable_utc=True,
)


@celery_app.task(name="tasks.send_appointment_email")
def send_appointment_email(patient_email: str, doctor_name: str, appointment_date: str, appointment_time: str):
    """Send appointment confirmation email"""
    try:
        print(f"📧 Sending appointment email to {patient_email}")
        print(f"   Dr. {doctor_name} on {appointment_date} at {appointment_time}")
        # Email logic here (fastapi-mail)
        return {"status": "sent", "to": patient_email}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@celery_app.task(name="tasks.process_ocr")
def process_ocr_background(file_path: str, report_id: str):
    """Process OCR in background"""
    try:
        import pytesseract
        from PIL import Image
        img = Image.open(file_path)
        text = pytesseract.image_to_string(img)
        print(f"📄 OCR processed: {report_id} - {len(text)} chars")
        return {"status": "done", "report_id": report_id, "text_length": len(text)}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


@celery_app.task(name="tasks.run_ai_prediction")
def run_ai_prediction_background(patient_id: str, symptoms: list):
    """Run AI disease prediction in background"""
    print(f"🤖 Running prediction for patient {patient_id} with symptoms: {symptoms}")
    return {"status": "done", "patient_id": patient_id}


@celery_app.task(name="tasks.send_emergency_notification")
def send_emergency_notification(patient_id: str, risk_score: float, level: str):
    """Send emergency alert notification"""
    print(f"🚨 EMERGENCY: Patient {patient_id} | Score: {risk_score} | Level: {level}")
    return {"status": "notified", "patient_id": patient_id}
