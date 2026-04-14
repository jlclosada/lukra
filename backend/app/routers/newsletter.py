from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.newsletter import NewsletterSubscriber
from app.schemas.newsletter import NewsletterResponse, NewsletterSubscribe

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("/subscribe", response_model=NewsletterResponse)
async def subscribe(
    payload: NewsletterSubscribe,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == payload.email)
    )
    existing = result.scalar_one_or_none()

    if existing:
        if existing.is_active:
            return NewsletterResponse(
                message="Ya estás suscrito al newsletter.",
                email=payload.email,
            )
        # Reactivate
        existing.is_active = True
        existing.unsubscribed_at = None
        await db.flush()
        return NewsletterResponse(
            message="¡Te has vuelto a suscribir al newsletter!",
            email=payload.email,
        )

    subscriber = NewsletterSubscriber(email=payload.email)
    db.add(subscriber)
    await db.flush()

    return NewsletterResponse(
        message="¡Suscrito correctamente al newsletter!",
        email=payload.email,
    )


@router.post("/unsubscribe", response_model=NewsletterResponse)
async def unsubscribe(
    payload: NewsletterSubscribe,
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime, timezone

    result = await db.execute(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == payload.email)
    )
    subscriber = result.scalar_one_or_none()

    if not subscriber or not subscriber.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email no encontrado en el newsletter.",
        )

    subscriber.is_active = False
    subscriber.unsubscribed_at = datetime.now(timezone.utc)
    await db.flush()

    return NewsletterResponse(
        message="Te has dado de baja del newsletter.",
        email=payload.email,
    )
