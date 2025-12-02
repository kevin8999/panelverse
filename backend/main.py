from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, DB_NAME, ALLOWED_ORIGINS, UPLOAD_DIR
from routers import auth, user, comics, admin
from pathlib import Path
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    app.mongodb_client = AsyncIOMotorClient(MONGO_URI)
    app.mongodb = app.mongodb_client[DB_NAME]
    yield
    # Shutdown: Close MongoDB connection
    app.mongodb_client.close()

app = FastAPI(title="Panel-Verse API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Create upload directory
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

# Serve media files - mount at /media and serve from directory containing UPLOAD_DIR
# Use the configured UPLOAD_DIR (eg. "media/uploads") and mount its parent (eg. "media").
# Resolve it relative to the current working directory to avoid mismatches when the
# process is started from a different CWD.
media_dir = (Path.cwd() / UPLOAD_DIR).parent
app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")

# Include routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(comics.router)
app.include_router(admin.router)

# Health endpoints
@app.get("/")
async def homepage():
    return {"status": "ok", "message": "Panel-Verse API"}

@app.get("/health/db")
async def db_health():
    try:
        await app.mongodb.command("ping")
        return {"db": "ok"}
    except Exception as e:
        return {"db": "error", "detail": str(e)}
