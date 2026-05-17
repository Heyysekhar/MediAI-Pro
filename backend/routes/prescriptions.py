from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from bson import ObjectId
from datetime import datetime
from fpdf import FPDF
import os

from database import get_database
from models.schemas import PrescriptionCreate
from middleware.auth import get_current_user, require_doctor

router = APIRouter()


def generate_pdf_prescription(prescription: dict, doctor_name: str, patient_name: str) -> str:
    """Generate PDF prescription using fpdf2"""
    pdf = FPDF()
    pdf.add_page()

    # Header
    pdf.set_fill_color(41, 128, 185)
    pdf.rect(0, 0, 210, 30, "F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_xy(0, 8)
    pdf.cell(210, 10, "MediAI Pro - Prescription", align="C")
    pdf.set_font("Helvetica", size=10)
    pdf.set_xy(0, 20)
    pdf.cell(210, 8, "AI-Powered Healthcare System", align="C")

    # Doctor & Patient Info
    pdf.set_text_color(0, 0, 0)
    pdf.set_xy(10, 40)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(90, 8, f"Doctor: Dr. {doctor_name}")
    pdf.cell(90, 8, f"Patient: {patient_name}")

    pdf.set_xy(10, 50)
    pdf.set_font("Helvetica", size=10)
    pdf.cell(90, 8, f"Date: {prescription.get('created_at', datetime.utcnow()).strftime('%d-%m-%Y')}")
    pdf.cell(90, 8, f"Rx No: {str(prescription.get('_id', 'N/A'))[:8].upper()}")

    # Divider
    pdf.set_draw_color(41, 128, 185)
    pdf.set_line_width(0.5)
    pdf.line(10, 62, 200, 62)

    # Diagnosis
    pdf.set_xy(10, 68)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Diagnosis:")
    pdf.set_xy(10, 76)
    pdf.set_font("Helvetica", size=11)
    pdf.cell(0, 8, prescription.get("diagnosis", ""))

    # Medicines
    pdf.set_xy(10, 90)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Prescribed Medicines:")

    pdf.set_xy(10, 100)
    pdf.set_fill_color(236, 240, 241)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(55, 8, "Medicine", border=1, fill=True)
    pdf.cell(30, 8, "Dosage", border=1, fill=True)
    pdf.cell(40, 8, "Frequency", border=1, fill=True)
    pdf.cell(30, 8, "Duration", border=1, fill=True)
    pdf.cell(35, 8, "Instructions", border=1, fill=True)

    y = 108
    pdf.set_font("Helvetica", size=10)
    for med in prescription.get("medicines", []):
        pdf.set_xy(10, y)
        pdf.cell(55, 8, med.get("name", ""), border=1)
        pdf.cell(30, 8, med.get("dosage", ""), border=1)
        pdf.cell(40, 8, med.get("frequency", ""), border=1)
        pdf.cell(30, 8, med.get("duration", ""), border=1)
        pdf.cell(35, 8, med.get("instructions", "-"), border=1)
        y += 8

    # Notes
    if prescription.get("notes"):
        pdf.set_xy(10, y + 10)
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, "Doctor's Notes:")
        pdf.set_xy(10, y + 18)
        pdf.set_font("Helvetica", size=10)
        pdf.cell(0, 8, prescription["notes"])

    # Follow-up
    if prescription.get("follow_up_date"):
        pdf.set_xy(10, y + 30)
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, f"Follow-up Date: {prescription['follow_up_date']}")

    # Footer
    pdf.set_xy(10, 270)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(128, 128, 128)
    pdf.cell(0, 8, "This is a computer-generated prescription from MediAI Pro | Not valid without doctor signature")

    os.makedirs("uploads/prescriptions", exist_ok=True)
    filepath = f"uploads/prescriptions/rx_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"
    pdf.output(filepath)
    return filepath


@router.post("/create", dependencies=[Depends(require_doctor)])
async def create_prescription(data: PrescriptionCreate, current_user=Depends(get_current_user)):
    """Create prescription and generate PDF"""
    db = get_database()
    
    patient = await db.users.find_one({"_id": ObjectId(data.patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    prescription_doc = {
        "patient_id": data.patient_id,
        "patient_name": patient["full_name"],
        "doctor_id": str(current_user["_id"]),
        "doctor_name": current_user["full_name"],
        "appointment_id": data.appointment_id,
        "diagnosis": data.diagnosis,
        "medicines": [m.model_dump() for m in data.medicines],
        "notes": data.notes,
        "follow_up_date": data.follow_up_date,
        "created_at": datetime.utcnow(),
    }
    result = await db.prescriptions.insert_one(prescription_doc)
    prescription_doc["_id"] = result.inserted_id
    
    pdf_path = generate_pdf_prescription(prescription_doc, current_user["full_name"], patient["full_name"])
    
    await db.prescriptions.update_one(
        {"_id": result.inserted_id},
        {"$set": {"pdf_path": pdf_path}},
    )
    return {
        "message": "Prescription created successfully",
        "prescription_id": str(result.inserted_id),
        "pdf_url": f"/{pdf_path}",
    }


@router.get("/my")
async def get_my_prescriptions(current_user=Depends(get_current_user)):
    """Get all prescriptions for current user"""
    db = get_database()
    user_id = str(current_user["_id"])
    
    if current_user["role"] == "doctor":
        prescriptions = await db.prescriptions.find({"doctor_id": user_id}).sort("created_at", -1).to_list(50)
    else:
        prescriptions = await db.prescriptions.find({"patient_id": user_id}).sort("created_at", -1).to_list(50)
    
    for p in prescriptions:
        p["id"] = str(p.pop("_id", ""))
    return prescriptions


@router.get("/{prescription_id}/download")
async def download_prescription(prescription_id: str, current_user=Depends(get_current_user)):
    """Download prescription PDF"""
    db = get_database()
    rx = await db.prescriptions.find_one({"_id": ObjectId(prescription_id)})
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    pdf_path = rx.get("pdf_path")
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF not found")
    
    return FileResponse(pdf_path, media_type="application/pdf", filename="prescription.pdf")
