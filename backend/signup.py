from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from database import get_database

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(BaseModel):
    name: str
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(user: User):
    db = get_database()
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = pwd_context.hash(user.password)
    await db.users.insert_one({
        "name": user.name,
        "email": user.email,
        "password_hash": hashed_pw,
    })

    return {"message": f"{user.name} successfully registered"}
