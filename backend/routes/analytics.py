from fastapi import APIRouter, Depends
from database import get_database
from middleware.auth import get_current_user, require_admin, require_doctor

router = APIRouter()


@router.get("/admin/overview", dependencies=[Depends(require_admin)])
async def get_admin_overview():
    """Admin dashboard - system overview"""
    db = get_database()
    
    total_users = await db.users.count_documents({})
    total_patients = await db.users.count_documents({"role": "patient"})
    total_doctors = await db.users.count_documents({"role": "doctor"})
    total_appointments = await db.appointments.count_documents({})
    total_predictions = await db.predictions.count_documents({})
    emergency_cases = await db.emergency_alerts.count_documents({"level": {"$in": ["high", "critical"]}})
    active_chats = await db.chat_history.count_documents({})
    xray_scans = await db.predictions.count_documents({"type": "xray"})
    
    return {
        "total_users": total_users,
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "total_predictions": total_predictions,
        "emergency_cases": emergency_cases,
        "active_chats": active_chats,
        "xray_scans": xray_scans,
    }


@router.get("/doctor/dashboard", dependencies=[Depends(require_doctor)])
async def get_doctor_dashboard(current_user=Depends(get_current_user)):
    """Doctor dashboard analytics"""
    db = get_database()
    doctor_id = str(current_user["_id"])
    
    total_appointments = await db.appointments.count_documents({"doctor_id": doctor_id})
    completed = await db.appointments.count_documents({"doctor_id": doctor_id, "status": "completed"})
    pending = await db.appointments.count_documents({"doctor_id": doctor_id, "status": "pending"})
    total_prescriptions = await db.prescriptions.count_documents({"doctor_id": doctor_id})
    
    return {
        "total_appointments": total_appointments,
        "completed_appointments": completed,
        "pending_appointments": pending,
        "total_prescriptions": total_prescriptions,
        "completion_rate": round(completed / total_appointments * 100, 1) if total_appointments else 0,
    }


@router.get("/patient/health-trends")
async def get_patient_health_trends(current_user=Depends(get_current_user)):
    """Patient health trends from wearable data"""
    db = get_database()
    patient_id = str(current_user["_id"])
    
    wearable_records = await db.wearable_data.find(
        {"patient_id": patient_id}
    ).sort("timestamp", -1).limit(30).to_list(30)
    
    predictions = await db.predictions.find(
        {"patient_id": patient_id}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    heart_rate_trend = [
        {"date": r["timestamp"].strftime("%Y-%m-%d"), "value": r.get("heart_rate")}
        for r in wearable_records if r.get("heart_rate")
    ]
    
    steps_trend = [
        {"date": r["timestamp"].strftime("%Y-%m-%d"), "value": r.get("steps")}
        for r in wearable_records if r.get("steps")
    ]
    
    for p in predictions:
        p["id"] = str(p.pop("_id", ""))
    
    return {
        "heart_rate_trend": heart_rate_trend[::-1],
        "steps_trend": steps_trend[::-1],
        "recent_predictions": predictions,
        "total_predictions": len(predictions),
    }
