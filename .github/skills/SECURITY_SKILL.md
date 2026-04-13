# SKILL: Seguridad — VogueVerse

## Descripción

Este skill define las políticas, prácticas y configuraciones de seguridad para **VogueVerse**, cubriendo autenticación, autorización, protección de datos, defensa contra ataques comunes y cumplimiento de estándares (OWASP Top 10). Backend basado en **FastAPI + PostgreSQL**.

---

## Modelo de Autenticación

### JWT (JSON Web Tokens)

- **Método principal**: Email + Password.
- **OAuth providers** (opcionales, fase 2): Google, GitHub.
- **Password policy**: Mínimo 8 caracteres, al menos 1 mayúscula, 1 número.
- **Hashing**: bcrypt via `passlib`.
- **Rate limiting**: Implementado con `slowapi` en endpoints de auth.

### Tokens

- **Access Token (JWT)**: Firmado con HS256. Expira en 1 hora. Contiene: `sub` (user_id), `role`, `type: "access"`.
- **Refresh Token (JWT)**: Expira en 7 días. Contiene: `sub` (user_id), `type: "refresh"`.
- **Almacenamiento frontend**: `localStorage` para access_token. Refresh token en `localStorage` (alternativa: httpOnly cookie en futuro).
- **Rotación**: Al usar refresh token, se emite un nuevo par access + refresh.
- **Blacklist**: Refresh tokens revocados se almacenan en tabla `revoked_tokens` hasta que expiren.

### Flujo de autenticación

```
1. POST /api/v1/auth/register → hash password → crear user → devolver tokens
2. POST /api/v1/auth/login → verificar password → devolver access_token + refresh_token
3. Requests autenticadas → Header: Authorization: Bearer <access_token>
4. access_token expira → POST /api/v1/auth/refresh + refresh_token → nuevo par de tokens
5. POST /api/v1/auth/logout → añadir refresh_token a blacklist
```

---

## Modelo de Autorización (RBAC)

### Roles

| Rol      | Permisos                                                                         |
| -------- | -------------------------------------------------------------------------------- |
| `user`   | Ver contenido público, comentar, dar like, bookmarks, editar su perfil           |
| `editor` | Todo lo de user + crear/editar artículos y looks propios                         |
| `admin`  | Todo lo de editor + gestionar todo el contenido, usuarios, tendencias, productos |

### Implementación en FastAPI

- El rol se almacena en `users.role`.
- **Dependencies de FastAPI** verifican el rol en cada endpoint:
  - `get_current_user` → extrae y valida JWT, devuelve User.
  - `require_editor` → verifica `role in ('editor', 'admin')`.
  - `require_admin` → verifica `role == 'admin'`.
- **Frontend guards**: Vue Router navigation guards como defensa en profundidad.
- **Principio**: Nunca confiar solo en el frontend. El backend siempre valida.

### Escalado de privilegios

- Un usuario NO puede cambiar su propio rol via la API.
- Solo un admin puede cambiar roles (endpoint `PATCH /api/v1/admin/users/:id/role`).
- El endpoint de update de perfil (`PATCH /api/v1/users/me`) excluye el campo `role` del schema Pydantic.

```python
# Schema que NO incluye role — previene escalado
class UserUpdate(BaseModel):
    display_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    website: str | None = None
    instagram: str | None = None
    # role NO está aquí — no se puede cambiar
```

---

## OWASP Top 10 — Mitigaciones

### 1. Broken Access Control (A01)

- ✅ Dependencies de FastAPI (`get_current_user`, `require_editor`, `require_admin`) en cada endpoint protegido.
- ✅ Verificación de propiedad: solo el autor puede editar/eliminar su contenido (service layer verifica `author_id == current_user.id`).
- ✅ Navigation guards en frontend como defensa en profundidad.
- ✅ IDs de tipo UUID (no secuenciales) — difícil de adivinar.

