from fastapi import APIRouter, Depends
from datetime import datetime
from database import get_database
from middleware.auth import get_current_user

router = APIRouter()


@router.get("/")
async def get_notifications(current_user=Depends(get_current_user)):
    """Get notifications for current user"""
    db = get_database()
    notifications = await db.notifications.find(
        {"user_id": str(current_user["_id"])}
    ).sort("created_at", -1).limit(20).to_list(20)
    for n in notifications:
        n["id"] = str(n.pop("_id", ""))
    return notifications


@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user=Depends(get_current_user)):
    from bson import ObjectId
    db = get_database()
    await db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"is_read": True}},
    )
    return {"message": "Notification marked as read"}


@router.put("/read-all")
async def mark_all_read(current_user=Depends(get_current_user)):
    db = get_database()
    await db.notifications.update_many(
        {"user_id": str(current_user["_id"])},
        {"$set": {"is_read": True}},
    )
    return {"message": "All notifications marked as read"}
