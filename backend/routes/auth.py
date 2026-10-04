from fastapi import APIRouter, HTTPException, status, Depends
from passlib.context import CryptContext
from datetime import datetime
from bson import ObjectId

from database import get_database
from models.schemas import UserRegister, UserLogin, Token
from middleware.auth import create_access_token, create_refresh_token, get_current_user

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


@router.post("/register", response_model=dict, status_code=201)
async def register(user_data: UserRegister):
    """Register a new user (Patient / Doctor / Admin)"""
    db = get_database()
    
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "full_name": user_data.full_name,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "role": user_data.role,
        "phone": user_data.phone,
        "is_active": True,
        "is_verified": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create role-specific profile
    if user_data.role == "patient":
        await db.patients.insert_one({"user_id": user_id, "created_at": datetime.utcnow()})
    elif user_data.role == "doctor":
        await db.doctors.insert_one({"user_id": user_id, "created_at": datetime.utcnow()})
    
    return {
        "message": "Registration successful! Please login.",
        "user_id": user_id,
        "role": user_data.role,
    }


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login and get JWT tokens"""
    db = get_database()
    
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get("is_active"):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    user_id = str(user["_id"])
    token_data = {"sub": user_id, "role": user["role"]}
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Update last login
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.utcnow()}})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user_id,
            "full_name": user["full_name"],
            "email": user["email"],
            "role": user["role"],
        },
    )


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    """Get current logged-in user details"""
    return {
        "id": str(current_user["_id"]),
        "full_name": current_user["full_name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "phone": current_user.get("phone"),
        "is_active": current_user.get("is_active"),
        "created_at": current_user.get("created_at"),
    }


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Get new access token using refresh token"""
    from middleware.auth import verify_token
    from middleware.auth import create_access_token
    
    payload = verify_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    new_access = create_access_token({"sub": payload["sub"], "role": payload["role"]})
    return {"access_token": new_access, "token_type": "bearer"}


@router.put("/change-password")
async def change_password(old_password: str, new_password: str, current_user=Depends(get_current_user)):
    """Change user password"""
    if not verify_password(old_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="Old password is incorrect")
    
    db = get_database()
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password": hash_password(new_password), "updated_at": datetime.utcnow()}},
    )
    return {"message": "Password changed successfully"}
