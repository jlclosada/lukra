# SKILL: Backend & Database — VogueVerse

## Descripción

Este skill define la arquitectura, esquema de base de datos, modelos, endpoints API, autenticación, almacenamiento de archivos y mejores prácticas para el backend de **VogueVerse**, basado en **FastAPI + PostgreSQL**.

---

## Stack Tecnológico

| Categoría        | Tecnología                                                     | Versión mínima |
| ---------------- | -------------------------------------------------------------- | -------------- |
| Framework        | **FastAPI**                                                    | 0.111+         |
| Lenguaje         | **Python**                                                     | 3.12+          |
| ORM              | **SQLAlchemy 2** (async, mapped classes)                       | 2.0+           |
| Migraciones      | **Alembic**                                                    | 1.13+          |
| Validación       | **Pydantic v2**                                                | 2.6+           |
| Auth             | **python-jose** (JWT) + **passlib** (bcrypt)                   | —              |
| Base de datos    | **PostgreSQL**                                                 | 16+            |
| Driver async     | **asyncpg**                                                    | —              |
| Storage          | **Sistema de archivos local** (dev) / **S3-compatible** (prod) | —              |
| Server           | **Uvicorn**                                                    | 0.29+          |
| Testing          | **pytest** + **pytest-asyncio** + **httpx**                    | —              |
| Linting          | **Ruff**                                                       | —              |
| Containerización | **Docker** + **Docker Compose**                                | —              |
| Deploy           | **Railway** / **Render** / **Fly.io** (con Docker)             | —              |

---

## Estructura de Carpetas

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app, lifespan, middleware
│   ├── config.py                # Settings con Pydantic BaseSettings
│   ├── database.py              # Engine, session, Base
│   ├── dependencies.py          # Dependencias comunes (get_db, get_current_user, etc.)
│   ├── models/                  # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py              # User (auth + perfil)
│   │   ├── article.py
│   │   ├── look.py
│   │   ├── product.py
│   │   ├── comment.py
│   │   ├── like.py
│   │   ├── bookmark.py
│   │   ├── tag.py
│   │   └── trend.py
│   ├── schemas/                 # Schemas Pydantic (request/response)
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── article.py
│   │   ├── look.py
│   │   ├── product.py
│   │   ├── comment.py
│   │   ├── tag.py
│   │   └── trend.py
│   ├── routers/                 # Routers (endpoints agrupados)
│   │   ├── __init__.py
│   │   ├── auth.py              # POST /auth/register, /auth/login, /auth/refresh
│   │   ├── users.py             # GET/PATCH /users/me, GET /users/:username
│   │   ├── articles.py          # CRUD /articles
│   │   ├── looks.py             # CRUD /looks
│   │   ├── products.py          # CRUD /products
│   │   ├── comments.py          # CRUD /comments
│   │   ├── likes.py             # POST/DELETE /likes
│   │   ├── bookmarks.py         # POST/DELETE /bookmarks
│   │   ├── tags.py              # CRUD /tags
│   │   ├── trends.py            # CRUD /trends
│   │   ├── upload.py            # POST /upload (imágenes)
│   │   └── admin.py             # GET /admin/stats, gestión usuarios
│   ├── services/                # Lógica de negocio
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── article_service.py
│   │   ├── look_service.py
│   │   ├── comment_service.py
│   │   └── upload_service.py
│   └── utils/
│       ├── __init__.py
│       ├── security.py          # Hash passwords, crear/verificar JWT
│       ├── slug.py              # Generar slugs únicos
│       └── pagination.py        # Helper de paginación
├── alembic/
│   ├── env.py
│   ├── versions/                # Migraciones auto-generadas
│   └── alembic.ini
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_articles.py
│   └── ...
├── uploads/                     # Almacenamiento local de imágenes (dev)
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── seed.py                      # Script para datos iniciales
```

---

## Modelos SQLAlchemy

### Base y Mixins

```python
# app/database.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
import uuid
from datetime import datetime
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
```

### `User`

```python
# app/models/user.py
class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    username: Mapped[str] = mapped_column(unique=True, index=True)
    hashed_password: Mapped[str]
    display_name: Mapped[str | None]
    avatar_url: Mapped[str | None]
    bio: Mapped[str | None]
    gender: Mapped[str | None]  # 'male', 'female', 'non-binary', 'prefer-not-to-say'
    role: Mapped[str] = mapped_column(default="user")  # 'user', 'editor', 'admin'
    website: Mapped[str | None]
    instagram: Mapped[str | None]
    is_active: Mapped[bool] = mapped_column(default=True)
    email_verified: Mapped[bool] = mapped_column(default=False)

    # Relationships
    articles: Mapped[list["Article"]] = relationship(back_populates="author")
    looks: Mapped[list["Look"]] = relationship(back_populates="author")
    comments: Mapped[list["Comment"]] = relationship(back_populates="user")
