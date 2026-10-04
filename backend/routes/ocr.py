from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from datetime import datetime
import shutil, os, uuid

from database import get_database
from middleware.auth import get_current_user

router = APIRouter()

OCR_UPLOAD_DIR = "uploads/reports"

MEDICAL_PATTERNS = {
    "blood_sugar": ["glucose", "sugar", "fasting glucose", "ppbs"],
    "blood_pressure": ["bp", "blood pressure", "systolic", "diastolic"],
    "hemoglobin": ["hemoglobin", "hgb", "hb", "haemoglobin"],
    "cholesterol": ["cholesterol", "ldl", "hdl", "triglycerides"],
    "creatinine": ["creatinine", "gfr", "kidney"],
}


def extract_values(text: str) -> dict:
    """Extract medical values from OCR text"""
    import re
    extracted = {}
    text_lower = text.lower()
    
    number_pattern = r'(\d+\.?\d*)'
    
    for category, keywords in MEDICAL_PATTERNS.items():
        for kw in keywords:
            if kw in text_lower:
                idx = text_lower.find(kw)
                segment = text_lower[idx:idx+50]
                numbers = re.findall(number_pattern, segment)
                if numbers:
                    extracted[category] = float(numbers[0])
                    break
    return extracted


@router.post("/scan")
async def scan_report(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """OCR scan medical report and extract values"""
    db = get_database()
    
    allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only images and PDFs allowed")
    
    os.makedirs(OCR_UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    filepath = f"{OCR_UPLOAD_DIR}/{filename}"
    
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    extracted_text = ""
    extracted_values = {}
    
    try:
        import pytesseract
        from PIL import Image
        
        if file.content_type != "application/pdf":
            img = Image.open(filepath)
            extracted_text = pytesseract.image_to_string(img)
        else:
            extracted_text = "PDF OCR requires pdf2image library"
        
        extracted_values = extract_values(extracted_text)
    except Exception as e:
        extracted_text = f"OCR processing: {str(e)}"
        extracted_values = {"note": "Install tesseract: sudo apt-get install tesseract-ocr"}
    
    doc = {
        "patient_id": str(current_user["_id"]),
        "filename": filename,
        "file_path": filepath,
        "file_url": f"/uploads/reports/{filename}",
        "extracted_text": extracted_text,
        "extracted_values": extracted_values,
        "created_at": datetime.utcnow(),
    }
    result = await db.medical_reports.insert_one(doc)
    
    return {
        "report_id": str(result.inserted_id),
        "extracted_text": extracted_text[:500],
        "extracted_values": extracted_values,
        "file_url": f"/uploads/reports/{filename}",
        "message": "Report scanned successfully",
    }


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
