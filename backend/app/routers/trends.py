import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_editor
from app.models.trend import Trend
from app.models.user import User
from app.schemas.trend import TrendCreate, TrendListResponse, TrendResponse, TrendUpdate

router = APIRouter(prefix="/trends", tags=["trends"])


def _to_response(trend: Trend, author: User) -> dict:
    return {
        "id": trend.id,
        "title": trend.title,
        "description": trend.description,
        "content": trend.content,
        "image": trend.image,
        "tags": trend.tags or [],
        "season": trend.season,
        "popularity": trend.popularity,
        "published": trend.published,
        "author_id": trend.author_id,
        "author": author.display_name or author.username,
        "author_avatar": author.avatar_url,
        "created_at": trend.created_at,
        "updated_at": trend.updated_at,
    }


@router.get("/", response_model=TrendListResponse)
async def list_trends(
    search: str = Query("", description="Search by title"),
    tag: str = Query("", description="Filter by tag"),
    season: str = Query("", description="Filter by season"),
    published: bool | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Trend, User).join(User, Trend.author_id == User.id)
    count_query = select(func.count()).select_from(Trend)

    if search:
        query = query.where(Trend.title.ilike(f"%{search}%"))
        count_query = count_query.where(Trend.title.ilike(f"%{search}%"))
    if tag:
        query = query.where(Trend.tags.any(tag))
        count_query = count_query.where(Trend.tags.any(tag))
    if season:
        query = query.where(Trend.season == season)
        count_query = count_query.where(Trend.season == season)
    if published is not None:
        query = query.where(Trend.published == published)
        count_query = count_query.where(Trend.published == published)

    query = query.order_by(Trend.created_at.desc()).offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    rows = result.all()

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    items = [_to_response(trend, author) for trend, author in rows]
    return TrendListResponse(items=items, total=total)


@router.get("/{trend_id}", response_model=TrendResponse)
async def get_trend(trend_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Trend, User).join(User, Trend.author_id == User.id).where(Trend.id == trend_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Trend not found")
    trend, author = row
    return _to_response(trend, author)


@router.post("/", response_model=TrendResponse, status_code=status.HTTP_201_CREATED)
async def create_trend(
    data: TrendCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_editor),
):
    trend = Trend(
        title=data.title.strip(),
        description=data.description.strip(),
        content=data.content,
        image=data.image,
        tags=data.tags,
        season=data.season,
        popularity=data.popularity,
        published=data.published,
        author_id=user.id,
    )
    db.add(trend)
    await db.flush()
    await db.refresh(trend)
    return _to_response(trend, user)


@router.patch("/{trend_id}", response_model=TrendResponse)
async def update_trend(
    trend_id: uuid.UUID,
    data: TrendUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_editor),
):
    result = await db.execute(select(Trend).where(Trend.id == trend_id))
    trend = result.scalar_one_or_none()
    if not trend:
        raise HTTPException(status_code=404, detail="Trend not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(trend, field, value.strip() if isinstance(value, str) else value)

    await db.flush()
    await db.refresh(trend)

    author_result = await db.execute(select(User).where(User.id == trend.author_id))
    author = author_result.scalar_one()
    return _to_response(trend, author)


@router.delete("/{trend_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trend(
    trend_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_editor),
):
    result = await db.execute(select(Trend).where(Trend.id == trend_id))
    trend = result.scalar_one_or_none()
    if not trend:
        raise HTTPException(status_code=404, detail="Trend not found")
    await db.delete(trend)
