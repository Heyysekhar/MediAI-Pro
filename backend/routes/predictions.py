from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import numpy as np
import os, pickle

from database import get_database
from models.schemas import SymptomInput, DiabetesInput, HeartDiseaseInput, PredictionResponse
from middleware.auth import get_current_user

router = APIRouter()

# ─── Disease Knowledge Base (used when model not trained yet) ─────────────────
DISEASE_KB = {
    "fever": {"disease": "Influenza", "description": "Viral flu infection", "action": "Rest, fluids, paracetamol", "risk": "low"},
    "headache": {"disease": "Migraine / Tension Headache", "description": "Head pain condition", "action": "Rest in dark room, pain relievers", "risk": "low"},
    "cough": {"disease": "Upper Respiratory Infection", "description": "Common cold or bronchitis", "action": "Steam, cough syrup, hydration", "risk": "low"},
    "chest pain": {"disease": "Angina / Cardiac Issue", "description": "Possible heart-related condition", "action": "EMERGENCY - Seek immediate care", "risk": "critical"},
    "shortness of breath": {"disease": "Asthma / Pneumonia", "description": "Breathing difficulty", "action": "Inhaler or seek doctor immediately", "risk": "high"},
    "fatigue": {"disease": "Anemia / Hypothyroidism", "description": "Chronic tiredness condition", "action": "Blood test, iron supplements", "risk": "medium"},
    "nausea": {"disease": "Gastritis / Food Poisoning", "description": "Stomach infection or irritation", "action": "ORS, bland diet, antiemetics", "risk": "low"},
    "joint pain": {"disease": "Arthritis / Gout", "description": "Joint inflammation", "action": "Anti-inflammatory meds, physiotherapy", "risk": "medium"},
    "skin rash": {"disease": "Allergy / Dermatitis", "description": "Allergic skin reaction", "action": "Antihistamines, avoid allergens", "risk": "low"},
    "dizziness": {"disease": "Vertigo / Low BP", "description": "Balance/blood pressure issue", "action": "Rest, hydrate, BP check", "risk": "medium"},
}

SYMPTOMS_LIST = [
    "fever", "headache", "cough", "chest pain", "shortness of breath",
    "fatigue", "nausea", "joint pain", "skin rash", "dizziness",
    "vomiting", "diarrhea", "sore throat", "runny nose", "body ache",
    "loss of appetite", "weight loss", "night sweats", "back pain", "abdominal pain",
]


def load_model(path: str):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return pickle.load(f)
    return None


@router.post("/disease", response_model=PredictionResponse)
async def predict_disease(data: SymptomInput, current_user=Depends(get_current_user)):
    """Predict disease from symptoms using AI"""
    db = get_database()
    
    symptoms_lower = [s.lower().strip() for s in data.symptoms]
    
    # Try ML model first
    model = load_model("ml_models/trained_models/disease_model.pkl")
    
    if model:
        # Vectorize symptoms
        feature_vector = [1 if s in symptoms_lower else 0 for s in SYMPTOMS_LIST]
        prediction = model.predict([feature_vector])[0]
        prob = max(model.predict_proba([feature_vector])[0])
        result = {
            "predicted_disease": prediction,
            "confidence": round(float(prob) * 100, 2),
            "description": f"AI model predicts {prediction} based on your symptoms",
            "recommended_action": "Consult a doctor for confirmation",
            "risk_level": "medium",
        }
    else:
        # Fallback: rule-based KB
        matched = None
        for s in symptoms_lower:
            for key, val in DISEASE_KB.items():
                if key in s or s in key:
                    matched = val
                    break
        
        if matched:
            result = {
                "predicted_disease": matched["disease"],
                "confidence": 72.5,
                "description": matched["description"],
                "recommended_action": matched["action"],
                "risk_level": matched["risk"],
            }
        else:
            result = {
                "predicted_disease": "Unknown - Multiple possible conditions",
                "confidence": 45.0,
                "description": "Symptoms do not match known patterns clearly",
                "recommended_action": "Please consult a doctor for proper diagnosis",
                "risk_level": "medium",
            }
    
    # Save prediction
    prediction_doc = {
        "patient_id": str(current_user["_id"]),
        "type": "disease",
        "symptoms": data.symptoms,
        "result": result,
        "created_at": datetime.utcnow(),
    }
    await db.predictions.insert_one(prediction_doc)
    
    return PredictionResponse(**result)


