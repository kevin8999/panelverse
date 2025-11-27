from fastapi import APIRouter, Request, Depends, HTTPException
from dependencies import get_admin_user
from bson import ObjectId

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats")
async def get_stats(request: Request, admin_user=Depends(get_admin_user)):
    '''Get basic platfrom statistics'''
    db = request.app.mongodb

    total_users = await db.users.count_documents({})
    total_comics = await db.comics.count_documents({})

    return {
        "total_users": total_users,
        "total_comics": total_comics
    }

@router.get("/users")
async def list_users(request: Request, admin_user=Depends(get_admin_user), limit: int = 50): 
    '''List all users'''
    db = request.app.mongodb

    cursor = db.users.find({}, {"password": 0}).limit(limit)
    users = await cursor.to_list(length=limit)

    for user in users:
        if "_id" in user:
            user["_id"] = str(user["_id"])

    return {"users": users, "total": len(users)}

@router.delete("/comics/{comic_id}")
async def delete_comic(comic_id: str, request: Request):
    '''Delete any comic'''
    db = request.app.mongodb

    try:
        result = await db.comics.delete_one({"_id": ObjectId(comic_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Comic not found")
        return {"message": "Comic successfully deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error deleting comic: {str(e)}")