```

### `Article`

```python
# app/models/article.py
class Article(Base, TimestampMixin):
    __tablename__ = "articles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    author_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str]
    slug: Mapped[str] = mapped_column(unique=True, index=True)
    excerpt: Mapped[str | None]
    content: Mapped[str]  # Markdown o HTML sanitizado
    cover_image_url: Mapped[str | None]
    category: Mapped[str]  # 'tendencias', 'streetwear', 'alta-costura', etc.
    status: Mapped[str] = mapped_column(default="draft")  # 'draft', 'published', 'archived'
    featured: Mapped[bool] = mapped_column(default=False)
    reading_time_min: Mapped[int | None]
    likes_count: Mapped[int] = mapped_column(default=0)
    comments_count: Mapped[int] = mapped_column(default=0)
    views_count: Mapped[int] = mapped_column(default=0)
    published_at: Mapped[datetime | None]

    # Relationships
    author: Mapped["User"] = relationship(back_populates="articles")
    tags: Mapped[list["Tag"]] = relationship(secondary="article_tags", back_populates="articles")
```

### `Look`

```python
# app/models/look.py
class Look(Base, TimestampMixin):
    __tablename__ = "looks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    author_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str]
    slug: Mapped[str] = mapped_column(unique=True, index=True)
    description: Mapped[str | None]
    image_url: Mapped[str]
    gender: Mapped[str]  # 'men', 'women', 'unisex'
    season: Mapped[str | None]  # 'spring', 'summer', 'autumn', 'winter', 'all-season'
    occasion: Mapped[str | None]  # 'casual', 'formal', 'streetwear', etc.
    style: Mapped[str | None]  # 'minimalist', 'classic', 'bohemian', etc.
    status: Mapped[str] = mapped_column(default="draft")
    featured: Mapped[bool] = mapped_column(default=False)
    likes_count: Mapped[int] = mapped_column(default=0)
    comments_count: Mapped[int] = mapped_column(default=0)
    views_count: Mapped[int] = mapped_column(default=0)
    published_at: Mapped[datetime | None]

    # Relationships
    author: Mapped["User"] = relationship(back_populates="looks")
    tags: Mapped[list["Tag"]] = relationship(secondary="look_tags", back_populates="looks")
    products: Mapped[list["LookProduct"]] = relationship(back_populates="look")
```

### `Product`, `LookProduct`

```python
# app/models/product.py
class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str]
    brand: Mapped[str]
    price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(default="EUR")
    url: Mapped[str]  # Enlace de afiliación
    image_url: Mapped[str | None]
    category: Mapped[str | None]  # 'tops', 'bottoms', 'outerwear', etc.

