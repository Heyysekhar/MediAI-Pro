from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import uuid

from database import get_database
from models.schemas import ChatMessage, ChatResponse
from middleware.auth import get_current_user
from config import settings

router = APIRouter()

# ─── Multilingual Responses ───────────────────────────────────────────────────
RESPONSES = {
    "en": {
        "greeting": "Hello! I'm MediBot, your AI health assistant. How can I help you today?",
        "fever": "Fever can indicate infection. Rest, drink plenty of water, take paracetamol. If above 103°F, see a doctor immediately.",
        "headache": "Headaches can be tension, migraine or sinus. Rest in a dark room, stay hydrated. Persistent headaches need a doctor.",
        "appointment": "I can help you book an appointment! Go to the Appointments section and choose a doctor.",
        "report": "You can upload your medical reports in the Reports section for AI analysis.",
        "emergency": "🚨 EMERGENCY! Please call 108 (India ambulance) or go to nearest hospital immediately!",
        "default": "I understand you have a health concern. Please describe your symptoms in detail and I'll help you.",
    },
    "hi": {
        "greeting": "नमस्ते! मैं MediBot हूँ, आपका AI स्वास्थ्य सहायक। आज मैं आपकी कैसे मदद कर सकता हूँ?",
        "fever": "बुखार संक्रमण का संकेत हो सकता है। आराम करें, पानी पिएं, पैरासिटामॉल लें। 103°F से ऊपर है तो तुरंत डॉक्टर के पास जाएं।",
        "headache": "सिरदर्द तनाव, माइग्रेन या साइनस के कारण हो सकता है। अंधेरे कमरे में आराम करें।",
        "appointment": "मैं आपको अपॉइंटमेंट बुक करने में मदद कर सकता हूँ! अपॉइंटमेंट्स सेक्शन पर जाएं।",
        "emergency": "🚨 आपातकाल! कृपया 108 पर कॉल करें या तुरंत नजदीकी अस्पताल जाएं!",
        "default": "मैं समझता हूँ आपको स्वास्थ्य संबंधी समस्या है। कृपया अपने लक्षण विस्तार से बताएं।",
    },
    "or": {
        "greeting": "ନମସ୍କାର! ମୁଁ MediBot, ଆପଣଙ୍କ AI ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
        "default": "ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ସମ୍ବନ୍ଧୀୟ ସମସ୍ୟା ବୁଝି ପାରୁଛି। ଦୟାକରି ଆପଣଙ୍କ ଲକ୍ଷଣ ବିସ୍ତାରରେ କୁହନ୍ତୁ।",
        "emergency": "🚨 ଜରୁରୀ ଅବସ୍ଥା! 108 ରେ ଫୋନ କରନ୍ତୁ।",
    },
    "bn": {
        "greeting": "নমস্কার! আমি MediBot, আপনার AI স্বাস্থ্য সহায়ক। আজ কীভাবে সাহায্য করতে পারি?",
        "default": "আপনার স্বাস্থ্য সমস্যা বুঝতে পারছি। অনুগ্রহ করে আপনার লক্ষণগুলি বিস্তারিত বলুন।",
        "emergency": "🚨 জরুরি অবস্থা! ১০৮ নম্বরে ফোন করুন।",
    },
}

KEYWORDS = {
    "greeting": ["hello", "hi", "hey", "namaste", "good morning", "नमस्ते", "হ্যালো"],
    "fever": ["fever", "temperature", "bukhar", "বুখার", "ଜ୍ଵର", "बुखार"],
    "headache": ["headache", "head pain", "sir dard", "सिरदर्द", "মাথাব্যথা"],
    "emergency": ["emergency", "chest pain", "can't breathe", "unconscious", "heart attack"],
    "appointment": ["appointment", "book", "doctor", "schedule", "अपॉइंटमेंट"],
    "report": ["report", "upload", "lab", "test", "रिपोर्ट"],
}

SUGGESTIONS = {
    "en": ["Show my reports", "Book appointment", "Check symptoms", "Emergency help"],
    "hi": ["मेरी रिपोर्ट दिखाएं", "अपॉइंटमेंट बुक करें", "लक्षण जांचें", "आपातकालीन सहायता"],
}


def classify_intent(message: str, language: str) -> str:
    msg_lower = message.lower()
    for intent, keywords in KEYWORDS.items():
        if any(k in msg_lower for k in keywords):
            return intent
    return "default"


async def get_openai_response(message: str, history: list, language: str) -> str:
    """Get response from OpenAI GPT if API key is configured"""
    if not settings.OPENAI_API_KEY:
        return None
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        system_prompt = f"""You are MediBot, an AI medical assistant for MediAI Pro healthcare platform.
        Respond in {language} language. Be helpful, empathetic and professional.
        Always recommend consulting a real doctor for serious conditions.
        Keep responses concise and clear. Format nicely."""
        
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history[-6:])  # Last 3 turns
        messages.append({"role": "user", "content": message})
        
        resp = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=400,
        )
        return resp.choices[0].message.content
    except Exception:
        return None


@router.post("/message", response_model=ChatResponse)
async def chat(data: ChatMessage, current_user=Depends(get_current_user)):
    """Send message to AI chatbot"""
    db = get_database()
    
    session_id = data.session_id or uuid.uuid4().hex
    lang = data.language if data.language in RESPONSES else "en"
    
    # Get chat history for context
    history_docs = await db.chat_history.find(
        {"session_id": session_id}
    ).sort("timestamp", -1).limit(6).to_list(6)
    
    openai_history = [
        {"role": h["role"], "content": h["content"]}
        for h in reversed(history_docs)
    ]
    
    # Try OpenAI first
    ai_reply = await get_openai_response(data.message, openai_history, lang)
    
    if not ai_reply:
        # Fallback: rule-based
        intent = classify_intent(data.message, lang)
        lang_responses = RESPONSES.get(lang, RESPONSES["en"])
        ai_reply = lang_responses.get(intent, lang_responses["default"])
    
    # Save conversation
    await db.chat_history.insert_many([
        {
            "session_id": session_id,
            "user_id": str(current_user["_id"]),
            "role": "user",
            "content": data.message,
            "language": lang,
            "timestamp": datetime.utcnow(),
        },
        {
            "session_id": session_id,
            "user_id": str(current_user["_id"]),
            "role": "assistant",
            "content": ai_reply,
            "language": lang,
            "timestamp": datetime.utcnow(),
        },
    ])
    
    suggestions = SUGGESTIONS.get(lang, SUGGESTIONS["en"])
    
    return ChatResponse(
        reply=ai_reply,
        session_id=session_id,
        language=lang,
        suggestions=suggestions,
    )


@router.get("/history")
async def get_chat_history(session_id: str = None, current_user=Depends(get_current_user)):
    """Get chat history"""
    db = get_database()
    query = {"user_id": str(current_user["_id"])}
    if session_id:
        query["session_id"] = session_id
    
    history = await db.chat_history.find(query).sort("timestamp", 1).to_list(100)
    for h in history:
        h["id"] = str(h.pop("_id", ""))
    return history
