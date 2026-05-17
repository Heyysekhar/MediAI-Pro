from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import Optional

from database import get_database
from models.schemas import WearableData
from middleware.auth import get_current_user

router = APIRouter()


@router.post("/sync")
async def sync_wearable_data(data: WearableData, current_user=Depends(get_current_user)):
    """Sync wearable device data"""
    db = get_database()
    
    doc = data.model_dump()
    doc["patient_id"] = str(current_user["_id"])
    doc["timestamp"] = doc.get("timestamp") or datetime.utcnow()
    doc["synced_at"] = datetime.utcnow()
    
    await db.wearable_data.insert_one(doc)
    
    # Check for emergency conditions
    alerts = []
    if data.heart_rate and (data.heart_rate > 120 or data.heart_rate < 40):
        alerts.append(f"⚠️ Abnormal heart rate: {data.heart_rate} bpm")
    if data.spo2 and data.spo2 < 90:
        alerts.append(f"🚨 Low oxygen saturation: {data.spo2}%")
    
    return {
        "message": "Wearable data synced successfully",
        "timestamp": doc["timestamp"],
        "alerts": alerts,
    }


@router.get("/latest")
async def get_latest_vitals(current_user=Depends(get_current_user)):
    """Get latest wearable vitals"""
    db = get_database()
    latest = await db.wearable_data.find(
        {"patient_id": str(current_user["_id"])}
    ).sort("timestamp", -1).limit(1).to_list(1)
    
    if not latest:
        return {"message": "No wearable data found. Please sync your device."}
    
    data = latest[0]
    data["id"] = str(data.pop("_id", ""))
    return data


@router.get("/heart-rate")
async def get_heart_rate_history(current_user=Depends(get_current_user), limit: int = 24):
    """Get heart rate history"""
    db = get_database()
    records = await db.wearable_data.find(
        {"patient_id": str(current_user["_id"]), "heart_rate": {"$exists": True}}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return [{"timestamp": r["timestamp"], "heart_rate": r["heart_rate"]} for r in records]


@router.get("/sleep")
async def get_sleep_history(current_user=Depends(get_current_user), limit: int = 7):
    """Get sleep history"""
    db = get_database()
    records = await db.wearable_data.find(
        {"patient_id": str(current_user["_id"]), "sleep_hours": {"$exists": True}}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return [{"timestamp": r["timestamp"], "sleep_hours": r["sleep_hours"]} for r in records]


@router.get("/steps")
async def get_steps_history(current_user=Depends(get_current_user), limit: int = 7):
    """Get steps history"""
    db = get_database()
    records = await db.wearable_data.find(
        {"patient_id": str(current_user["_id"]), "steps": {"$exists": True}}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return [{"timestamp": r["timestamp"], "steps": r["steps"]} for r in records]


@router.get("/dashboard")
async def get_health_dashboard(current_user=Depends(get_current_user)):
    """Get complete health dashboard from wearables"""
    db = get_database()
    recent = await db.wearable_data.find(
        {"patient_id": str(current_user["_id"])}
    ).sort("timestamp", -1).limit(7).to_list(7)
    
    if not recent:
        return {"message": "No data. Sync your wearable device."}
    
    hr_values = [r["heart_rate"] for r in recent if r.get("heart_rate")]
    sleep_values = [r["sleep_hours"] for r in recent if r.get("sleep_hours")]
    step_values = [r["steps"] for r in recent if r.get("steps")]
    
    return {
        "avg_heart_rate": round(sum(hr_values) / len(hr_values), 1) if hr_values else None,
        "avg_sleep": round(sum(sleep_values) / len(sleep_values), 1) if sleep_values else None,
        "avg_steps": round(sum(step_values) / len(step_values)) if step_values else None,
        "latest": {k: v for k, v in recent[0].items() if k not in ["_id", "patient_id"]},
    }