@router.post("/diabetes")
async def predict_diabetes(data: DiabetesInput, current_user=Depends(get_current_user)):
    """Predict diabetes risk using ML"""
    db = get_database()
    
    model = load_model("ml_models/trained_models/diabetes_model.pkl")
    
    features = [[
        data.pregnancies, data.glucose, data.blood_pressure, data.skin_thickness,
        data.insulin, data.bmi, data.diabetes_pedigree, data.age,
    ]]
    
    if model:
        prediction = int(model.predict(features)[0])
        prob = float(max(model.predict_proba(features)[0]))
    else:
        # Rule-based fallback
        risk_score = 0
        if data.glucose > 126: risk_score += 30
        if data.bmi > 30: risk_score += 20
        if data.age > 45: risk_score += 15
        if data.blood_pressure > 90: risk_score += 10
        prediction = 1 if risk_score >= 40 else 0
        prob = min(risk_score / 100, 0.95)
    
    result = {
        "prediction": "Diabetic" if prediction == 1 else "Non-Diabetic",
        "risk_percentage": round(prob * 100, 2),
        "risk_level": "High" if prediction == 1 else "Low",
        "recommendation": "Consult endocrinologist immediately" if prediction == 1 else "Maintain healthy lifestyle",
    }
    
    await db.predictions.insert_one({
        "patient_id": str(current_user["_id"]),
        "type": "diabetes",
        "input": data.model_dump(),
        "result": result,
        "created_at": datetime.utcnow(),
    })
    return result


@router.post("/heart")
async def predict_heart_disease(data: HeartDiseaseInput, current_user=Depends(get_current_user)):
    """Predict heart disease risk"""
    db = get_database()
    
    model = load_model("ml_models/trained_models/heart_model.pkl")
    
    features = [[
        data.age, data.sex, data.chest_pain_type, data.resting_bp,
        data.cholesterol, data.fasting_blood_sugar, data.rest_ecg,
        data.max_heart_rate, data.exercise_angina, data.oldpeak,
        data.slope, data.num_vessels, data.thal,
    ]]
    
    if model:
        prediction = int(model.predict(features)[0])
        prob = float(max(model.predict_proba(features)[0]))
    else:
        risk_score = 0
        if data.age > 55: risk_score += 20
        if data.cholesterol > 240: risk_score += 20
        if data.resting_bp > 140: risk_score += 20
        if data.chest_pain_type in [3, 4]: risk_score += 25
        prediction = 1 if risk_score >= 45 else 0
        prob = min(risk_score / 100, 0.95)
    
    result = {
        "prediction": "Heart Disease Risk Detected" if prediction == 1 else "Low Heart Disease Risk",
        "risk_percentage": round(prob * 100, 2),
        "risk_level": "High" if prediction == 1 else "Low",
        "recommendation": "Consult cardiologist urgently" if prediction == 1 else "Regular checkups recommended",
    }
    
    await db.predictions.insert_one({
        "patient_id": str(current_user["_id"]),
        "type": "heart_disease",
        "input": data.model_dump(),
        "result": result,
        "created_at": datetime.utcnow(),
    })
    return result


@router.get("/history")
async def get_prediction_history(current_user=Depends(get_current_user)):
    """Get all AI predictions for current user"""
    db = get_database()
    predictions = await db.predictions.find(
        {"patient_id": str(current_user["_id"])}
    ).sort("created_at", -1).to_list(50)
    
    for p in predictions:
        p["id"] = str(p.pop("_id", ""))
    return predictions
