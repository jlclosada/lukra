import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class ProductHotspot(BaseModel):
    id: str
    x: float
    y: float
    name: str
    brand: str
    price: float
    currency: str = "EUR"
    productUrl: str = ""
    image: str | None = None


class LookCreate(BaseModel):
    title: str
    description: str | None = None
    image: str
    tags: list[str] = []
    likes: int = 0
    season: str = "primavera-verano"
    aspect: str = "tall"
    hotspots: list[ProductHotspot] | None = None
    published: bool = True


class LookUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    image: str | None = None
    tags: list[str] | None = None
    likes: int | None = None
    season: str | None = None
    aspect: str | None = None
    hotspots: list[ProductHotspot] | None = None
    published: bool | None = None


class LookResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    image: str
    tags: list[str]
    likes: int
    season: str
    aspect: str
    hotspots: list[ProductHotspot] | None
    published: bool
    author_id: uuid.UUID
    author: str = ""
    author_avatar: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LookListResponse(BaseModel):
    items: list[LookResponse]
    total: int
