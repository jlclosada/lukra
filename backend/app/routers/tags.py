import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_editor
from app.models.tag import Tag
from app.models.user import User
from app.schemas.tag import TagCreate, TagListResponse, TagResponse

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("/", response_model=TagListResponse)
async def list_tags(
    search: str = Query("", description="Search by name"),
    per_page: int = Query(200, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    query = select(Tag)
    count_query = select(func.count()).select_from(Tag)

    if search:
        query = query.where(Tag.name.ilike(f"%{search}%"))
        count_query = count_query.where(Tag.name.ilike(f"%{search}%"))

    query = query.order_by(Tag.name).limit(per_page)

    result = await db.execute(query)
    tags = result.scalars().all()

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    return TagListResponse(items=tags, total=total)


@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    data: TagCreate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_editor),
):
    name = data.name.strip().lower()
    existing = await db.execute(select(Tag).where(func.lower(Tag.name) == name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Tag already exists")

    tag = Tag(name=name)
    db.add(tag)
    await db.flush()
    await db.refresh(tag)
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_editor),
):
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    await db.delete(tag)
