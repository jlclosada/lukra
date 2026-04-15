import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class ArticleCreate(BaseModel):
    title: str
    excerpt: str
    content: str | None = None
    image: str
    category: str = "moda"
    read_time: int = 5
    featured: bool = False
    published: bool = True


class ArticleUpdate(BaseModel):
    title: str | None = None
    excerpt: str | None = None
    content: str | None = None
    image: str | None = None
    category: str | None = None
    read_time: int | None = None
    featured: bool | None = None
    published: bool | None = None


class ArticleResponse(BaseModel):
    id: uuid.UUID
    title: str
    excerpt: str
    content: str | None
    image: str
    category: str
    read_time: int
    featured: bool
    published: bool
    author_id: uuid.UUID
    author: str = ""
    author_avatar: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ArticleListResponse(BaseModel):
    items: list[ArticleResponse]
    total: int
