import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_editor
from app.models.brand import Brand
from app.models.user import User
from app.schemas.brand import BrandCreate, BrandListResponse, BrandResponse, BrandUpdate

router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("/", response_model=BrandListResponse)
async def list_brands(
    search: str = Query("", description="Search by name"),
    partner: bool | None = Query(None, description="Filter by partner status"),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Brand)
    count_query = select(func.count()).select_from(Brand)

    if search:
        query = query.where(Brand.name.ilike(f"%{search}%"))
        count_query = count_query.where(Brand.name.ilike(f"%{search}%"))

    if partner is not None:
        query = query.where(Brand.is_partner == partner)
        count_query = count_query.where(Brand.is_partner == partner)

    query = query.order_by(Brand.name).offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    brands = result.scalars().all()

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    return BrandListResponse(items=brands, total=total)


@router.get("/{brand_id}", response_model=BrandResponse)
async def get_brand(
    brand_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Brand).where(Brand.id == brand_id))
    brand = result.scalar_one_or_none()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.post("/", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
async def create_brand(
    data: BrandCreate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_editor),
):
    # Check unique name
    existing = await db.execute(
        select(Brand).where(func.lower(Brand.name) == data.name.strip().lower())
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Brand already exists")

    brand = Brand(
        name=data.name.strip(),
        logo_url=data.logo_url,
        website=data.website,
        description=data.description,
        is_partner=data.is_partner,
    )
    db.add(brand)
    await db.flush()
    await db.refresh(brand)
    return brand


@router.patch("/{brand_id}", response_model=BrandResponse)
async def update_brand(
    brand_id: uuid.UUID,
    data: BrandUpdate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_editor),
):
    result = await db.execute(select(Brand).where(Brand.id == brand_id))
    brand = result.scalar_one_or_none()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    if data.name is not None:
        # Check uniqueness
        existing = await db.execute(
            select(Brand).where(
                func.lower(Brand.name) == data.name.strip().lower(),
                Brand.id != brand_id,
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Brand name already taken")
        brand.name = data.name.strip()

    if data.logo_url is not None:
        brand.logo_url = data.logo_url
    if data.website is not None:
        brand.website = data.website
    if data.description is not None:
        brand.description = data.description
    if data.is_partner is not None:
        brand.is_partner = data.is_partner

    await db.flush()
    await db.refresh(brand)
    return brand


@router.delete("/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_brand(
    brand_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_editor),
):
    result = await db.execute(select(Brand).where(Brand.id == brand_id))
    brand = result.scalar_one_or_none()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    await db.delete(brand)
