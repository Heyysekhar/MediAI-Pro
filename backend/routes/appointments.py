from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
import uuid

from database import get_database
from models.schemas import AppointmentCreate, AppointmentStatus
from middleware.auth import get_current_user, require_doctor

router = APIRouter()


@router.post("/book")
async def book_appointment(data: AppointmentCreate, current_user=Depends(get_current_user)):
    """Book a new appointment"""
    db = get_database()
    
    # Check doctor exists
    doctor = await db.users.find_one({"_id": ObjectId(data.doctor_id), "role": "doctor"})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Check slot availability
    existing = await db.appointments.find_one({
        "doctor_id": data.doctor_id,
        "appointment_date": data.appointment_date,
        "appointment_time": data.appointment_time,
        "status": {"$nin": ["cancelled"]},
    })
    if existing:
        raise HTTPException(status_code=400, detail="This time slot is already booked")
    
    meeting_link = None
    if data.appointment_type == "video":
        meeting_link = f"https://meet.mediai.pro/room/{uuid.uuid4().hex[:12]}"
    
    appointment = {
        "patient_id": str(current_user["_id"]),
        "doctor_id": data.doctor_id,
        "patient_name": current_user["full_name"],
        "doctor_name": doctor["full_name"],
        "appointment_date": data.appointment_date,
        "appointment_time": data.appointment_time,
        "reason": data.reason,
        "appointment_type": data.appointment_type,
        "status": AppointmentStatus.PENDING,
        "meeting_link": meeting_link,
        "created_at": datetime.utcnow(),
    }
    result = await db.appointments.insert_one(appointment)
    return {
        "message": "Appointment booked successfully!",
        "appointment_id": str(result.inserted_id),
        "meeting_link": meeting_link,
    }


@router.get("/my")
async def get_my_appointments(current_user=Depends(get_current_user)):
    """Get all appointments for logged-in user"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    if current_user["role"] == "doctor":
        appointments = await db.appointments.find({"doctor_id": user_id}).sort("appointment_date", -1).to_list(100)
    else:
        appointments = await db.appointments.find({"patient_id": user_id}).sort("appointment_date", -1).to_list(100)
    
    for a in appointments:
        a["id"] = str(a.pop("_id", ""))
    return appointments


@router.put("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    status: AppointmentStatus,
    current_user=Depends(get_current_user),
):
    """Update appointment status (Doctor confirms/cancels)"""
    db = get_database()
    appointment = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    await db.appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}},
    )
    return {"message": f"Appointment {status} successfully"}


@router.delete("/{appointment_id}/cancel")
async def cancel_appointment(appointment_id: str, current_user=Depends(get_current_user)):
    """Cancel an appointment"""
    db = get_database()
    await db.appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}},
    )
    return {"message": "Appointment cancelled"}


@router.get("/today", dependencies=[Depends(require_doctor)])
async def get_today_appointments(current_user=Depends(get_current_user)):
    """Get today's appointments (Doctor only)"""
    db = get_database()
    today = datetime.utcnow().strftime("%Y-%m-%d")
    appointments = await db.appointments.find({
        "doctor_id": str(current_user["_id"]),
        "appointment_date": today,
    }).to_list(50)
    for a in appointments:
        a["id"] = str(a.pop("_id", ""))
    return appointments
