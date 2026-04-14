import uuid
from datetime import datetime

from pydantic import BaseModel, HttpUrl


class BrandCreate(BaseModel):
    name: str
    logo_url: str | None = None
    website: str | None = None
    description: str | None = None
    is_partner: bool = False


class BrandUpdate(BaseModel):
    name: str | None = None
    logo_url: str | None = None
    website: str | None = None
    description: str | None = None
    is_partner: bool | None = None


class BrandResponse(BaseModel):
    id: uuid.UUID
    name: str
    logo_url: str | None
    website: str | None
    description: str | None
    is_partner: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BrandListResponse(BaseModel):
    items: list[BrandResponse]
    total: int
