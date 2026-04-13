"""Seed script — creates test users for development.

Usage: python seed.py
"""

import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import Base, async_session_maker, engine
from app.models.user import User, UserRole
from app.utils import hash_password

TEST_USERS = [
    {
        "email": "admin@lukra.dev",
        "username": "admin",
        "password": "Admin2026!",
        "display_name": "Lukra Admin",
        "role": UserRole.ADMIN,
        "bio": "Administrador de la plataforma Lukra.",
        "email_verified": True,
        "is_active": True,
    },
    {
        "email": "editor@lukra.dev",
        "username": "editor",
        "password": "Editor2026!",
        "display_name": "María García",
        "role": UserRole.EDITOR,
        "bio": "Editora de moda y tendencias. Apasionada del streetwear y la alta costura.",
        "gender": "female",
        "instagram": "@mariagarcia_style",
        "email_verified": True,
        "is_active": True,
    },
    {
        "email": "editor2@lukra.dev",
        "username": "carlos_style",
        "password": "Editor2026!",
        "display_name": "Carlos Ruiz",
        "role": UserRole.EDITOR,
        "bio": "Director creativo y editor de moda masculina.",
        "gender": "male",
        "instagram": "@carlosruiz",
        "email_verified": True,
        "is_active": True,
    },
    {
        "email": "user1@lukra.dev",
        "username": "lucia_fashion",
        "password": "User2026!",
        "display_name": "Lucía Fernández",
        "role": UserRole.DEFAULT,
        "bio": "Amante de la moda sostenible y el minimalismo.",
        "gender": "female",
        "email_verified": True,
        "is_active": True,
    },
    {
        "email": "user2@lukra.dev",
        "username": "pablo_looks",
        "password": "User2026!",
        "display_name": "Pablo Martín",
        "role": UserRole.DEFAULT,
        "bio": "Streetwear enthusiast. Si no es cómodo, no lo quiero.",
        "gender": "male",
        "email_verified": True,
        "is_active": True,
    },
    {
        "email": "user3@lukra.dev",
        "username": "ana_trends",
        "password": "User2026!",
        "display_name": "Ana López",
        "role": UserRole.DEFAULT,
        "bio": "Siempre a la última. Bohemian soul.",
        "gender": "female",
        "email_verified": True,
        "is_active": True,
    },
]


async def seed():
    print(f"🌱 Seeding database: {settings.DATABASE_URL}")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_maker() as session:
        for user_data in TEST_USERS:
            await _create_user_if_not_exists(session, user_data)
        await session.commit()

    print("✅ Seed complete!")
    print()
    print("╔══════════════════════════════════════════════════╗")
    print("║           TEST USERS CREATED                    ║")
    print("╠══════════════════════════════════════════════════╣")
    print("║ ADMIN                                           ║")
    print("║   email: admin@lukra.dev                        ║")
    print("║   pass:  Admin2026!                             ║")
    print("╠══════════════════════════════════════════════════╣")
    print("║ EDITORS                                         ║")
    print("║   email: editor@lukra.dev    pass: Editor2026!  ║")
    print("║   email: editor2@lukra.dev   pass: Editor2026!  ║")
    print("╠══════════════════════════════════════════════════╣")
    print("║ USERS                                           ║")
    print("║   email: user1@lukra.dev     pass: User2026!    ║")
    print("║   email: user2@lukra.dev     pass: User2026!    ║")
    print("║   email: user3@lukra.dev     pass: User2026!    ║")
    print("╚══════════════════════════════════════════════════╝")


async def _create_user_if_not_exists(session: AsyncSession, data: dict):
    result = await session.execute(
        select(User).where(User.email == data["email"])
    )
    if result.scalar_one_or_none():
        print(f"  ⏭️  User {data['email']} already exists, skipping.")
        return

    password = data.pop("password")
    user = User(**data, hashed_password=hash_password(password))
    session.add(user)
    print(f"  ✅ Created {data['role'].value}: {data['email']}")


if __name__ == "__main__":
    asyncio.run(seed())
