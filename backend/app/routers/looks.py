import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_editor
from app.models.look import Look
from app.models.user import User
from app.schemas.look import LookCreate, LookListResponse, LookResponse, LookUpdate

router = APIRouter(prefix="/looks", tags=["looks"])


def _to_response(look: Look, author: User) -> dict:
    return {
        "id": look.id,
        "title": look.title,
        "description": look.description,
        "image": look.image,
        "tags": look.tags or [],
        "likes": look.likes,
        "season": look.season,
        "aspect": look.aspect,
        "hotspots": look.hotspots,
        "published": look.published,
        "author_id": look.author_id,
        "author": author.display_name or author.username,
        "author_avatar": author.avatar_url,
        "created_at": look.created_at,
        "updated_at": look.updated_at,
    }


@router.get("/", response_model=LookListResponse)
async def list_looks(
    search: str = Query("", description="Search by title"),
    tag: str = Query("", description="Filter by tag"),
    season: str = Query("", description="Filter by season"),
    published: bool | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Look, User).join(User, Look.author_id == User.id)
    count_query = select(func.count()).select_from(Look)

    if search:
        query = query.where(Look.title.ilike(f"%{search}%"))
        count_query = count_query.where(Look.title.ilike(f"%{search}%"))
    if tag:
        query = query.where(Look.tags.any(tag))
        count_query = count_query.where(Look.tags.any(tag))
    if season:
        query = query.where(Look.season == season)
        count_query = count_query.where(Look.season == season)
    if published is not None:
        query = query.where(Look.published == published)
        count_query = count_query.where(Look.published == published)

    query = query.order_by(Look.created_at.desc()).offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    rows = result.all()

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    items = [_to_response(look, author) for look, author in rows]
    return LookListResponse(items=items, total=total)


@router.get("/{look_id}", response_model=LookResponse)
async def get_look(look_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Look, User).join(User, Look.author_id == User.id).where(Look.id == look_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Look not found")
    look, author = row
    return _to_response(look, author)


@router.post("/", response_model=LookResponse, status_code=status.HTTP_201_CREATED)
async def create_look(
    data: LookCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_editor),
):
    hotspots_data = None
    if data.hotspots:
        hotspots_data = [h.model_dump() for h in data.hotspots]

    look = Look(
        title=data.title.strip(),
        description=data.description,
        image=data.image,
        tags=data.tags,
        likes=data.likes,
        season=data.season,
        aspect=data.aspect,
        hotspots=hotspots_data,
        published=data.published,
        author_id=user.id,
    )
    db.add(look)
    await db.flush()
    await db.refresh(look)
    return _to_response(look, user)


@router.patch("/{look_id}", response_model=LookResponse)
async def update_look(
    look_id: uuid.UUID,
    data: LookUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_editor),
):
    result = await db.execute(select(Look).where(Look.id == look_id))
    look = result.scalar_one_or_none()
    if not look:
        raise HTTPException(status_code=404, detail="Look not found")

    update_data = data.model_dump(exclude_unset=True)
    if "hotspots" in update_data and update_data["hotspots"] is not None:
        update_data["hotspots"] = [
            h.model_dump() if hasattr(h, "model_dump") else h for h in update_data["hotspots"]
        ]

    for field, value in update_data.items():
        setattr(look, field, value.strip() if isinstance(value, str) else value)

    await db.flush()
    await db.refresh(look)

    author_result = await db.execute(select(User).where(User.id == look.author_id))
    author = author_result.scalar_one()
    return _to_response(look, author)


@router.delete("/{look_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_look(
    look_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_editor),
):
    result = await db.execute(select(Look).where(Look.id == look_id))
    look = result.scalar_one_or_none()
    if not look:
        raise HTTPException(status_code=404, detail="Look not found")
    await db.delete(look)
