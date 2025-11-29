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
    tags: str = Form(""),
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
            "url": f"/media/uploads/{unique_filename}"
        })

    tags_list = [tag.strip().lower() for tag in tags.split(",") if tags.strip()]

    # Use the first page as the cover image
    cover_url = saved_files[0]["url"] if saved_files else None

    # save comic metadata to database
    comic_data = {
        "title": title,
        "description": description,
        "tags": tags_list,
        "author_id": current_user["id"],
        "files": saved_files,
        "file_count": len(saved_files),
        "cover_url": cover_url,  # First page as cover
        "uploaded_by": current_user["email"],
        "upload_date": datetime.now(timezone.utc),
        "published": False
    }
    result = await db.comics.insert_one(comic_data)

    return {
        "message": f"'{title}' uploaded successfully!",
        "comic_id": str(result.inserted_id),
        "tags": tags_list,
        "files": saved_files
    }

@router.get("/comics")
async def list_comics(
    request: Request, 
    search: str = None,
    tags: str = None,
    published: bool = None,
    sort_by: str = "upload_date",
    order: str = "desc",
    limit: int = 20,
    skip: int = 0
):
    """
    List ALL comics with search, filter, sort, and pagination (no authentication required).
    
    - **search**: Search in title, description (case-insensitive)
    - **tags**: Comma-separated tags to filter by
    - **published**: Filter by published status (true/false)
    - **sort_by**: Field to sort by (upload_date, title, file_count)
    - **order**: Sort order (asc/desc)
    - **limit**: Max results to return (default 20, max 100)
    - **skip**: Number of results to skip for pagination
    """
    db = request.app.mongodb
    
    # build query filter - show all comics from all users
    query = {}

    # search in title and description
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]

    # filter by tags
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query["tags"] = {"$in": tag_list}

    # validate and build sort 
    valid_sort_fields = ["upload_date", "title", "file_count"]

    if sort_by in valid_sort_fields:
        sort_field = sort_by
    else:
        sort_field = "upload_date"
    
    if order == "desc":
        sort_direction = -1
    else:
        sort_direction = 1
    
    # limit pagination (dividing of results into pages)
    limit = min(limit, 100)

    try:
        # execute query with filters, sorting, and pagination
        cursor = db.comics.find(query).sort(sort_field, sort_direction).skip(skip).limit(limit)
        comics = await cursor.to_list(length=limit)

        for comic in comics:
            comic["_id"] = str(comic["_id"])
            if "upload_date" in comic:
                comic["upload_date"] = str(comic["upload_date"])

        total_count = await db.comics.count_documents(query)

        return {
            "comics": comics,
            "total_count": total_count,
            "limit": limit,
            "skip": skip,
            "has_more": (skip + len(comics)) < total_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving comics: {str(e)}")

@router.get("/comics/{comic_id}")
async def get_comic(comic_id: str, request: Request):
    """Retrieve a single comic's metadata by ID"""
    database = request.app.mongodb
    try:
        comic = await database.comics.find_one({"_id": ObjectId(comic_id)})
        if not comic:
            raise HTTPException(status_code=404, detail="Comic not found.")
        
        # Convert ObjectId and datetime to strings
        comic["_id"] = str(comic["_id"])
        if "upload_date" in comic:
            comic["upload_date"] = str(comic["upload_date"])
        
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
    

@router.get("/comics/tags")
async def list_comic_tags(request: Request, current_user=Depends(get_current_user)):
    """List all unique tags used by the current user's comics"""
    database = request.app.mongodb

    try:
        # Use MongoDB aggregation to get unique tags
        pipeline = [
            {"$match": {"author_id": current_user["id"]}},
            {"$unwind": "$tags"},
            {"$group": {"_id": "$tags"}},
            {"$project": {"_id": 1}}
        ]

        cursor = database.comics.aggregate(pipeline)
        result = await cursor.to_list(None)
        tags = [item["_id"] for item in result if item.get("_id")]
        
        return {
            "tags": tags,
            "count": len(tags),
        }
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Error retrieving tags: {str(e)}")
    

@router.patch("/comics/{comic_id}/tags")
async def update_comic_tags(
    comic_id: str,
    request: Request,
    tags: List[str] = Form(...),  
    current_user=Depends(get_current_user)
):
    """Update tags for a specific comic"""
    database = request.app.mongodb

    try:
        comic = await database.comics.find_one({"_id": ObjectId(comic_id)})
        if not comic:
            raise HTTPException(status_code=404, detail="Comic not found.")
        
        if comic["author_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to update this comic.")
        
        # Parse and update tags
        tag_list = [tag.strip().lower() for tag in tags.split(",") if tag.strip()]
        
        await database.comics.update_one(
            {"_id": ObjectId(comic_id)},
            {"$set": {"tags": tag_list}}
        )
        
        return {
            "message": "Tags updated successfully",
            "tags": tag_list,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating tags: {str(e)}")


@router.patch("/comics/{comic_id}")
async def update_comic(
    comic_id: str,
    request: Request,
    background_tasks: BackgroundTasks,
    title: str = Form(None),
    description: str = Form(None),
    tags: str = Form(None),
    files: List[UploadFile] = File(None),
    current_user=Depends(get_current_user)
):
    """Update comic metadata and/or add new pages (chapters)"""
    database = request.app.mongodb

    try:
        comic = await database.comics.find_one({"_id": ObjectId(comic_id)})
        if not comic:
            raise HTTPException(status_code=404, detail="Comic not found.")
        
        if comic["author_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to update this comic.")
        
        update_data = {}
        
        # Update basic info if provided
        if title:
            update_data["title"] = title
        if description is not None:
            update_data["description"] = description
        if tags is not None:
            tag_list = [tag.strip().lower() for tag in tags.split(",") if tag.strip()]
            update_data["tags"] = tag_list
        
        # Add new pages if files provided
        if files:
            new_files = []
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

                new_files.append({
                    "filename": unique_filename,
                    "original_filename": file.filename,
                    "url": f"/media/uploads/{unique_filename}"
                })
            
            # Append new files to existing files
            existing_files = comic.get("files", [])
            updated_files = existing_files + new_files
            update_data["files"] = updated_files
            update_data["file_count"] = len(updated_files)
        
        if update_data:
            await database.comics.update_one(
                {"_id": ObjectId(comic_id)},
                {"$set": update_data}
            )
        
        return {
            "message": "Comic updated successfully",
            "comic_id": comic_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating comic: {str(e)}")


@router.post("/comics/{comic_id}/save")
async def save_comic(comic_id: str, request: Request, current_user=Depends(get_current_user)):
    """Save/bookmark a comic to user's favorites"""
    database = request.app.mongodb

    try:
        # Check if comic exists
        comic = await database.comics.find_one({"_id": ObjectId(comic_id)})
        if not comic:
            raise HTTPException(status_code=404, detail="Comic not found.")
        
        # Add to user's saved comics
        await database.users.update_one(
            {"_id": current_user["id"]},
            {"$addToSet": {"saved_comics": ObjectId(comic_id)}}
        )
        
        return {"message": "Comic saved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error saving comic: {str(e)}")


@router.delete("/comics/{comic_id}/save")
async def unsave_comic(comic_id: str, request: Request, current_user=Depends(get_current_user)):
    """Remove a comic from user's favorites"""
    database = request.app.mongodb

    try:
        # Remove from user's saved comics
        await database.users.update_one(
            {"_id": current_user["id"]},
            {"$pull": {"saved_comics": ObjectId(comic_id)}}
        )
        
        return {"message": "Comic removed from saved"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error removing saved comic: {str(e)}")


@router.get("/users/me/saved")
async def get_saved_comics(request: Request, current_user=Depends(get_current_user)):
    """Get all comics saved by the current user"""
    database = request.app.mongodb

    try:
        # Get user with saved comics
        user = await database.users.find_one({"_id": current_user["id"]})
        saved_comic_ids = user.get("saved_comics", [])
        
        if not saved_comic_ids:
            return {"comics": [], "total_count": 0}
        
        # Fetch all saved comics
        comics = await database.comics.find(
            {"_id": {"$in": saved_comic_ids}}
        ).to_list(length=100)
        
        for comic in comics:
            comic["_id"] = str(comic["_id"])
            if "upload_date" in comic:
                comic["upload_date"] = str(comic["upload_date"])
        
        return {
            "comics": comics,
            "total_count": len(comics)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving saved comics: {str(e)}")


@router.get("/users/me/comics")
async def get_my_comics(request: Request, current_user=Depends(get_current_user)):
    """Get all comics uploaded by the current user"""
    database = request.app.mongodb

    try:
        comics = await database.comics.find(
            {"author_id": current_user["id"]}
        ).sort("upload_date", -1).to_list(length=100)
        
        for comic in comics:
            comic["_id"] = str(comic["_id"])
            if "upload_date" in comic:
                comic["upload_date"] = str(comic["upload_date"])
        
        return {
            "comics": comics,
            "total_count": len(comics)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving comics: {str(e)}")

