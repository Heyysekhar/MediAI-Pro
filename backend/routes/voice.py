from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
import os, uuid, shutil
from datetime import datetime

from database import get_database
from middleware.auth import get_current_user

router = APIRouter()

VOICE_DIR = "uploads/voice"


@router.post("/transcribe")
async def transcribe_voice(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """Transcribe voice to text using Whisper"""
    os.makedirs(VOICE_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.wav"
    filepath = f"{VOICE_DIR}/{filename}"
    
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    transcript = ""
    
    try:
        import whisper
        model = whisper.load_model("base")
        result = model.transcribe(filepath)
        transcript = result["text"]
    except Exception as e:
        transcript = f"[Voice transcription requires: pip install openai-whisper] Error: {str(e)}"
    
    return {
        "transcript": transcript,
        "language": "auto-detected",
        "message": "Transcription complete",
    }


@router.post("/speak")
async def text_to_speech(text: str, lang: str = "en", current_user=Depends(get_current_user)):
    """Convert text to speech using gTTS"""
    os.makedirs(VOICE_DIR, exist_ok=True)
    
    try:
        from gtts import gTTS
        tts = gTTS(text=text, lang=lang, slow=False)
        filename = f"tts_{uuid.uuid4().hex}.mp3"
        filepath = f"{VOICE_DIR}/{filename}"
        tts.save(filepath)
        return FileResponse(filepath, media_type="audio/mpeg", filename="response.mp3")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")


@router.post("/command")
async def process_voice_command(transcript: str, current_user=Depends(get_current_user)):
    """Process voice command and return action"""
    cmd = transcript.lower().strip()
    
    commands = {
        "book appointment": {"action": "NAVIGATE", "route": "/appointments/book", "message": "Taking you to appointment booking!"},
        "show reports": {"action": "NAVIGATE", "route": "/reports", "message": "Opening your medical reports!"},
        "check symptoms": {"action": "NAVIGATE", "route": "/predict", "message": "Opening symptom checker!"},
        "my prescriptions": {"action": "NAVIGATE", "route": "/prescriptions", "message": "Showing your prescriptions!"},
        "emergency": {"action": "EMERGENCY", "route": "/emergency", "message": "🚨 Activating emergency protocol!"},
        "chatbot": {"action": "NAVIGATE", "route": "/chat", "message": "Opening MediBot!"},
        "dashboard": {"action": "NAVIGATE", "route": "/dashboard", "message": "Going to dashboard!"},
    }
    
    for keyword, action in commands.items():
        if keyword in cmd:
            return action
    
    return {
        "action": "CHAT",
        "message": "Command not recognized. Try: 'book appointment', 'show reports', 'check symptoms'",
        "available_commands": list(commands.keys()),
    }
