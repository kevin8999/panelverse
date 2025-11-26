from fastapi import APIRouter, File, Form, UploadFile, Depends, HTTPException, BackgroundTasks, Request
from typing import List
import os
import uuid
from pathlib import Path
from PIL import Image
from dependencies import get_current_user
from config import UPLOAD_DIR, MAX_FILE_SIZE, ALLOWED_EXTENSIONS
from datetime import datetime, timezone
from bson import ObjectId


router = APIRouter(prefix="/api", tags=["comics"])

# check upload directory exists
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

def create_thumbnail(file_path: str, thumb_size=(400, 400)):
    """Create thumbnail image in background."""
    try:
        image = Image.open(file_path)
        image.thumbnail(thumb_size)
        thumb_path = file_path.replace(".jpg", "_thumb.jpg")
        image.save(thumb_path)
        print(f"✅ Thumbnail created at {thumb_path}")
    except Exception as e:
        print(f" ❌ Error creating thumbnail: {e}")


@router.post("/upload")
async def upload_comic(
    request: Request,
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: str = Form(""),
    files: List[UploadFile] = File(...),
    current_user=Depends(get_current_user),
):
    """Upload comic files and save metadata to MongoDB database"""
    db = request.app.mongodb
    saved_files = []

    for file in files:
        # validate file extension
        extension = Path(file.filename).suffix.lower()
        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"File type {extension} not allowed.")
        
        # read and validate file size
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File size exceeds maximum limit.")
        
        # generate unique filename and save file
        unique_filename = f"{uuid.uuid4().hex}{extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        with open(file_path, "wb") as f:
            f.write(contents)

        # create thumbnail in background
        if extension in [".jpg", ".jpeg", ".png"]:
            background_tasks.add_task(create_thumbnail, file_path)

        saved_files.append({
            "filename": unique_filename,
            "original_filename": file.filename,
            "url": f"/{UPLOAD_DIR}/{unique_filename}"
        })

    # save comic metadata to database
    comic_data = {
        "title": title,
        "description": description,
        "author_id": current_user["id"],
        "files": saved_files,
        "file_count": len(saved_files),
        "uploaded_by": current_user["email"],
        "upload_date": datetime.now(timezone.utc),
        "published": False
    }
    result = await db.comics.insert_one(comic_data)

    return {
        "message": f"'{title}' uploaded successfully!",
        "comic_id": str(result.inserted_id),
        "files": saved_files
    }

@router.get("/comics")
async def list_comics(request: Request, current_user=Depends(get_current_user)):
    """List all comics uploaded by the current user"""
    db = request.app.mongodb
    
    comics = await db.comics.find({"author_id": current_user["id"]}).to_list(100)
    for comic in comics:
        comic["_id"] = str(comic["_id"])
        comic["upload_date"] = str(comic.get("upload_date", ""))
    return comics

@router.get("/{comic_id}")
async def get_comic(comic_id: str, request: Request):
    """Retrieve a single comic's metadata by ID"""
    database = request.app.mongodb
    try:
        comic = await database.comics.find_one({"_id": ObjectId(comic_id)})
        if not comic:
            raise HTTPException(status_code=404, detail="Comic not found.")
        comic["id"] = str(comic["_id"])
        return comic
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid comic ID: {e}")


@router.delete("/comics/{comic_id}")
async def delete_comic(comic_id: str, request: Request, current_user=Depends(get_current_user)):
    """Delete a comic by ID"""
    database = request.app.mongodb

    try:
        comic = await database.comics.find_one({"_id": ObjectId(comic_id)})
        if not comic:
            raise HTTPException(status_code=404, detail="Comic not found.")
        
        if comic["author_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to delete this comic.")
        
        await database.comics.delete_one({"_id": ObjectId(comic_id)})
        return {"message": "Comic deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid comic ID: {e}")

