import uuid
from datetime import datetime

from pydantic import BaseModel


class TagCreate(BaseModel):
    name: str


class TagResponse(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TagListResponse(BaseModel):
    items: list[TagResponse]
    total: int
