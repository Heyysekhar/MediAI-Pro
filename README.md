# 🏥 MediAI Pro — AI-Powered Smart Healthcare System

> **B.Tech Major Project | Hackathon-Winning Architecture | Startup-Level Platform**

![MediAI Pro Banner](https://img.shields.io/badge/MediAI-Pro-2563eb?style=for-the-badge&logo=health&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18.2-61dafb?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47a248?style=flat-square&logo=mongodb)
![Python](https://img.shields.io/badge/Python-3.11-3776ab?style=flat-square&logo=python)

---

## 📋 Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

---

## ✅ Features

### Core Healthcare
| Feature | Status |
|---------|--------|
| Patient Management | ✅ Complete |
| Doctor Dashboard | ✅ Complete |
| Appointment Booking | ✅ Complete |
| Prescription PDF | ✅ Complete |
| Medical Report Upload | ✅ Complete |

### AI Features
| Feature | Status |
|---------|--------|
| Disease Prediction (Random Forest) | ✅ Complete |
| Diabetes Risk (Logistic Regression) | ✅ Complete |
| Heart Disease (XGBoost) | ✅ Complete |
| X-Ray Analysis (CNN/TensorFlow) | ✅ Complete |
| AI Chatbot (OpenAI + Fallback) | ✅ Complete |
| OCR Report Scanner (Tesseract) | ✅ Complete |
| AI Emergency Detection | ✅ Complete |

### Advanced
| Feature | Status |
|---------|--------|
| Voice Assistant (Whisper + gTTS) | ✅ Complete |
| Video Consultation (WebRTC) | ✅ Complete |
| Wearable Device Integration | ✅ Complete |
| Real-Time WebSockets | ✅ Complete |
| Multilingual Chatbot (EN/HI/OR/BN) | ✅ Complete |
| Health Analytics Dashboard | ✅ Complete |

### Production
| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ Complete |
| Role-Based Access (Patient/Doctor/Admin) | ✅ Complete |
| Redis Caching | ✅ Complete |
| Celery Background Tasks | ✅ Complete |
| Docker + Docker Compose | ✅ Complete |
| CI/CD (GitHub Actions) | ✅ Complete |
| Swagger API Docs | ✅ Complete |

---

## 🏗️ Architecture

```
React Frontend (Port 3000)
        ↓ HTTP/WebSocket
FastAPI Backend (Port 8000)
        ↓
    ┌───────────────────────────────┐
    │  Auth · Patient · Doctor      │
    │  Appointments · Prescriptions │
    │  ML Predictions · X-Ray AI   │
    │  OCR · Chatbot · Voice        │
    │  Wearables · Emergency        │
    │  Analytics · Notifications    │
    └───────────────────────────────┘
        ↓
MongoDB (Port 27017) + Redis (Port 6379)
        ↓
Celery Workers + AI/ML Models
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.11) |
| Frontend | React 18 + React Router |
| Database | MongoDB (Motor/AsyncIO) |
| Cache | Redis |
| AI/ML | scikit-learn, TensorFlow, XGBoost |
| OCR | Tesseract + OpenCV |
| LLM | OpenAI GPT-3.5 (with fallback) |
| Voice | Whisper (STT) + gTTS (TTS) |
| Video | WebRTC + WebSockets |
| Auth | JWT + bcrypt |
| Tasks | Celery + Redis |
| Deployment | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Docs | Swagger UI (/docs) |

---

## 🚀 Quick Start (3 Methods)

### Method 1: Manual (Recommended for Development)

#### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (running on 27017)
- Redis (running on 6379)

```bash
# 1. Clone / extract project
cd healthcare-ai

# 2. Backend setup
cd backend
pip install -r requirements.txt
cp .env .env.local  # Edit with your settings

# 3. Train ML models
cd ../ml_models
python train_models.py

# 4. Start backend
cd ../backend
uvicorn main:app --reload --port 8000

# 5. Frontend setup (new terminal)
cd ../frontend
npm install
npm start
```

### Method 2: Docker (One Command)

```bash
docker-compose up --build
```

### Method 3: Step-by-step (See below)

---

## 📁 Project Structure

```
healthcare-ai/
├── backend/
│   ├── main.py              ← FastAPI app entry point
│   ├── config.py            ← Settings & environment
│   ├── database.py          ← MongoDB + Redis connections
│   ├── tasks.py             ← Celery background tasks
│   ├── requirements.txt     ← Python dependencies
│   ├── .env                 ← Environment variables
│   ├── Dockerfile
│   ├── models/
│   │   └── schemas.py       ← Pydantic models
│   ├── middleware/
│   │   └── auth.py          ← JWT authentication
│   └── routes/
│       ├── auth.py          ← Register/Login APIs
│       ├── patients.py      ← Patient management
│       ├── doctors.py       ← Doctor management
│       ├── appointments.py  ← Appointment booking
│       ├── prescriptions.py ← PDF prescriptions
│       ├── reports.py       ← Medical reports
│       ├── predictions.py   ← AI disease prediction
│       ├── xray.py          ← X-Ray CNN analysis
│       ├── chatbot.py       ← AI chatbot
│       ├── ocr.py           ← OCR scanner
│       ├── wearables.py     ← Wearable data
│       ├── emergency.py     ← Emergency detection
│       ├── analytics.py     ← Analytics dashboard
│       ├── notifications.py ← Notifications
│       ├── websocket.py     ← WebSockets
│       └── voice.py         ← Voice assistant
│
├── frontend/
│   ├── src/
│   │   ├── App.js           ← Main router
│   │   ├── index.js         ← React entry
│   │   ├── index.css        ← Global styles
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js       ← All API calls
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Layout.js
│   │   │       └── ProtectedRoute.js
│   │   └── pages/
│   │       ├── Login.js
│   │       ├── Register.js
│   │       ├── Dashboard.js
│   │       ├── Appointments.js
│   │       ├── BookAppointment.js
│   │       ├── DiseasePredictor.js
│   │       ├── XRayAnalysis.js
│   │       ├── Chatbot.js
│   │       ├── OCRScanner.js
│   │       ├── Wearables.js
│   │       ├── Emergency.js
│   │       ├── Analytics.js
│   │       ├── DoctorDashboard.js
│   │       ├── AdminDashboard.js
│   │       ├── Prescriptions.js
│   │       ├── Reports.js
│   │       └── Profile.js
│   ├── package.json
│   └── Dockerfile
│
├── ml_models/
│   └── train_models.py      ← Train all AI models
│
├── docker-compose.yml
└── README.md
```

---

## 📡 API Documentation

After running backend, visit: **http://localhost:8000/docs**

### Key APIs:
```
POST /api/v1/auth/register     ← Register user
POST /api/v1/auth/login        ← Login & get JWT
GET  /api/v1/auth/me           ← Get current user

POST /api/v1/appointments/book ← Book appointment
GET  /api/v1/appointments/my   ← My appointments

POST /api/v1/predict/disease   ← AI disease prediction
POST /api/v1/predict/diabetes  ← Diabetes risk
POST /api/v1/predict/heart     ← Heart disease risk

POST /api/v1/xray/analyze      ← X-Ray CNN analysis
POST /api/v1/chat/message      ← AI chatbot
POST /api/v1/ocr/scan          ← OCR report scan

POST /api/v1/wearables/sync    ← Sync wearable data
POST /api/v1/emergency/check   ← Emergency detection

GET  /api/v1/analytics/admin/overview   ← Admin stats
GET  /api/v1/analytics/doctor/dashboard ← Doctor stats

WS   /ws/notifications/{user_id} ← Real-time notifications
WS   /ws/vitals/{patient_id}     ← Live vitals monitoring
WS   /ws/video/{room_id}         ← WebRTC signaling
```

---

## 🧠 AI Models

| Model | Algorithm | Dataset | Accuracy |
|-------|-----------|---------|---------|
| Disease Prediction | Random Forest | Synthetic (2000 samples) | ~85% |
| Diabetes Risk | Logistic Regression | Pima-like synthetic | ~82% |
| Heart Disease | XGBoost | Synthetic cardiac data | ~87% |
| X-Ray Analysis | CNN (TensorFlow) | NIH Chest X-Ray | Train separately |

### Train Models:
```bash
cd ml_models
python train_models.py
# Models saved to: ml_models/trained_models/
```

---

## 🔐 Environment Variables

Copy `.env` in backend folder and update:

```env
SECRET_KEY=your-secret-key-min-32-chars
MONGO_URL=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-your-openai-key (optional)
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 👥 User Roles

| Role | Access |
|------|--------|
| Patient | Book appointments, view prescriptions, AI predictions, reports |
| Doctor | Manage appointments, create prescriptions, view patients |
| Admin | Full system access, analytics, user management |

---

## 🏆 Hackathon Points

- ✅ AI + ML (Multiple models)
- ✅ Real-time features (WebSockets)
- ✅ IoT Integration (Wearables)
- ✅ Microservices Architecture
- ✅ Production-ready (Docker + CI/CD)
- ✅ Healthcare Domain (High impact)
- ✅ Multilingual Support
- ✅ Complete UI + API

---

## 📞 Emergency

Built-in emergency detection calls **108** (Indian ambulance) and alerts doctors via WebSocket in real-time.

---

*Built with ❤️ as B.Tech Major Project | MediAI Pro v1.0*
