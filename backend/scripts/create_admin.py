from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import sys
from pathlib import Path

parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from config import MONGO_URI, DB_NAME

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin_user():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    email = "testadmin@gmail.com"
    password = "AdminPass#123!"

    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        await db.users.update_one({"email": email}, {"$set": {"role": "admin"}})
        print(f"✅ Updated existing user '{email}' to admin.")
    else:
        counter = await db.counters.find_one_and_update(
            {"_id": "user_id"},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=True
        )

        await db.users.insert_one({
            "id": counter["seq"],
            "name": "Admin",
            "email": email,
            "password": password_context.hash(password),
            "role": "admin"
        })
        print(f"✅ Created new admin user '{email}'.")
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())