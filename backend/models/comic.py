from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

class FileMeta(BaseModel):
    original_filename: str
    saved_as: str
    url: str
    size: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    thumbnail_url: Optional[str] = None

class ComicBase(BaseModel):
    title: str
    description: Optional[str] = ""
    tags: List[str] = Field(default_factory=list)

class ComicCreate(ComicBase):
    pass

class ComicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None

class Comic(ComicBase):
    # Accept Mongo's _id when reading from DB, expose as "id" in responses
    id: str = Field(alias="_id")
    author_id: int
    files: List[FileMeta] = Field(default_factory=list)
    file_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published: bool = False

def to_comic(doc: dict) -> Comic:
    """Convert a MongoDB document to a Comic model."""
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return Comic(**doc)