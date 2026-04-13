import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.user import User, UserRole
from app.schemas.user import (
    AdminUserUpdateRequest,
    UserListResponse,
    UserPublicResponse,
    UserResponse,
    UserUpdateRequest,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    body: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    await db.flush()
    await db.refresh(current_user)
    return current_user


@router.get("/{username}", response_model=UserPublicResponse)
async def get_user_by_username(
    username: str, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


# ── Admin endpoints ──


@router.get("/", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    role: UserRole | None = None,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(User)
    count_query = select(func.count()).select_from(User)

    if role is not None:
        query = query.where(User.role == role)
        count_query = count_query.where(User.role == role)

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(User.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    users = list(result.scalars().all())

    return UserListResponse(
        items=users,
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total > 0 else 1,
    )


@router.patch("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    body: AdminUserUpdateRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if str(user.id) == str(admin.id) and body.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account",
        )

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    await db.flush()
    await db.refresh(user)
    return user
