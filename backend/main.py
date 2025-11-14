from fastapi import FastAPI, Form, File, UploadFile, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pprint import pprint

from typing import List
from models.user import User, Login, add_user, delete_user, get_user_by_id

from fastapi.middleware.cors import CORSMiddleware

from models.auth import create_access_token

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "userdb")

# Initialize
app = FastAPI()
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# CORS. Lets React talk to server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

class User(BaseModel):
    name: str
    email: EmailStr
    password: str

# Get next available user ID for signup
async def get_next_user_id():
    result = await db.counters.find_one_and_update(
        {"_id": "user_id"},               # find the counter document
        {"$inc": {"seq": 1}},             # increment "seq" atomically
        upsert=True,                      # create it if it doesn't exist
        return_document=True
    )
    return result["seq"]

@app.post("/api/signup")
async def signup(user: User):
    print("Received user:")
    pprint(user.dict())

    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # TODO: hash password (line below is broken)
    #hashed_pw = pwd_context.hash(user.password[:72])

    # Get next user ID
    next_id = await get_next_user_id()

    # Create JWT access token
    token = create_access_token({"sub": user.email})

    data = {
        "name": user.name,
        "email": user.email,
        "password": user.password,
        "id": next_id,
        "access_token": token,
        "token_type": bearer
    }

    await db.users.insert_one(data)

    data["message"] = f"{user.name} successfully registered"
    return data

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

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email: str = payload.get("sub")
        if user_email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await db.users.find_one({"email": user_email})
    if user is None:
        raise credentials_exception

    return user


@app.post("/api/upload")
async def upload_comic(
    title: str = Form(...),
    files: List[UploadFile] = File(...),
    current_user=Depends(get_current_user)
):
    os.makedirs("uploads", exist_ok=True)
    saved_paths = []

    for file in files:
        # Write file contents to disk
        contents = await file.read()
        with open(f"uploads/{file.filename}", "wb") as f:
            f.write(contents)
    

    print(f"✅ {current_user['email']} uploaded '{title}' with {len(saved_files)} files.")
    return {"message": f"{title} uploaded successfully!", "files": saved_files}

    return {
        "user_id": current_user['id'],
        "title": title,
        "file_count": len(files),
        "paths": saved_paths,
        "message": f"{title} uploaded successfully!",
        "files": saved_files
    }
