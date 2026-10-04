"""
ML Model Training Script
Run this to train all AI models

Usage: python train_models.py
"""
import numpy as np
import pandas as pd
import pickle
import os

os.makedirs("trained_models", exist_ok=True)
print("🤖 Starting AI Model Training...")


# ─── 1. DISEASE PREDICTION MODEL (Random Forest) ──────────────────────────────
print("\n[1/3] Training Disease Prediction Model...")

SYMPTOMS = [
    "fever", "headache", "cough", "chest pain", "shortness of breath",
    "fatigue", "nausea", "joint pain", "skin rash", "dizziness",
    "vomiting", "diarrhea", "sore throat", "runny nose", "body ache",
    "loss of appetite", "weight loss", "night sweats", "back pain", "abdominal pain",
]

DISEASES = [
    "Influenza", "Migraine", "Bronchitis", "Angina", "Asthma",
    "Anemia", "Gastroenteritis", "Arthritis", "Eczema", "Vertigo",
    "Food Poisoning", "IBS", "Tonsillitis", "Common Cold", "Dengue",
    "Malnutrition", "Tuberculosis", "Malaria", "Sciatica", "Appendicitis",
]

# Generate synthetic training data
np.random.seed(42)
n_samples = 2000
X = np.zeros((n_samples, len(SYMPTOMS)))
y = []

disease_symptom_map = {
    0: [0, 1, 14],          # Influenza: fever, headache, body ache
    1: [1, 9],               # Migraine: headache, dizziness
    2: [2, 4, 0],            # Bronchitis: cough, shortness of breath, fever
    3: [3, 4],               # Angina: chest pain, shortness of breath
    4: [4, 2],               # Asthma: shortness of breath, cough
    5: [5, 15],              # Anemia: fatigue, loss of appetite
    6: [6, 7, 11],           # Gastroenteritis: nausea, joint pain, diarrhea
    7: [7],                  # Arthritis: joint pain
    8: [8],                  # Eczema: skin rash
    9: [9, 1],               # Vertigo: dizziness, headache
    10: [6, 10, 11],         # Food Poisoning: nausea, vomiting, diarrhea
    11: [18, 19],            # IBS: back pain, abdominal pain
    12: [12, 0, 1],          # Tonsillitis: sore throat, fever, headache
    13: [13, 2, 12],         # Common Cold: runny nose, cough, sore throat
    14: [0, 5, 14, 9],       # Dengue: fever, fatigue, body ache, dizziness
    15: [15, 16, 5],         # Malnutrition: loss of appetite, weight loss, fatigue
    16: [2, 0, 17, 16],      # Tuberculosis: cough, fever, night sweats, weight loss
    17: [0, 14, 9, 5],       # Malaria: fever, body ache, dizziness, fatigue
    18: [18],                # Sciatica: back pain
    19: [19, 6, 0],          # Appendicitis: abdominal pain, nausea, fever
}

for i in range(n_samples):
    disease_idx = i % len(DISEASES)
    symptom_indices = disease_symptom_map.get(disease_idx, [0])
    
    row = np.zeros(len(SYMPTOMS))
    for idx in symptom_indices:
        row[idx] = 1
    # Add noise
    noise_indices = np.random.choice(len(SYMPTOMS), size=np.random.randint(0, 3), replace=False)
    for ni in noise_indices:
        row[ni] = np.random.choice([0, 1], p=[0.7, 0.3])
    
    X[i] = row
    y.append(DISEASES[disease_idx])

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
acc = model.score(X_test, y_test)
print(f"   ✅ Disease Model Accuracy: {acc*100:.2f}%")

with open("trained_models/disease_model.pkl", "wb") as f:
    pickle.dump(model, f)
print("   💾 Saved: trained_models/disease_model.pkl")


# ─── 2. DIABETES MODEL (Logistic Regression) ──────────────────────────────────
print("\n[2/3] Training Diabetes Prediction Model...")

