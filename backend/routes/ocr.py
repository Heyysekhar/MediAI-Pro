from fastapi import APIRouter, HTTPException, Depends
import os
from bson import ObjectId

from database import get_database
from middleware.auth import get_current_user

router = APIRouter()

@router.get("/history")
async def get_ocr_history(current_user=Depends(get_current_user)):
    """Get OCR scan history"""
    db = get_database()
    reports = await db.medical_reports.find(
        {"patient_id": str(current_user["_id"])}
    ).sort("created_at", -1).to_list(30)
    for r in reports:
        r["id"] = str(r.pop("_id", ""))
    return reports

@router.delete("/{report_id}")
async def delete_ocr_report(report_id: str, current_user=Depends(get_current_user)):
    """Delete an OCR report entry"""
    db = get_database()
    report = await db.medical_reports.find_one({
        "_id": ObjectId(report_id),
        "patient_id": str(current_user["_id"]),
    })
    if not report:
        raise HTTPException(status_code=404, detail="OCR report not found")

    await db.medical_reports.delete_one({"_id": ObjectId(report_id)})

    file_path = report.get("file_path")
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass

    return {"message": "OCR report deleted successfully"}