### 2. Cryptographic Failures (A02)

- ✅ HTTPS obligatorio en producción (Netlify + hosting backend lo imponen).
- ✅ Passwords hasheadas con bcrypt (12 rounds) via `passlib`.
- ✅ JWT firmado con secret key fuerte (mínimo 256 bits), nunca hardcodeado en código.
- ✅ `SECRET_KEY` cargado desde variable de entorno, generado con `openssl rand -hex 32`.
- ✅ Conexión a PostgreSQL con SSL en producción.

### 3. Injection (A03)

- ✅ SQLAlchemy ORM con consultas parametrizadas — nunca SQL raw con string concatenation.
- ✅ Pydantic valida y sanitiza todos los inputs antes de llegar al ORM.
- ✅ Contenido Markdown renderizado con sanitización HTML (DOMPurify en frontend).
- ✅ Nombres de archivo de upload sanitizados (UUID, no nombre original del usuario).

### 4. Insecure Design (A04)

- ✅ Rate limiting con `slowapi` en endpoints sensibles (auth: 5/min, comments: 6/min).
- ✅ Validación de inputs con Pydantic (tipos, longitud, formato, enums).
- ✅ Check constraints en PostgreSQL como segunda línea de validación.
- ✅ Principio de mínimo privilegio en todos los roles.

### 5. Security Misconfiguration (A05)

- ✅ CORS configurado exclusivamente para el dominio de producción y localhost.
- ✅ `DEBUG=false` en producción.
- ✅ Docs de FastAPI (`/docs`, `/redoc`) deshabilitados en producción.
- ✅ Headers de seguridad configurados en Netlify (frontend):

  ```toml
  [[headers]]
    for = "/*"
    [headers.values]
      X-Frame-Options = "DENY"
      X-Content-Type-Options = "nosniff"
      X-XSS-Protection = "0"
      Referrer-Policy = "strict-origin-when-cross-origin"
      Permissions-Policy = "camera=(), microphone=(), geolocation=()"
  ```

- ✅ FastAPI también añade headers de seguridad via middleware.

### 6. Vulnerable and Outdated Components (A06)

- ✅ `pip audit` y `npm audit` ejecutados regularmente.
- ✅ Dependabot o Renovate configurado en GitHub.
- ✅ Lock files committed (`requirements.txt` pinned, `package-lock.json`).
- ✅ Solo dependencias necesarias.

### 7. Identification and Authentication Failures (A07)

- ✅ Rate limiting en login/register con `slowapi`.
- ✅ Password requirements enforced en schema Pydantic.
- ✅ Respuestas genéricas en login ("Invalid credentials") — no revelar si el email existe.
- ✅ Refresh tokens con rotación y blacklist.
- ✅ Tokens con expiración corta (1 hora access, 7 días refresh).

### 8. Software and Data Integrity Failures (A08)

- ✅ SRI (Subresource Integrity) para CDN assets si se usan.
- ✅ Build artifacts verificados en CI/CD.
- ✅ Dependencias pineadas con hashes.
- ✅ No ejecución de código de fuentes no confiables.

### 9. Security Logging and Monitoring Failures (A09)

- ✅ Logging estructurado con `structlog` o `loguru` en FastAPI.
- ✅ Logs de auth (login OK, login fallido, registro) sin incluir passwords.
- ✅ Logs de acciones admin (cambio de roles, eliminación de contenido).
- ✅ Logs accesibles en el dashboard del hosting (Railway/Render).

### 10. Server-Side Request Forgery (A10)

- ✅ No se realizan requests server-side basados en input de usuario sin validar.
- ✅ URLs de productos validadas contra regex `https://` en Pydantic.
- ✅ Imágenes subidas procesadas localmente, no fetched desde URL de usuario.

---

## Sanitización de Contenido

### HTML / Markdown