from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Pima Indians Diabetes-like synthetic data
np.random.seed(42)
n = 1500

pregnancies = np.random.randint(0, 15, n)
glucose = np.random.normal(120, 30, n).clip(50, 200)
bp = np.random.normal(70, 15, n).clip(30, 120)
skin_thickness = np.random.normal(25, 10, n).clip(0, 60)
insulin = np.random.normal(80, 40, n).clip(0, 300)
bmi = np.random.normal(30, 7, n).clip(15, 60)
dpf = np.random.uniform(0.1, 2.5, n)
age = np.random.randint(18, 80, n)

X_diab = np.column_stack([pregnancies, glucose, bp, skin_thickness, insulin, bmi, dpf, age])

# Rule-based label: high glucose + high BMI + age → diabetic
y_diab = (
    (glucose > 140) | 
    ((glucose > 120) & (bmi > 30)) |
    ((age > 50) & (bmi > 35))
).astype(int)

X_train, X_test, y_train, y_test = train_test_split(X_diab, y_diab, test_size=0.2, random_state=42)

diab_model = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", LogisticRegression(max_iter=1000, random_state=42)),
])
diab_model.fit(X_train, y_train)
acc = diab_model.score(X_test, y_test)
print(f"   ✅ Diabetes Model Accuracy: {acc*100:.2f}%")

with open("trained_models/diabetes_model.pkl", "wb") as f:
    pickle.dump(diab_model, f)
print("   💾 Saved: trained_models/diabetes_model.pkl")


# ─── 3. HEART DISEASE MODEL (XGBoost) ─────────────────────────────────────────
print("\n[3/3] Training Heart Disease Model...")

try:
    from xgboost import XGBClassifier
    
    np.random.seed(42)
    n = 1200

    age_h = np.random.randint(29, 77, n)
    sex = np.random.randint(0, 2, n)
    cp = np.random.randint(0, 4, n)
    trestbps = np.random.normal(130, 20, n).clip(90, 200)
    chol = np.random.normal(240, 50, n).clip(120, 400)
    fbs = np.random.randint(0, 2, n)
    restecg = np.random.randint(0, 3, n)
    thalach = np.random.normal(150, 25, n).clip(70, 220)
    exang = np.random.randint(0, 2, n)
    oldpeak = np.random.uniform(0, 5, n)
    slope = np.random.randint(0, 3, n)
    ca = np.random.randint(0, 4, n)
    thal = np.random.randint(1, 4, n)

    X_heart = np.column_stack([age_h, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal])
    y_heart = (
        (chol > 280) | (trestbps > 150) | (cp >= 2) | (age_h > 60)
    ).astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X_heart, y_heart, test_size=0.2, random_state=42)

    heart_model = XGBClassifier(n_estimators=100, random_state=42, eval_metric="logloss")
    heart_model.fit(X_train, y_train)
    acc = heart_model.score(X_test, y_test)
    print(f"   ✅ Heart Disease Model Accuracy: {acc*100:.2f}%")

    with open("trained_models/heart_model.pkl", "wb") as f:
        pickle.dump(heart_model, f)
    print("   💾 Saved: trained_models/heart_model.pkl")

except ImportError:
    print("   ⚠️ XGBoost not installed. Using RandomForest as fallback...")
    from sklearn.ensemble import RandomForestClassifier
    heart_model = RandomForestClassifier(n_estimators=100, random_state=42)
    heart_model.fit(X_train[:800], y_heart[:800])
    with open("trained_models/heart_model.pkl", "wb") as f:
        pickle.dump(heart_model, f)


print("\n" + "="*50)
print("✅ ALL MODELS TRAINED SUCCESSFULLY!")
print("="*50)
print("Models saved in: ml_models/trained_models/")
print("  - disease_model.pkl")
print("  - diabetes_model.pkl")
print("  - heart_model.pkl")
print("\n🚀 Now run the backend: uvicorn main:app --reload")
