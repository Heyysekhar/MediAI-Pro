from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import redis.asyncio as aioredis
from loguru import logger


class Database:
    client: AsyncIOMotorClient = None
    redis_client = None


db = Database()


async def connect_db():
    """Connect to MongoDB and Redis"""
    try:
        db.client = AsyncIOMotorClient(settings.MONGO_URL)
        await db.client.admin.command("ping")
        logger.info("✅ MongoDB connected successfully")
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        raise

    try:
        db.redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await db.redis_client.ping()
        logger.info("✅ Redis connected successfully")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")
        raise


async def close_db():
    """Close database connections"""
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed")
    if db.redis_client:
        await db.redis_client.close()
        logger.info("Redis connection closed")


def get_database():
    return db.client[settings.MONGO_DB_NAME]


def get_redis():
    return db.redis_client