- Todo contenido HTML generado por usuarios pasa por **DOMPurify** en el frontend antes de renderizar.
- El backend almacena Markdown raw. El frontend renderiza y sanitiza.
- Configuración DOMPurify restrictiva:

  ```ts
  import DOMPurify from 'dompurify';

  const ALLOWED_TAGS = [
    'p',
    'br',
    'strong',
    'em',
    'a',
    'ul',
    'ol',
    'li',
    'h2',
    'h3',
    'h4',
    'blockquote',
    'img',
  ];
  const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel'];

  export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
      FORBID_ATTR: ['style', 'onerror', 'onclick'],
    });
  }
  ```

### URLs

- URLs de productos validadas server-side con Pydantic `HttpUrl`.
- Solo `https://` permitido.
- Links externos en frontend siempre con `rel="noopener noreferrer"` y `target="_blank"`.

### Imágenes

- Solo MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`.
- MIME verificado server-side con `python-magic` (no confiar en header).
- Tamaño máximo: **5MB** contenido, **2MB** avatares.
- Nombre de archivo reemplazado por UUID — previene path traversal.
- Imágenes servidas desde directorio controlado, no desde paths de usuario.

---

## Protección de Formularios

- **Client-side validation**: Usando schemas de validación (zod o valibot).
- **Server-side validation**: Pydantic schemas + check constraints en PostgreSQL.
- **Debounce**: Botones de submit deshabilitados durante petición.
- **Anti-spam en comentarios**: Rate limiting (máx. 1 comentario cada 10 segundos por usuario).

---

## Variables de Entorno y Secretos

### Reglas

1. ❌ NUNCA commitear `SECRET_KEY` ni `DATABASE_URL` real.
2. ❌ NUNCA commitear el `.env` real.
3. ✅ Commitear `.env.example` con valores placeholder.
4. ✅ Variables de entorno configuradas en el dashboard del hosting.
5. ✅ `SECRET_KEY` generado con `openssl rand -hex 32`.

### Variables del backend

- `DATABASE_URL` — Connection string de PostgreSQL.
- `SECRET_KEY` — Clave para firmar JWT (mínimo 32 bytes hex).
- `CORS_ORIGINS` — Lista de orígenes permitidos (JSON array).
- `DEBUG` — `false` en producción.

### Variables del frontend (expuestas)

- `VITE_API_URL` — URL pública del backend FastAPI.
- `VITE_APP_URL` — URL del propio frontend.
- `VITE_APP_NAME` — Nombre de la aplicación.

---

## Middleware de Seguridad (FastAPI)

```python
# app/main.py
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# En producción, limitar hosts confiables
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["api.vogueverse.com", "*.railway.app"]
    )
```

---

## Checklist de Seguridad Pre-Deploy

- [ ] Todos los endpoints protegidos tienen la dependency de auth correcta.
- [ ] `SECRET_KEY` generado con `openssl rand -hex 32` (no el default).
- [ ] `DEBUG=false` en producción.
- [ ] `/docs` y `/redoc` deshabilitados en producción.
- [ ] `.env` en `.gitignore`.
- [ ] CORS configurado solo para dominios autorizados.
- [ ] Headers de seguridad en `netlify.toml`.
- [ ] DOMPurify aplicado a todo contenido HTML renderizado en frontend.
- [ ] `pip audit` y `npm audit` sin vulnerabilidades críticas.
- [ ] Rate limiting activo en auth y comments.
- [ ] Imágenes validadas (MIME, tamaño) server-side antes de guardar.
- [ ] Links externos con `rel="noopener noreferrer"`.
- [ ] Logs no contienen passwords ni tokens.
- [ ] PostgreSQL con SSL en producción.
- [ ] Refresh tokens con blacklist funcional.

---

## Notas Evolutivas

- Este skill se irá actualizando conforme se añadan nuevas funcionalidades o se detecten nuevos vectores de ataque.
- Cualquier incidente o hallazgo de seguridad se documentará aquí.
