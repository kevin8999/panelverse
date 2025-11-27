from pydantic import BaseModel, EmailStr
from typing import Optional
from bson import ObjectId
from dependencies import get_current_user
from fastapi import APIRouter, Depends, HTTPException, Request

router = APIRouter(prefix="/users", tags=["users"])

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

@router.post("/", response_model=dict)
async def add_user(user: dict, request: Request):
    # Adds a new user to the database
    database = request.app.mongodb
    
    try:
        result = await database.users.insert_one(user)
        if result.inserted_id:
            return {"user_id": str(result.inserted_id)}
        return None
    except Exception as e:
        raise Exception(f"Error adding user: {str(e)}")
    
@router.delete("/{user_id}")
async def delete_user(user_id: str, request: Request, current_user=Depends(get_current_user)):
    # Deletes an exisiting user from the database by id
    database = request.app.mongodb

    try:
        if current_user["id"] != int(user_id):
            raise HTTPException(status_code=403, detail="Not authorized to delete this user.")
        
        result = await database.users.delete_one({"id": int(user_id)})
        if result.deleted_count:
            return {"message": "User deleted successfully"}
        raise HTTPException(status_code=404, detail="User not found.")
    except Exception as e:
        raise Exception(f"Error deleting user: {str(e)}")

@router.get("/{user_id}", response_model=UserResponse)   
async def get_user_by_id(user_id: str, request: Request):
    "Finds user in database by id"
    database = request.app.mongodb

    try:
        user = await database.users.find_one({"id": int(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        return {"id": user["id"], "name": user["name"], "email": user["email"]}
    except Exception as e:
        raise Exception(f"Error retrieving user: {str(e)}")
    
