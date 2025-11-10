from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

from models.user import User, Login, add_user, delete_user, get_user_by_id

from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "userdb")

# Initialize
app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# CORS. Lets react talk to server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

class User(BaseModel):
    name: str
    email: EmailStr
    password: str

@app.post("/api/signup")
async def signup(user: User):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    #hashed_pw = pwd_context.hash(user.password[:72])
    await db.users.insert_one({
        "name": user.name,
        "email": user.email,
        "password": user.password,
        "id": 0
    })

    return {"message": f"{user.name} successfully registered"}

@app.post("/api/login")
async def login(credentials: Login):
    db_user = await db.users.find_one({"email": credentials.email})
    if not db_user or db_user["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"message": f"Welcome back, {db_user['name']}!"}

# simple homepage endpoint
@app.get("/")
async def homepage():
    return {"status" : "ok"}

# check MongoDB connection through fastAPI endpoint
@app.get("/health/db")
async def db_health():
    try:
        await app.mongodb.command("ping")
        return {"db": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {e}")
    

@app.post("/users/", response_model=dict)
async def create_user(user: User):
    user_id = await add_user(app.mongodb, user)
    return {"user_id": user_id}

@app.delete("/users/{user_id}")
async def remove_user(user_id: str):
    result = await delete_user(app.mongodb, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": "User deleted successfully"}