class LookProduct(Base):
    __tablename__ = "look_products"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    look_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("looks.id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    position_x: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    position_y: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))

    look: Mapped["Look"] = relationship(back_populates="products")
    product: Mapped["Product"] = relationship()
```

### `Comment`, `Like`, `Bookmark`

```python
# app/models/comment.py
class Comment(Base, TimestampMixin):
    __tablename__ = "comments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    content_type: Mapped[str]  # 'article', 'look'
    content_id: Mapped[uuid.UUID]
    parent_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("comments.id", ondelete="CASCADE"))
    body: Mapped[str]
    likes_count: Mapped[int] = mapped_column(default=0)
    status: Mapped[str] = mapped_column(default="visible")  # 'visible', 'hidden', 'flagged'

    user: Mapped["User"] = relationship(back_populates="comments")
    replies: Mapped[list["Comment"]] = relationship()

# app/models/like.py
class Like(Base):
    __tablename__ = "likes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    content_type: Mapped[str]  # 'article', 'look', 'comment'
    content_id: Mapped[uuid.UUID]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("user_id", "content_type", "content_id"),)

# app/models/bookmark.py
class Bookmark(Base):
    __tablename__ = "bookmarks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    content_type: Mapped[str]  # 'article', 'look'
    content_id: Mapped[uuid.UUID]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("user_id", "content_type", "content_id"),)
