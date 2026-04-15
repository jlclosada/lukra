import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_editor
from app.models.article import Article
from app.models.user import User
from app.schemas.article import (
    ArticleCreate,
    ArticleListResponse,
    ArticleResponse,
    ArticleUpdate,
)

router = APIRouter(prefix="/articles", tags=["articles"])


def _to_response(article: Article, author: User) -> dict:
    data = {
        "id": article.id,
        "title": article.title,
        "excerpt": article.excerpt,
        "content": article.content,
        "image": article.image,
        "category": article.category,
        "read_time": article.read_time,
        "featured": article.featured,
        "published": article.published,
        "author_id": article.author_id,
        "author": author.display_name or author.username,
        "author_avatar": author.avatar_url,
        "created_at": article.created_at,
        "updated_at": article.updated_at,
    }
    return data


@router.get("/", response_model=ArticleListResponse)
async def list_articles(
    search: str = Query("", description="Search by title"),
    category: str = Query("", description="Filter by category"),
    published: bool | None = Query(None),
    featured: bool | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Article, User).join(User, Article.author_id == User.id)
    count_query = select(func.count()).select_from(Article)

    if search:
        query = query.where(Article.title.ilike(f"%{search}%"))
        count_query = count_query.where(Article.title.ilike(f"%{search}%"))
    if category:
        query = query.where(Article.category == category)
        count_query = count_query.where(Article.category == category)
    if published is not None:
        query = query.where(Article.published == published)
        count_query = count_query.where(Article.published == published)
    if featured is not None:
        query = query.where(Article.featured == featured)
        count_query = count_query.where(Article.featured == featured)

    query = query.order_by(Article.created_at.desc()).offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    rows = result.all()

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    items = [_to_response(article, author) for article, author in rows]
    return ArticleListResponse(items=items, total=total)


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Article, User).join(User, Article.author_id == User.id).where(Article.id == article_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Article not found")
    article, author = row
    return _to_response(article, author)


@router.post("/", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    data: ArticleCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_editor),
):
    article = Article(
        title=data.title.strip(),
        excerpt=data.excerpt.strip(),
        content=data.content,
        image=data.image,
        category=data.category,
        read_time=data.read_time,
        featured=data.featured,
        published=data.published,
        author_id=user.id,
    )
    db.add(article)
    await db.flush()
    await db.refresh(article)
    return _to_response(article, user)


@router.patch("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: uuid.UUID,
    data: ArticleUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_editor),
):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(article, field, value.strip() if isinstance(value, str) else value)

    await db.flush()
    await db.refresh(article)

    # Re-fetch author
    author_result = await db.execute(select(User).where(User.id == article.author_id))
    author = author_result.scalar_one()
    return _to_response(article, author)


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_editor),
):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    await db.delete(article)
