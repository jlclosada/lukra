import uuid
from datetime import datetime

from pydantic import BaseModel


class TrendCreate(BaseModel):
    title: str
    description: str
    content: str | None = None
    image: str
    tags: list[str] = []
    season: str = "primavera-verano"
    popularity: int = 0
    published: bool = True


class TrendUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    content: str | None = None
    image: str | None = None
    tags: list[str] | None = None
    season: str | None = None
    popularity: int | None = None
    published: bool | None = None


class TrendResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    content: str | None
    image: str
    tags: list[str]
    season: str
    popularity: int
    published: bool
    author_id: uuid.UUID
    author: str = ""
    author_avatar: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TrendListResponse(BaseModel):
    items: list[TrendResponse]
    total: int
