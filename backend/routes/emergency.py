from fastapi import APIRouter, Depends
from datetime import datetime
from typing import Optional

from database import get_database
from middleware.auth import get_current_user
from config import settings

router = APIRouter()


def calculate_risk_score(vitals: dict) -> tuple[float, str]:
    """Calculate emergency risk score from vitals"""
    score = 0
    reasons = []
    
    hr = vitals.get("heart_rate")
    spo2 = vitals.get("spo2")
    bp_sys = vitals.get("blood_pressure_systolic")
    
    if hr:
        if hr > settings.EMERGENCY_HEART_RATE_HIGH:
            score += 35
            reasons.append(f"High heart rate: {hr} bpm")
        elif hr < settings.EMERGENCY_HEART_RATE_LOW:
            score += 45
            reasons.append(f"Critically low heart rate: {hr} bpm")
    
    if spo2 and spo2 < settings.EMERGENCY_SPO2_LOW:
        score += 40
        reasons.append(f"Low SpO2: {spo2}%")
    
    if bp_sys and bp_sys > settings.EMERGENCY_BP_HIGH:
        score += 30
        reasons.append(f"Hypertensive crisis: {bp_sys} mmHg")
    
    if score >= 70:
        level = "critical"
    elif score >= 45:
        level = "high"
    elif score >= 20:
        level = "medium"
    else:
        level = "low"
    
    return score, level, reasons


@router.post("/check")
async def check_emergency(vitals: dict, current_user=Depends(get_current_user)):
    """Check vitals for emergency conditions"""
    db = get_database()
    
    risk_score, level, reasons = calculate_risk_score(vitals)
    
    alert = {
        "patient_id": str(current_user["_id"]),
        "patient_name": current_user["full_name"],
        "vitals": vitals,
        "risk_score": risk_score,
        "level": level,
        "reasons": reasons,
        "timestamp": datetime.utcnow(),
        "acknowledged": False,
    }
    
    if risk_score > 20:
        await db.emergency_alerts.insert_one(alert)
    
    return {
        "risk_score": risk_score,
        "level": level,
        "is_emergency": risk_score >= 45,
        "reasons": reasons,
        "action": "CALL 108 IMMEDIATELY!" if risk_score >= 70 else "Contact your doctor",
    }


@router.get("/alerts")
async def get_my_alerts(current_user=Depends(get_current_user)):
    """Get emergency alerts for current user"""
    db = get_database()
    alerts = await db.emergency_alerts.find(
        {"patient_id": str(current_user["_id"])}
    ).sort("timestamp", -1).to_list(20)
    for a in alerts:
        a["id"] = str(a.pop("_id", ""))
    return alerts


@router.get("/all-alerts")
async def get_all_alerts(current_user=Depends(get_current_user)):
    """Get all emergency alerts (Doctor/Admin)"""
    if current_user["role"] not in ["doctor", "admin"]:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Access denied")
    
    db = get_database()
    alerts = await db.emergency_alerts.find(
        {"level": {"$in": ["high", "critical"]}, "acknowledged": False}
    ).sort("timestamp", -1).to_list(50)
    for a in alerts:
        a["id"] = str(a.pop("_id", ""))
    return alerts


@router.put("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, current_user=Depends(get_current_user)):
    """Acknowledge an emergency alert"""
    from bson import ObjectId
    db = get_database()
    await db.emergency_alerts.update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": {"acknowledged": True, "acknowledged_by": str(current_user["_id"]), "acknowledged_at": datetime.utcnow()}},
    )
    return {"message": "Alert acknowledged"}
