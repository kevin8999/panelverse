import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path

# Add parent directory to path
parent_dir = Path(__file__).parent.parent
import sys
sys.path.insert(0, str(parent_dir))

from config import MONGO_URI, DB_NAME

async def create_indexes():
    """Create MongoDB indexes for better search performance"""
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    # text index for searching comics by title and description
    await db.comics.create_index([
        ("title", "text"),
        ("description", "text")
    ])

    # indexes for common queries
    await db.comics.create_index([("author_id", 1), ("upload_date", -1)])
    await db.comics.create_index([("author_id", 1), ("published", 1)])
    await db.comics.create_index("tags")

    print("✅ Indexes created successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(create_indexes())