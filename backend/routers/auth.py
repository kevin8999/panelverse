from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from models.auth import create_access_token
from config import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api", tags=["auth"])
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "reader"  # "artist" or "reader", defaults to reader

class UserLogin(BaseModel):
    email: EmailStr
    password: str

def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate password meets security requirements.
    Returns (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        return False, "Password must contain at least one special character"
    return True, ""

async def get_next_user_id(db):
    result = await db.counters.find_one_and_update(
        {"_id": "user_id"},               # find the counter document
        {"$inc": {"seq": 1}},             # increment "seq" atomically
        upsert=True,                      # create it if it doesn't exist
        return_document=True
    )
    return result["seq"]

@router.post("/signup")
async def signup(user: UserSignup, request: Request):
    """Register a new user and create jwt"""
    db = request.app.mongodb

    # Validate password requirements
    is_valid, error_msg = validate_password(user.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    print("Creating new user...")
    next_id = await get_next_user_id(db)
    access_token = create_access_token(data={"sub": user.email})

    hashed_password = password_context.hash(user.password)
    
    # Validate and normalize role - NEVER allow "admin" from public signup
    user_role = user.role.lower() if user.role.lower() in ["artist", "reader"] else "reader"
    
    # Security: Prevent admin role creation via public signup
    if user_role == "admin":
        user_role = "reader"  # Downgrade any admin attempts to reader

    new_user_data = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password, # stores hashed password
        "id": next_id,
        "role": user_role,  # "artist" or "reader"
        "access_token": access_token,
        "token_type": "bearer"
    }

    await db.users.insert_one(new_user_data)
    return {
        "message": f"{user.name} successfully registered",
        "access_token": access_token, 
        "token_type": "bearer"
        }


@router.post("/login")
async def login(credentials: UserLogin, request: Request):
    """Authenticate user and return jwt"""
    db = request.app.mongodb

    db_user = await db.users.find_one({"email": credentials.email})
    if not db_user or not password_context.verify(credentials.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": db_user["email"]})
    return {
        "message": f"Welcome back, {db_user['name']}!",
        "access_token": access_token,
        "token_type": "bearer"
    }