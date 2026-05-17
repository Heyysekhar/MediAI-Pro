#!/bin/bash
# ============================================================
#  MediAI Pro - Quick Start Script (Linux/Mac)
#  Run: bash start.sh
# ============================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════╗"
echo "║       MediAI Pro - AI Healthcare System      ║"
echo "║         Starting All Services...             ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 not found. Install: sudo apt install python3${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python3 found${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found${NC}"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB not found locally. Use MongoDB Atlas or install MongoDB.${NC}"
fi

# Check Redis
if ! command -v redis-server &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis not found. Install: sudo apt install redis-server${NC}"
fi

echo ""
echo -e "${BLUE}[1/4] Setting up Backend...${NC}"
cd backend

# Create venv if not exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install requirements
echo "Installing Python packages (first time takes 3-5 min)..."
pip install -r requirements.txt -q

echo ""
echo -e "${BLUE}[2/4] Training AI Models...${NC}"
cd ../ml_models
python3 train_models.py
cp trained_models/*.pkl ../backend/ml_models/trained_models/ 2>/dev/null || true

echo ""
echo -e "${BLUE}[3/4] Starting Backend (FastAPI)...${NC}"
cd ../backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID) → http://localhost:8000${NC}"
echo -e "${GREEN}✅ API Docs → http://localhost:8000/docs${NC}"

sleep 3

echo ""
echo -e "${BLUE}[4/4] Starting Frontend (React)...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Installing Node packages (first time takes 2-3 min)..."
    npm install
fi
npm start &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID) → http://localhost:3000${NC}"

echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════╗"
echo "║          ✅ MediAI Pro is RUNNING!           ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  🌐 Frontend  → http://localhost:3000        ║"
echo "║  🔧 Backend   → http://localhost:8000        ║"
echo "║  📚 API Docs  → http://localhost:8000/docs   ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'; exit" INT
wait
