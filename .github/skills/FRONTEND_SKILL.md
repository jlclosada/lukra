# SKILL: Frontend Development — VogueVerse

## Descripción

Este skill define las directrices, tecnologías, patrones y mejores prácticas para el desarrollo del frontend de **VogueVerse**, una aplicación web de moda moderna, estética y minimalista.

---

## Stack Tecnológico

| Categoría     | Tecnología                                     | Versión mínima |
| ------------- | ---------------------------------------------- | -------------- |
| Framework     | **Vue 3** (Composition API + `<script setup>`) | 3.4+           |
| Build tool    | **Vite**                                       | 5+             |
| Lenguaje      | **TypeScript**                                 | 5.3+           |
| Estilos       | **Tailwind CSS 4** + componentes custom        | 4+             |
| Routing       | **Vue Router 4**                               | 4.3+           |
| Estado global | **Pinia**                                      | 2.1+           |
| HTTP Client   | **ofetch** (o fetch nativo con wrapper)        | —              |
| Iconos        | **Lucide Icons** (via `lucide-vue-next`)       | —              |
| Animaciones   | **@vueuse/motion** + transiciones CSS          | —              |
| Imágenes      | Lazy loading nativo + `<picture>` + WebP/AVIF  | —              |
| Linting       | **ESLint** + **Prettier**                      | —              |
| Testing       | **Vitest** + **Vue Test Utils**                | —              |
| Deploy        | **Netlify** (con `netlify.toml`)               | —              |

---

## Estructura de Carpetas

```
frontend/
├── public/
│   ├── favicon.svg
│   └── og-image.jpg
├── src/
│   ├── assets/
│   │   ├── fonts/
│   │   └── images/
│   ├── components/
│   │   ├── ui/              # Componentes base reutilizables (Button, Card, Modal, Badge, Avatar, etc.)
│   │   ├── layout/          # Header, Footer, Sidebar, MobileNav
│   │   ├── articles/        # ArticleCard, ArticleList, ArticleDetail, ArticleEditor
│   │   ├── looks/           # LookCard, LookGrid, LookDetail, LookFilters
│   │   ├── comments/        # CommentThread, CommentForm, CommentItem
│   │   ├── products/        # ProductLink, ProductCarousel, ProductBadge
│   │   ├── trends/          # TrendTag, TrendSection, TrendChart
│   │   ├── auth/            # LoginForm, RegisterForm, AuthGuard
│   │   └── shared/          # SearchBar, InfiniteScroll, Skeleton, Toast
│   ├── composables/         # useAuth, useLikes, useComments, useArticles, useLooks, useTrends
│   ├── layouts/             # DefaultLayout, AuthLayout, AdminLayout
│   ├── pages/               # Vistas principales (mapeadas a rutas)
│   │   ├── HomePage.vue
│   │   ├── ArticlesPage.vue
│   │   ├── ArticleDetailPage.vue
│   │   ├── LooksPage.vue
│   │   ├── LookDetailPage.vue
│   │   ├── TrendsPage.vue
│   │   ├── ProfilePage.vue
│   │   ├── LoginPage.vue
│   │   ├── RegisterPage.vue
│   │   └── admin/
│   │       ├── DashboardPage.vue
│   │       ├── ManageArticlesPage.vue
│   │       ├── ManageLooksPage.vue
│   │       └── ManageUsersPage.vue
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── articles.ts
│   │   ├── looks.ts
│   │   ├── comments.ts
│   │   └── trends.ts
│   ├── services/            # Capa de abstracción sobre la API REST (FastAPI)
│   │   ├── api.ts           # Instancia de ofetch con baseURL y auth interceptor
│   │   ├── auth.service.ts
│   │   ├── articles.service.ts
│   │   ├── looks.service.ts
│   │   ├── comments.service.ts
│   │   ├── likes.service.ts
│   │   └── upload.service.ts
│   ├── types/
│   │   ├── article.ts
│   │   ├── look.ts
│   │   ├── comment.ts
│   │   ├── user.ts
│   │   ├── trend.ts
│   │   └── product.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── slug.ts
│   │   └── validation.ts
│   ├── App.vue
│   └── main.ts
├── index.html
├── netlify.toml
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

---

## Convenciones de Código

### Nombrado

- **Componentes**: PascalCase (`ArticleCard.vue`). Siempre multi-palabra.
- **Composables**: camelCase con prefijo `use` (`useArticles.ts`).
- **Stores (Pinia)**: camelCase con prefijo `use` y sufijo `Store` (`useAuthStore`).
- **Services**: camelCase con sufijo `.service.ts`.
- **Types/Interfaces**: PascalCase, sin prefijo `I` (`Article`, `User`).
- **Constantes**: UPPER_SNAKE_CASE para valores estáticos globales.
- **CSS classes**: Tailwind utilities. Clases custom con kebab-case y prefijo de dominio (`vv-card`, `vv-btn`).

### Componentes

- Siempre usar `<script setup lang="ts">`.
- Props definidas con `defineProps<T>()` (type-based).
- Emits definidos con `defineEmits<T>()`.
- Preferir composables sobre mixins.
- Un componente = una responsabilidad.
- Componentes UI base no deben conocer lógica de negocio.

### Estilos

- **Tailwind first**: Usar clases utility en el template.
- **Scoped styles** solo cuando sea necesario para animaciones o pseudo-elementos complejos.
- **Variables CSS** para el theme (colores, tipografías, espaciado) definidas en `:root`.
- **Dark mode**: Soporte completo usando la clase `dark` de Tailwind.
- **Responsive**: Mobile-first. Breakpoints: `sm` (640), `md` (768), `lg` (1024), `xl` (1280).

### Estado

- Estado local: `ref()` / `reactive()` en el componente.
- Estado compartido entre hermanos: composable o provide/inject.
- Estado global: Pinia store.
- Nunca mutar estado del store fuera de actions.

### Routing

- Rutas lazy-loaded con `() => import()`.
- Guards de navegación para rutas protegidas (admin, perfil).
- Meta fields para título de página y requisitos de auth.

---

## Patrones de Diseño

### Composable Pattern

```ts
// composables/useLikes.ts
export function useLikes(contentType: 'article' | 'look', contentId: string) {
  const count = ref(0);
  const isLiked = ref(false);
  const loading = ref(false);

  async function toggle() {
    /* ... */
  }
  async function fetch() {
    /* ... */
  }

  onMounted(fetch);

  return { count, isLiked, loading, toggle };
}
```

### Service Layer Pattern

```ts
// services/api.ts
import { ofetch } from 'ofetch';

