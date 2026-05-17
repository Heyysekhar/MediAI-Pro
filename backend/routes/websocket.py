from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
from datetime import datetime

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)

    async def send_personal(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))

    async def broadcast(self, message: dict, room_id: str):
        if room_id in self.active_connections:
            for conn in self.active_connections[room_id]:
                await conn.send_text(json.dumps(message))

    async def broadcast_except(self, message: dict, room_id: str, sender: WebSocket):
        if room_id in self.active_connections:
            for conn in self.active_connections[room_id]:
                if conn != sender:
                    await conn.send_text(json.dumps(message))


manager = ConnectionManager()


@router.websocket("/notifications/{user_id}")
async def notification_websocket(websocket: WebSocket, user_id: str):
    """Real-time notifications WebSocket"""
    await manager.connect(websocket, f"notif_{user_id}")
    try:
        await manager.send_personal(
            {"type": "connected", "message": "Connected to notifications", "timestamp": str(datetime.utcnow())},
            websocket,
        )
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            await manager.send_personal(
                {"type": "ack", "message": "Message received", "data": msg},
                websocket,
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, f"notif_{user_id}")


@router.websocket("/vitals/{patient_id}")
async def vitals_websocket(websocket: WebSocket, patient_id: str):
    """Real-time vitals monitoring WebSocket"""
    await manager.connect(websocket, f"vitals_{patient_id}")
    try:
        await manager.send_personal(
            {"type": "connected", "message": "Connected to vitals monitoring"},
            websocket,
        )
        while True:
            data = await websocket.receive_text()
            vitals = json.loads(data)
            
            # Check for emergency
            alerts = []
            if vitals.get("heart_rate", 0) > 120:
                alerts.append("⚠️ High heart rate detected!")
            if vitals.get("spo2", 100) < 90:
                alerts.append("🚨 Low oxygen level!")
            
            await manager.broadcast(
                {"type": "vitals_update", "data": vitals, "alerts": alerts, "timestamp": str(datetime.utcnow())},
                f"vitals_{patient_id}",
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, f"vitals_{patient_id}")


@router.websocket("/video/{room_id}")
async def video_signaling_websocket(websocket: WebSocket, room_id: str):
    """WebRTC video call signaling WebSocket"""
    await manager.connect(websocket, f"video_{room_id}")
    try:
        await manager.send_personal({"type": "connected", "room": room_id}, websocket)
        while True:
            data = await websocket.receive_text()
            signal = json.loads(data)
            # Relay WebRTC signals to other peer
            await manager.broadcast_except(signal, f"video_{room_id}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, f"video_{room_id}")
        await manager.broadcast(
            {"type": "peer_disconnected", "room": room_id},
            f"video_{room_id}",
        )
