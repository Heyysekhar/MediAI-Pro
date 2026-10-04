from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from datetime import datetime
import shutil, os, uuid

from database import get_database
from middleware.auth import get_current_user

router = APIRouter()

REPORTS_DIR = "uploads/medical_reports"


@router.post("/upload")
async def upload_report(
    file: UploadFile = File(...),
    report_type: str = "lab_report",
    current_user=Depends(get_current_user),
):
    """Upload medical report (PDF/Image)"""
    db = get_database()
    
    os.makedirs(REPORTS_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    filepath = f"{REPORTS_DIR}/{filename}"
    
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    doc = {
        "patient_id": str(current_user["_id"]),
        "patient_name": current_user["full_name"],
        "filename": file.filename,
        "stored_filename": filename,
        "file_url": f"/uploads/medical_reports/{filename}",
        "content_type": file.content_type,
        "report_type": report_type,
        "created_at": datetime.utcnow(),
    }
    result = await db.medical_reports.insert_one(doc)
    
    return {
        "message": "Report uploaded successfully",
        "report_id": str(result.inserted_id),
        "file_url": doc["file_url"],
    }


@router.get("/my")
async def get_my_reports(current_user=Depends(get_current_user)):
    """Get all reports for current user"""
    db = get_database()
    reports = await db.medical_reports.find(
        {"patient_id": str(current_user["_id"])}
    ).sort("created_at", -1).to_list(50)
    for r in reports:
        r["id"] = str(r.pop("_id", ""))
    return reports


@router.delete("/{report_id}")
async def delete_report(report_id: str, current_user=Depends(get_current_user)):
    """Delete a report"""
    from bson import ObjectId
    db = get_database()
    report = await db.medical_reports.find_one({
        "_id": ObjectId(report_id),
        "patient_id": str(current_user["_id"]),
    })
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if os.path.exists(report.get("file_url", "").lstrip("/")):
        os.remove(report["file_url"].lstrip("/"))
    
    await db.medical_reports.delete_one({"_id": ObjectId(report_id)})
    return {"message": "Report deleted"}
