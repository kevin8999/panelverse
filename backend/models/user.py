from pydantic import BaseModel, EmailStr
from typing import Optional
from bson import ObjectId

class User(BaseModel):
    id: Optional[str] = None
    username: str
    email: EmailStr
    password: str # TODO: Hash password before storing

class Login(BaseModel):
    email: EmailStr
    password: str

async def add_user(database, user_data: User):
    # Adds a new user to the database
    try:
        user_dict = user_data.dict(exclude={"id"})
        result = await database.users.insert_one(user_dict)
        if result.inserted_id:
            return str(result.inserted_id)
        return None
    except Exception as e:
        raise Exception(f"Error adding user: {str(e)}")
    
async def delete_user(database, user_id: str):
    # Deletes an exisiting user from the database by id
    try:
        result = await database.users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count:
            return True
        return False
    except Exception as e:
        raise Exception(f"Error deleting user: {str(e)}")
    
async def get_user_by_id(database, user_id: str):
    "Finds user in database by id"
    try:
        user = await database.users.find_one({"_id": ObjectId(user_id)})
        if user:
            user["id"] = str(user["_id"])
            return User(**user)
        return None
    except Exception as e:
        raise Exception(f"Error retrieving user: {str(e)}")