from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from typing import Optional

from database import get_database
from models.schemas import DoctorProfile
from middleware.auth import get_current_user, require_doctor, require_admin

router = APIRouter()


@router.get("/")
async def get_all_doctors(specialization: Optional[str] = None):
    """Get all doctors (public - for booking)"""
    db = get_database()
    query = {"role": "doctor"}
    doctors = await db.users.find(query).to_list(100)
    result = []
    for d in doctors:
        doc_profile = await db.doctors.find_one({"user_id": str(d["_id"])})
        if specialization and doc_profile:
            if specialization.lower() not in doc_profile.get("specialization", "").lower():
                continue
        doctor_data = {
            "id": str(d["_id"]),
            "full_name": d["full_name"],
            "email": d["email"],
            "phone": d.get("phone"),
            "profile": doc_profile or {},
        }
        if doctor_data["profile"]:
            doctor_data["profile"].pop("_id", None)
        result.append(doctor_data)
    return result


@router.get("/profile", dependencies=[Depends(require_doctor)])
async def get_my_doctor_profile(current_user=Depends(get_current_user)):
    """Get doctor's own profile"""
    db = get_database()
    profile = await db.doctors.find_one({"user_id": str(current_user["_id"])})
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    profile["id"] = str(profile.pop("_id", ""))
    return profile


@router.put("/profile", dependencies=[Depends(require_doctor)])
async def update_doctor_profile(profile: DoctorProfile, current_user=Depends(get_current_user)):
    """Update doctor profile"""
    db = get_database()
    data = profile.model_dump(exclude_none=True)
    data["updated_at"] = datetime.utcnow()
    await db.doctors.update_one(
        {"user_id": str(current_user["_id"])},
        {"$set": data},
        upsert=True,
    )
    return {"message": "Doctor profile updated successfully"}


@router.get("/{doctor_id}")
async def get_doctor_by_id(doctor_id: str):
    """Get doctor details by ID"""
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(doctor_id), "role": "doctor"})
    if not user:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    profile = await db.doctors.find_one({"user_id": doctor_id})
    user["id"] = str(user.pop("_id", ""))
    user.pop("password", None)
    if profile:
        profile.pop("_id", None)
    user["profile"] = profile or {}
    return user


@router.get("/{doctor_id}/available-slots")
async def get_available_slots(doctor_id: str, date: str):
    """Get available time slots for a doctor on a given date"""
    db = get_database()
    profile = await db.doctors.find_one({"user_id": doctor_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    all_slots = profile.get("available_slots", ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"])
    
    booked = await db.appointments.find({
        "doctor_id": doctor_id,
        "appointment_date": date,
        "status": {"$nin": ["cancelled"]},
    }).to_list(100)
    
    booked_times = [b["appointment_time"] for b in booked]
    available = [s for s in all_slots if s not in booked_times]
    
    return {"date": date, "available_slots": available, "booked_slots": booked_times}
