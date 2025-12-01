from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import sys
import os
import getpass
from pathlib import Path

parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from config import MONGO_URI, DB_NAME

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def validate_password(password: str) -> tuple[bool, str]:
    """Validate password meets security requirements"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        return False, "Password must contain at least one special character"
    return True, "Password is valid"

async def create_admin_user():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    # Option 1: Use environment variables (most secure for production)
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    
    # Option 2: Interactive prompt (good for development)
    if not email or not password:
        print("\n🔐 Create Admin User")
        print("-" * 40)
        email = input("Enter admin email: ").strip()
        password = getpass.getpass("Enter admin password: ").strip()
        password_confirm = getpass.getpass("Confirm password: ").strip()
        
        if password != password_confirm:
            print("❌ Passwords don't match!")
            client.close()
            return
        
        # Validate password strength
        is_valid, msg = validate_password(password)
        if not is_valid:
            print(f"❌ {msg}")
            client.close()
            return
    
    if not email or not password:
        print("❌ Email and password are required!")
        client.close()
        return

    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        # Update existing user to admin role
        await db.users.update_one({"email": email}, {"$set": {"role": "admin"}})
        print(f"✅ Updated existing user '{email}' to admin role.")
    else:
        # Create new admin user
        counter = await db.counters.find_one_and_update(
            {"_id": "user_id"},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=True
        )

        await db.users.insert_one({
            "id": counter["seq"],
            "name": input("Enter admin name: ").strip() or "Admin",
            "email": email,
            "password": password_context.hash(password),
            "role": "admin"
        })
        print(f"✅ Created new admin user '{email}'.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())