```

### `Tag`, `Trend` y tablas de relación

```python
# app/models/tag.py
article_tags = Table(
    "article_tags", Base.metadata,
    Column("article_id", ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)
look_tags = Table(
    "look_tags", Base.metadata,
    Column("look_id", ForeignKey("looks.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)
trend_tags = Table(
    "trend_tags", Base.metadata,
    Column("trend_id", ForeignKey("trends.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

class Tag(Base):
    __tablename__ = "tags"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(unique=True)
    slug: Mapped[str] = mapped_column(unique=True)
    color: Mapped[str | None]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    articles: Mapped[list["Article"]] = relationship(secondary="article_tags", back_populates="tags")
    looks: Mapped[list["Look"]] = relationship(secondary="look_tags", back_populates="tags")

# app/models/trend.py
class Trend(Base, TimestampMixin):
    __tablename__ = "trends"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str]
    slug: Mapped[str] = mapped_column(unique=True)
    description: Mapped[str | None]
    cover_image_url: Mapped[str | None]
    status: Mapped[str] = mapped_column(default="draft")  # 'draft', 'active', 'archived'
    start_date: Mapped[date | None]
    end_date: Mapped[date | None]

    tags: Mapped[list["Tag"]] = relationship(secondary="trend_tags")
```

---

## API Endpoints

### Prefijo base: `/api/v1`

### Auth (`/api/v1/auth`)

| Método | Ruta        | Descripción                          | Auth          |
| ------ | ----------- | ------------------------------------ | ------------- |
| POST   | `/register` | Registro (email, username, password) | No            |
| POST   | `/login`    | Login → access_token + refresh_token | No            |
| POST   | `/refresh`  | Renovar access_token                 | Refresh token |
| POST   | `/logout`   | Invalidar refresh token              | Sí            |
| GET    | `/me`       | Perfil del usuario autenticado       | Sí            |

### Articles (`/api/v1/articles`)

| Método | Ruta         | Descripción                           | Auth         |
| ------ | ------------ | ------------------------------------- | ------------ |
| GET    | `/`          | Listar publicados (paginado, filtros) | No           |
| GET    | `/:slug`     | Detalle de artículo                   | No           |
| POST   | `/`          | Crear artículo                        | Editor/Admin |
| PATCH  | `/:id`       | Editar artículo                       | Autor/Admin  |
| DELETE | `/:id`       | Eliminar artículo                     | Autor/Admin  |
| GET    | `/admin/all` | Listar todos (incluidos drafts)       | Editor/Admin |

### Looks (`/api/v1/looks`)

| Método | Ruta     | Descripción                                                  | Auth         |
| ------ | -------- | ------------------------------------------------------------ | ------------ |
| GET    | `/`      | Listar publicados (filtros: gender, style, occasion, season) | No           |
| GET    | `/:slug` | Detalle de look con productos                                | No           |
| POST   | `/`      | Crear look                                                   | Editor/Admin |
| PATCH  | `/:id`   | Editar look                                                  | Autor/Admin  |
| DELETE | `/:id`   | Eliminar look                                                | Autor/Admin  |

### Comments (`/api/v1/comments`)

| Método | Ruta                                    | Descripción                        | Auth        |
| ------ | --------------------------------------- | ---------------------------------- | ----------- |
| GET    | `/?content_type=article&content_id=xxx` | Listar comentarios de un contenido | No          |
| POST   | `/`                                     | Crear comentario                   | Sí          |
| PATCH  | `/:id`                                  | Editar comentario propio           | Autor/Admin |
| DELETE | `/:id`                                  | Eliminar comentario                | Autor/Admin |

### Likes (`/api/v1/likes`)

| Método | Ruta                                 | Descripción                            | Auth |
| ------ | ------------------------------------ | -------------------------------------- | ---- |
| POST   | `/toggle`                            | Toggle like (content_type, content_id) | Sí   |
| GET    | `/check?content_type=x&content_id=y` | Check si el usuario dio like           | Sí   |

### Bookmarks (`/api/v1/bookmarks`)

| Método | Ruta      | Descripción                  | Auth |
| ------ | --------- | ---------------------------- | ---- |
| POST   | `/toggle` | Toggle bookmark              | Sí   |
| GET    | `/`       | Listar bookmarks del usuario | Sí   |

### Tags, Products, Trends (`/api/v1/tags`, `/products`, `/trends`)

CRUDs estándar. Creación/edición limitada a Editor/Admin.

### Upload (`/api/v1/upload`)

| Método | Ruta     | Descripción                        | Auth |
| ------ | -------- | ---------------------------------- | ---- |
| POST   | `/image` | Subir imagen (multipart/form-data) | Sí   |

### Admin (`/api/v1/admin`)

| Método | Ruta              | Descripción            | Auth  |
| ------ | ----------------- | ---------------------- | ----- |
| GET    | `/stats`          | Dashboard stats        | Admin |
| GET    | `/users`          | Listar usuarios        | Admin |
| PATCH  | `/users/:id/role` | Cambiar rol de usuario | Admin |

---

## Autenticación JWT

### Flujo

```
1. POST /auth/register → Crea usuario → Devuelve tokens
2. POST /auth/login → Verifica credenciales → Devuelve access_token + refresh_token
3. Requests autenticados → Header: Authorization: Bearer <access_token>
4. Token expirado → POST /auth/refresh con refresh_token → Nuevo access_token
```

### Implementación

```python
# app/utils/security.py
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=1)) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + expires_delta
    to_encode["type"] = "access"
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

def create_refresh_token(data: dict, expires_delta: timedelta = timedelta(days=7)) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + expires_delta
    to_encode["type"] = "refresh"
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
```

### Dependencias FastAPI

```python
# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = verify_access_token(token)
    user = await db.get(User, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

async def require_editor(user: User = Depends(get_current_user)) -> User:
    if user.role not in ("editor", "admin"):
        raise HTTPException(status_code=403, detail="Editor access required")
    return user

async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
```

---

## Configuración

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/vogueverse"

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # App
    APP_NAME: str = "VogueVerse API"
    DEBUG: bool = False
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    # Upload
    UPLOAD_DIR: str = "uploads"
    MAX_IMAGE_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp", "image/avif"]

    model_config = {"env_file": ".env"}

settings = Settings()
```

---

## Base de Datos & Migraciones

### Conexión

```python
# app/database.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)
async_session = async_sessionmaker(engine, expire_on_commit=False)

async def get_db():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

### Migraciones con Alembic

```bash
# Inicializar (solo primera vez)
alembic init alembic

# Crear migración auto-detectada
alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1

# Ver historial
alembic history
```

### Seed Data

```bash
python seed.py
```

El script `seed.py` crea:

- Usuario admin por defecto
- Tags iniciales (streetwear, minimalist, etc.)
- Categorías de ejemplo

---

## File Upload (Imágenes)

### Desarrollo local

- Imágenes se guardan en `uploads/` organizado por tipo:
  ```
  uploads/
  ├── avatars/{user_id}/
  ├── articles/{article_id}/
  ├── looks/{look_id}/
  └── products/{product_id}/
  ```
- Servidas con `StaticFiles` de FastAPI.

### Producción

- S3-compatible (AWS S3, Cloudflare R2, MinIO).
- `upload_service.py` abstrae el storage backend.

### Validación

- MIME type verificado server-side (no confiar en el header del cliente).
- Tamaño máximo: 5MB contenido, 2MB avatares.
- Renombrado con UUID para prevenir path traversal.

---

## Docker

### `Dockerfile`

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: vogueverse
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: ./backend
    ports:
      - '8000:8000'
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:postgres@db:5432/vogueverse
      SECRET_KEY: dev-secret-change-in-prod
      CORS_ORIGINS: '["http://localhost:5173"]'
      DEBUG: 'true'
    depends_on:
      - db
    volumes:
      - ./backend:/app
      - ./backend/uploads:/app/uploads

volumes:
  pgdata:
```

---

## Índices de Rendimiento (PostgreSQL)

```sql
-- Búsqueda por categoría en artículos publicados
CREATE INDEX idx_articles_published_category ON articles(category) WHERE status = 'published';

-- Búsqueda por género en looks publicados
CREATE INDEX idx_looks_gender_published ON looks(gender) WHERE status = 'published';

-- Full-text search en artículos
CREATE INDEX idx_articles_fts ON articles
  USING GIN (to_tsvector('spanish', title || ' ' || COALESCE(excerpt, '') || ' ' || content));

-- Full-text search en looks
CREATE INDEX idx_looks_fts ON looks
  USING GIN (to_tsvector('spanish', title || ' ' || COALESCE(description, '')));

-- Likes por contenido
CREATE INDEX idx_likes_content ON likes(content_type, content_id);

-- Comentarios por contenido
CREATE INDEX idx_comments_content ON comments(content_type, content_id);
```

---

## Convenciones de Código

### Python

- **Formato**: Ruff (format + lint).
- **Type hints**: Obligatorios en todos los parámetros y returns.
- **Async**: Todas las operaciones de DB y I/O son async.
- **Naming**: snake_case para funciones/variables, PascalCase para clases.
- **Schemas**: Separar schemas de request (`*Create`, `*Update`) y response (`*Response`).

### API

- **JSON responses**: Siempre con estructura consistente.
- **Errores**: `HTTPException` con códigos estándar (400, 401, 403, 404, 409, 422).
- **Paginación**: Query params `page` (default 1) y `per_page` (default 20, max 100).
- **Filtros**: Query params para filtrar listados.
- **Ordenamiento**: `sort_by` y `order` (asc/desc).

### Response format ejemplo

```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "per_page": 20,
  "pages": 3
}
```

---

## Deploy

### Opción 1: Railway (recomendado)

1. Conectar repo de GitHub.
2. Railway detecta `Dockerfile` automáticamente.
3. Añadir PostgreSQL como add-on.
4. Configurar variables de entorno.
5. Deploy automático con cada push a `main`.

### Opción 2: Render

1. Crear Web Service apuntando al repo.
2. Crear PostgreSQL database.
3. Configurar env vars con la connection string.

### Opción 3: Fly.io

```bash
fly launch
fly postgres create
fly deploy
```

### Variables de entorno en producción

- `DATABASE_URL` — Proporcionada por el hosting.
- `SECRET_KEY` — Generado con `openssl rand -hex 32`.
- `CORS_ORIGINS` — URL del frontend en Netlify.
- `DEBUG` — `false`.

---

## Documentación API

FastAPI genera automáticamente:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

---

## Notas Evolutivas

- Este skill se irá actualizando conforme se añadan nuevos requisitos.
- Cualquier cambio de esquema se documentará aquí antes de crear la migración.