export const api = ofetch.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1',
  onRequest({ options }) {
    const token = localStorage.getItem('access_token');
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  },
  onResponseError({ response }) {
    if (response.status === 401) {
      // Intentar refresh o redirect a login
    }
  },
});

// services/articles.service.ts
import { api } from './api';
import type { Article, PaginatedResponse } from '@/types/article';

export const articlesService = {
  async getAll(params?: {
    page?: number;
    category?: string;
  }): Promise<PaginatedResponse<Article>> {
    return api('/articles', { params });
  },
  async getBySlug(slug: string): Promise<Article> {
    return api(`/articles/${slug}`);
  },
  async create(data: Partial<Article>): Promise<Article> {
    return api('/articles', { method: 'POST', body: data });
  },
  async update(id: string, data: Partial<Article>): Promise<Article> {
    return api(`/articles/${id}`, { method: 'PATCH', body: data });
  },
  async delete(id: string): Promise<void> {
    return api(`/articles/${id}`, { method: 'DELETE' });
  },
};
```

### Skeleton Loading Pattern

- Toda vista que cargue datos debe mostrar un skeleton mientras carga.
- Usar componentes Skeleton dedicados que imiten la forma del contenido real.

### Infinite Scroll / Pagination

- Artículos y looks usan infinite scroll con intersección observer.
- Panel admin usa paginación clásica con controles numéricos.

---

## Performance

- **Code splitting**: Cada página es un chunk separado (lazy routes).
- **Tree shaking**: Importar solo lo necesario de cada librería.
- **Imágenes**: Servir desde el backend (uploads) o CDN. Usar `loading="lazy"`.
- **Fonts**: Preload de fuentes principales. `font-display: swap`.
- **Prefetch**: Prefetch de rutas en hover de links.
- **Bundle analysis**: Ejecutar `npx vite-bundle-visualizer` periódicamente.
- **Lighthouse target**: Performance > 90, Accessibility > 95, Best Practices > 95.

---

## Accesibilidad (a11y)

- Semántica HTML correcta (`<article>`, `<nav>`, `<main>`, `<aside>`, `<section>`).
- Todos los botones interactivos con `aria-label` cuando no tienen texto visible.
- Focus visible en todos los elementos interactivos.
- Contraste mínimo AA (4.5:1 texto normal, 3:1 texto grande).
- Skip to content link.
- Imágenes con `alt` descriptivo.
- Formularios con `<label>` asociado.

---

## Internacionalización

- La app se desarrolla inicialmente en **español**.
- Los textos hardcodeados se mantienen en español por ahora.
- Preparar arquitectura para i18n futuro (no hardcodear textos en componentes de UI base).

---

## Variables de Entorno

```env
VITE_API_URL=http://localhost:8000
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=VogueVerse
```

---

## Comandos

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview build
npm run preview

# Lint
npm run lint

# Tests
npm run test

# Type check
npm run type-check
```

---

## Deploy en Netlify

### `netlify.toml`

```toml
[build]
  base = "frontend/"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Variables de entorno en Netlify

- `VITE_API_URL` (URL del backend FastAPI en producción)
- `VITE_APP_URL` (URL de producción de Netlify)
- `VITE_APP_NAME`

---

## Notas Evolutivas

- Este skill se irá actualizando conforme se añadan nuevos requisitos, páginas o funcionalidades.
- Cualquier decisión de arquitectura importante se documentará aquí.
