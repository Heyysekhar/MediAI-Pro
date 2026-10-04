from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from typing import List

from database import get_database
from models.schemas import PatientProfile
from middleware.auth import get_current_user, require_doctor, require_admin

router = APIRouter()


def serialize_patient(p: dict) -> dict:
    p["id"] = str(p.pop("_id", ""))
    return p


@router.get("/profile")
async def get_my_profile(current_user=Depends(get_current_user)):
    """Get patient's own profile"""
    db = get_database()
    patient = await db.patients.find_one({"user_id": str(current_user["_id"])})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return serialize_patient(patient)


@router.put("/profile")
async def update_profile(profile: PatientProfile, current_user=Depends(get_current_user)):
    """Update patient profile"""
    db = get_database()
    update_data = profile.model_dump(exclude_none=True)
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.patients.update_one(
        {"user_id": str(current_user["_id"])},
        {"$set": update_data},
        upsert=True,
    )
    return {"message": "Profile updated successfully"}


@router.get("/medical-history")
async def get_medical_history(current_user=Depends(get_current_user)):
    """Get patient medical history"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    appointments = await db.appointments.find({"patient_id": user_id}).sort("created_at", -1).to_list(50)
    prescriptions = await db.prescriptions.find({"patient_id": user_id}).sort("created_at", -1).to_list(20)
    predictions = await db.predictions.find({"patient_id": user_id}).sort("created_at", -1).to_list(20)
    
    for a in appointments:
        a["id"] = str(a.pop("_id", ""))
    for p in prescriptions:
        p["id"] = str(p.pop("_id", ""))
    for pr in predictions:
        pr["id"] = str(pr.pop("_id", ""))
    
    return {
        "appointments": appointments,
        "prescriptions": prescriptions,
        "predictions": predictions,
    }


@router.get("/all", dependencies=[Depends(require_doctor)])
async def get_all_patients():
    """Get all patients (Doctor/Admin only)"""
    db = get_database()
    patients = await db.users.find({"role": "patient"}).to_list(100)
    for p in patients:
        p["id"] = str(p.pop("_id", ""))
        p.pop("password", None)
    return patients


@router.get("/{patient_id}", dependencies=[Depends(require_doctor)])
async def get_patient_by_id(patient_id: str):
    """Get specific patient details (Doctor only)"""
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(patient_id), "role": "patient"})
    if not user:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    patient_profile = await db.patients.find_one({"user_id": patient_id})
    user["id"] = str(user.pop("_id", ""))
    user.pop("password", None)
    user["profile"] = serialize_patient(patient_profile) if patient_profile else {}
    return user
