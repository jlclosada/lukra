# 🖤 VogueVerse

**La plataforma editorial de moda para hombres y mujeres.**

VogueVerse es una aplicación web moderna, estética y minimalista que reúne artículos editoriales, looks/outfits, tendencias, enlaces a productos y una comunidad activa de amantes de la moda.

---

## Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Tech Stack](#tech-stack)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Configuración Inicial](#configuración-inicial)
- [Desarrollo Local](#desarrollo-local)
- [Base de Datos](#base-de-datos)
- [Autenticación y Roles](#autenticación-y-roles)
- [Credenciales de Admin](#credenciales-de-admin)
- [API Documentation](#api-documentation)
- [Deploy a Producción](#deploy-a-producción)
- [Variables de Entorno](#variables-de-entorno)
- [Funcionalidades](#funcionalidades)
- [Skills de Desarrollo](#skills-de-desarrollo)
- [Comandos Útiles](#comandos-útiles)
- [Contribuir](#contribuir)

---

## Arquitectura

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────┐
│                  │         │                  │         │              │
│   FRONTEND       │  HTTPS  │   BACKEND        │         │  PostgreSQL  │
│   (Vue 3 + TS)   │◄───────►│   (FastAPI)      │◄───────►│  Database    │
│                  │  REST   │                  │  async  │              │
│   Netlify CDN    │         │  Railway/Render   │         │  (managed)   │
└──────────────────┘         └──────────────────┘         └──────────────┘
```

- **Frontend**: Vue 3 + TypeScript + Vite + Tailwind CSS 4. Desplegado en **Netlify**.
- **Backend**: **FastAPI** (Python 3.12+) — API REST con autenticación JWT, validación Pydantic, SQLAlchemy async.
- **Base de datos**: **PostgreSQL 16+** — gestionada por el hosting (Railway/Render) o local con Docker.
- **CDN/Hosting frontend**: Netlify con builds automáticos desde GitHub.
- **Hosting backend**: Railway, Render o Fly.io (con Docker).

---

## Tech Stack

| Capa             | Tecnologías                                                                           |
| ---------------- | ------------------------------------------------------------------------------------- |
| Frontend         | Vue 3, TypeScript, Vite, Tailwind CSS 4, Pinia, Vue Router 4                          |
| Backend          | FastAPI, Python 3.12+, SQLAlchemy 2 (async), Pydantic v2, Alembic                     |
| Auth             | JWT (python-jose + passlib/bcrypt)                                                    |
| Base de datos    | PostgreSQL 16+ (asyncpg driver)                                                       |
| Estilos          | Tailwind CSS 4 + CSS Variables + Fuentes: Playfair Display, Inter, Cormorant Garamond |
| Iconos           | Lucide Icons                                                                          |
| Animaciones      | @vueuse/motion + CSS Transitions                                                      |
| Testing Frontend | Vitest + Vue Test Utils                                                               |
| Testing Backend  | pytest + pytest-asyncio + httpx                                                       |
| Linting          | ESLint + Prettier (frontend), Ruff (backend)                                          |
| Deploy Frontend  | Netlify                                                                               |
| Deploy Backend   | Railway / Render / Fly.io (Docker)                                                    |

---

## Estructura del Proyecto

```
vogue-verse/
├── .github/
│   └── skills/                  # Skills de desarrollo (guías detalladas)
│       ├── FRONTEND_SKILL.md
│       ├── BACKEND_SKILL.md
│       ├── SECURITY_SKILL.md
│       └── DESIGN_SKILL.md
├── frontend/                    # Aplicación Vue 3
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Fuentes, imágenes estáticas
│   │   ├── components/          # Componentes Vue organizados por dominio
│   │   ├── composables/         # Composables (useAuth, useLikes, etc.)
│   │   ├── layouts/             # Layouts de página
│   │   ├── pages/               # Vistas/páginas
│   │   ├── router/              # Configuración de Vue Router
│   │   ├── services/            # Capa de servicios (API REST client)
│   │   ├── stores/              # Stores Pinia
│   │   ├── types/               # Tipos TypeScript
│   │   └── utils/               # Utilidades
│   ├── index.html
│   ├── netlify.toml
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                     # API FastAPI
│   ├── app/
│   │   ├── main.py              # App FastAPI, middleware, lifespan
│   │   ├── config.py            # Settings (Pydantic BaseSettings)
│   │   ├── database.py          # Engine async, session
│   │   ├── dependencies.py      # get_db, get_current_user, require_admin...
│   │   ├── models/              # Modelos SQLAlchemy
│   │   ├── schemas/             # Schemas Pydantic (request/response)
│   │   ├── routers/             # Endpoints agrupados por dominio
│   │   ├── services/            # Lógica de negocio
│   │   └── utils/               # Security, slug, pagination
│   ├── alembic/                 # Migraciones de DB
│   ├── tests/
│   ├── uploads/                 # Imágenes (dev local)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── seed.py                  # Datos iniciales
│   └── .env.example
├── docker-compose.yml           # PostgreSQL + API para desarrollo
├── .env.example
├── .gitignore
└── README.md
```

---

## Requisitos Previos

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Python** ≥ 3.12
- **Docker** + **Docker Compose** (para PostgreSQL local)
- **Git**
- Cuenta en [Netlify](https://netlify.com) (plan gratuito)
- Cuenta en [Railway](https://railway.app) / [Render](https://render.com) (plan gratuito para backend + DB)

---

## Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/vogue-verse.git
cd vogue-verse
```

### 2. Configurar variables de entorno

```bash
# Raíz (para docker-compose)
cp .env.example .env

# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Levantar PostgreSQL con Docker

```bash
docker compose up -d db
```

Esto levanta PostgreSQL en `localhost:5432` con la base de datos `vogueverse`.

### 4. Configurar el backend

```bash
cd backend

# Crear entorno virtual
python -m venv .venv
source .venv/bin/activate    # macOS/Linux

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
alembic upgrade head

# (Opcional) Cargar datos de prueba
python seed.py
```

### 5. Configurar el frontend

```bash
cd frontend
npm install
```

---

## Desarrollo Local

### Opción A: Todo con Docker (recomendado)

```bash
# Desde la raíz del proyecto
docker compose up
```

Esto levanta:

- **PostgreSQL** en `localhost:5432`
- **FastAPI** en `http://localhost:8000` (con hot reload)
- El frontend se ejecuta aparte con Vite (siguiente paso).

```bash
# En otra terminal
cd frontend
npm run dev
```

Frontend disponible en `http://localhost:5173`.

### Opción B: Sin Docker (solo PostgreSQL local necesario)

```bash
# Terminal 1: Backend
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Workflow de desarrollo

1. Backend en FastAPI con auto-reload → `uvicorn app.main:app --reload`
2. Frontend en Vite con HMR → `npm run dev`
3. Cambios de esquema → crear migración → `alembic upgrade head`
4. API docs → `http://localhost:8000/docs` (Swagger UI)

---

## Base de Datos

### Tablas principales

| Tabla           | Descripción                                       |
| --------------- | ------------------------------------------------- |
| `users`         | Usuarios (auth + perfil)                          |
| `articles`      | Artículos editoriales de moda                     |
| `looks`         | Outfits/conjuntos con foto (hombre/mujer/unisex)  |
| `products`      | Productos con enlaces de compra                   |
| `look_products` | Relación looks ↔ productos (con posición hotspot) |
| `tags`          | Sistema de etiquetas                              |
| `article_tags`  | Relación artículos ↔ tags                         |
| `look_tags`     | Relación looks ↔ tags                             |
| `comments`      | Comentarios (en artículos y looks, con hilos)     |
| `likes`         | Likes (artículos, looks, comentarios)             |
| `bookmarks`     | Guardados/favoritos del usuario                   |
| `trends`        | Tendencias editoriales                            |
| `trend_tags`    | Relación tendencias ↔ tags                        |

### Migraciones (Alembic)

```bash
cd backend

# Crear nueva migración auto-detectada
alembic revision --autogenerate -m "descripción del cambio"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1

# Ver historial
alembic history
```

Detalle completo del esquema en [BACKEND_SKILL.md](.github/skills/BACKEND_SKILL.md).

---

## Autenticación y Roles

### Métodos de auth

- **Email + Password** (principal) → JWT access + refresh tokens
- **Google OAuth** (futuro)

### Roles

| Rol      | Capacidades                                                         |
| -------- | ------------------------------------------------------------------- |
| `user`   | Ver contenido, comentar, dar like, guardar favoritos, editar perfil |
| `editor` | Todo lo de user + crear/editar artículos y looks propios            |
| `admin`  | Control total: gestionar usuarios, contenido, tendencias, productos |

### Flujo de registro

1. El usuario se registra con email, username y contraseña → `POST /api/v1/auth/register`.
2. Se crea el usuario y se devuelven tokens JWT.
3. Rol por defecto: `user`.
4. Un admin puede promover usuarios a `editor` o `admin` desde el panel.

### Flujo de login

1. `POST /api/v1/auth/login` con email + password.
2. Respuesta: `{ access_token, refresh_token, token_type: "bearer" }`.
3. Frontend almacena tokens y los envía en header `Authorization: Bearer <token>`.
4. Cuando access_token expira → `POST /api/v1/auth/refresh` con refresh_token.

---

## Credenciales de Admin

### Desarrollo local / Primer setup

Al ejecutar el seed (`python seed.py`), se crea automáticamente un usuario administrador:

| Campo        | Valor                  |
| ------------ | ---------------------- |
| **Email**    | `admin@vogueverse.com` |
| **Password** | `VogueAdmin2026!`      |
| **Rol**      | `admin`                |
| **Username** | `admin`                |

> ⚠️ **IMPORTANTE**: Cambia estas credenciales inmediatamente en producción. El seed solo debe usarse en desarrollo.

### Crear un admin manual en producción

1. Regístrate normalmente en la app.
2. Conecta a la base de datos de producción y ejecuta:

```sql
UPDATE users
SET role = 'admin'
WHERE username = 'tu-username';
```

O usa el panel admin si ya tienes un admin existente.

---

## API Documentation

FastAPI genera documentación interactiva automáticamente:

| URL                                  | Tipo                                                        |
| ------------------------------------ | ----------------------------------------------------------- |
| `http://localhost:8000/docs`         | **Swagger UI** — Interfaz interactiva para probar endpoints |
| `http://localhost:8000/redoc`        | **ReDoc** — Documentación legible                           |
| `http://localhost:8000/openapi.json` | **OpenAPI spec** — Schema JSON                              |

> En producción, estas rutas se deshabilitan por seguridad.

---

## Deploy a Producción

### Frontend → Netlify

1. Conecta tu repositorio de GitHub a Netlify.
2. Configura el build:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
3. Añade variables de entorno en Netlify Dashboard:
   - `VITE_API_URL` (URL del backend, ej: `https://vogueverse-api.up.railway.app`)
   - `VITE_APP_URL` (URL de tu sitio Netlify)
   - `VITE_APP_NAME` = `VogueVerse`
4. El deploy se activa automáticamente con cada push a `main`.

### Backend + DB → Railway (recomendado)

1. Crea un nuevo proyecto en [Railway](https://railway.app).
2. Añade un servicio **PostgreSQL** (Add-on).
3. Añade un servicio **desde GitHub** apuntando a la carpeta `backend/`.
4. Railway detecta el `Dockerfile` automáticamente.
5. Configura variables de entorno:
   - `DATABASE_URL` — Railway lo proporciona automáticamente con el add-on Postgres.
   - `SECRET_KEY` — Generado con `openssl rand -hex 32`.
   - `CORS_ORIGINS` — `["https://tu-sitio.netlify.app"]`.
   - `DEBUG` — `false`.
6. Deploy automático con cada push.

### Backend + DB → Render (alternativa)

1. Crea un **Web Service** en Render apuntando al repo.
2. Crea una **PostgreSQL database** en Render.
3. Conecta la DB al Web Service (Render proporciona variables).
4. Root directory: `backend/`.
5. Build command: `pip install -r requirements.txt && alembic upgrade head`.
6. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

### `netlify.toml` (referencia)

```toml
[build]
  base = "frontend/"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

---

## Variables de Entorno

### Backend (`.env`)

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/vogueverse

# Security
SECRET_KEY=change-me-generate-with-openssl-rand-hex-32

# App
DEBUG=true
CORS_ORIGINS=["http://localhost:5173"]

# Upload
UPLOAD_DIR=uploads
MAX_IMAGE_SIZE=5242880
```

### Frontend (`.env`)

```env
# API
VITE_API_URL=http://localhost:8000

# App
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=VogueVerse
```

---

## Funcionalidades

### Públicas (sin auth)

- 🏠 **Home**: Hero editorial, artículos destacados, looks trending, tendencias.
- 📰 **Artículos**: Listado con filtros por categoría, búsqueda, lectura de artículos completos.
- 👔👗 **Looks**: Galería de outfits filtrable por género (hombre/mujer/unisex), estilo, ocasión, temporada.
- 📈 **Tendencias**: Secciones editoriales sobre lo que está de moda.
- 🔍 **Búsqueda**: Full-text search en artículos y looks.

### Autenticadas (requieren login)

- ❤️ **Likes**: Dar like a artículos, looks y comentarios.
- 💬 **Comentarios**: Comentar en artículos y looks (con hilos de respuesta).
- 🔖 **Bookmarks**: Guardar artículos y looks favoritos.
- 👤 **Perfil**: Editar nombre, avatar, bio, redes sociales.
- 🌙 **Dark mode**: Toggle persistente.

### Admin / Editor

- 📝 **Crear artículos**: Editor con Markdown, categorías, tags, imagen de portada.
- 📸 **Crear looks**: Subir foto, asignar productos con hotspots, tags, género.
- 🏷️ **Gestionar tags**: CRUD de etiquetas.
- 📦 **Gestionar productos**: CRUD de productos con enlaces de afiliación.
- 📊 **Dashboard**: Estadísticas (artículos, looks, usuarios, likes, comentarios).
- 👥 **Gestión de usuarios**: Ver usuarios, cambiar roles, moderar.

---

## Skills de Desarrollo

Los skills son documentos detallados que guían el desarrollo de cada aspecto de la aplicación:

| Skill        | Archivo                                               | Contenido                                                     |
| ------------ | ----------------------------------------------------- | ------------------------------------------------------------- |
| Frontend     | [FRONTEND_SKILL.md](.github/skills/FRONTEND_SKILL.md) | Stack, estructura, convenciones, patrones, performance, a11y  |
| Backend & DB | [BACKEND_SKILL.md](.github/skills/BACKEND_SKILL.md)   | FastAPI, SQLAlchemy, endpoints, JWT auth, Docker, migraciones |
| Seguridad    | [SECURITY_SKILL.md](.github/skills/SECURITY_SKILL.md) | OWASP, JWT, RBAC, sanitización, headers, checklist            |
| Diseño & UX  | [DESIGN_SKILL.md](.github/skills/DESIGN_SKILL.md)     | Paleta, tipografía, componentes UI, animaciones, responsive   |

---

## Comandos Útiles

### Frontend

```bash
cd frontend

npm run dev          # Servidor de desarrollo (HMR)
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting
npm run test         # Tests
npm run type-check   # Verificación de tipos TypeScript
```

### Backend

```bash
cd backend
source .venv/bin/activate

uvicorn app.main:app --reload --port 8000   # Dev server con hot reload
pytest                                       # Ejecutar tests
ruff check .                                 # Linting
ruff format .                                # Formateo
alembic upgrade head                         # Aplicar migraciones
alembic revision --autogenerate -m "msg"     # Nueva migración
python seed.py                               # Cargar datos iniciales
```

### Docker

```bash
docker compose up              # Levantar todo (DB + API)
docker compose up -d db        # Solo PostgreSQL en background
docker compose down            # Parar todo
docker compose logs -f api     # Ver logs del backend
```

### General

```bash
npm audit            # Revisar vulnerabilidades frontend
pip audit            # Revisar vulnerabilidades backend
```

---

## Contribuir

1. Crea una rama desde `main`: `git checkout -b feature/nombre`
2. Haz tus cambios siguiendo las convenciones del skill correspondiente.
3. Backend: `ruff check . && pytest`
4. Frontend: `npm run lint && npm run type-check`
5. Crea un Pull Request con descripción clara.

---

## Licencia

MIT

---

<p align="center">
  <strong>VOGUEVERSE</strong><br>
  <em>La moda habla. Nosotros escuchamos.</em>
</p>
