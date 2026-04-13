# SKILL: Diseño Gráfico & UI/UX — VogueVerse

## Descripción

Este skill define la identidad visual, el sistema de diseño, la paleta de colores, la tipografía, los componentes UI, los patrones de interacción y las directrices de UX para **VogueVerse** — una plataforma de moda moderna, estética y minimalista.

---

## Filosofía de Diseño

> **"La elegancia es la eliminación."** — Cristóbal Balenciaga

### Principios

1. **Minimalismo con personalidad**: Espacios amplios, pocos elementos, cada uno con propósito. Pero sin ser frío — calidez a través de tipografía expresiva y micro-interacciones.
2. **Content-first**: Las imágenes de moda son las protagonistas. El UI las enmarca, no compite con ellas.
3. **Editorial feel**: La web debe sentirse como una revista digital de alta gama, no como un e-commerce.
4. **Fluidez**: Transiciones suaves, scroll natural, carga progresiva. Nada de saltos bruscos.
5. **Inclusividad**: Diseño que funciona para todos los géneros, edades y dispositivos.

---

## Paleta de Colores

### Light Mode (Principal)

| Token                    | Color         | Hex       | Uso                             |
| ------------------------ | ------------- | --------- | ------------------------------- |
| `--color-bg`             | Blanco cálido | `#FAFAF8` | Fondo principal                 |
| `--color-bg-elevated`    | Blanco puro   | `#FFFFFF` | Cards, modales                  |
| `--color-bg-subtle`      | Gris arena    | `#F3F1ED` | Secciones alternadas, hover     |
| `--color-text`           | Negro suave   | `#1A1A1A` | Texto principal                 |
| `--color-text-secondary` | Gris medio    | `#6B6B6B` | Texto secundario, metadata      |
| `--color-text-muted`     | Gris claro    | `#9B9B9B` | Placeholders, timestamps        |
| `--color-accent`         | Negro         | `#000000` | CTAs principales, links activos |
| `--color-accent-warm`    | Terracota     | `#C4704B` | Acentos cálidos, tags women     |
| `--color-accent-cool`    | Azul slate    | `#4B6584` | Acentos fríos, tags men         |
| `--color-accent-gold`    | Oro apagado   | `#B8965A` | Destacados, premium, featured   |
| `--color-border`         | Gris sutil    | `#E5E3DF` | Líneas divisorias, bordes       |
| `--color-error`          | Rojo suave    | `#D44B4B` | Errores, validación             |
| `--color-success`        | Verde sage    | `#5A8F6B` | Éxito, confirmación             |

### Dark Mode

| Token                    | Color           | Hex       |
| ------------------------ | --------------- | --------- |
| `--color-bg`             | Negro profundo  | `#0F0F0F` |
| `--color-bg-elevated`    | Gris oscuro     | `#1A1A1A` |
| `--color-bg-subtle`      | Gris carbón     | `#252525` |
| `--color-text`           | Blanco suave    | `#EDEDEB` |
| `--color-text-secondary` | Gris claro      | `#A0A0A0` |
| `--color-border`         | Gris oscuro     | `#333333` |
| `--color-accent`         | Blanco          | `#FFFFFF` |
| `--color-accent-warm`    | Terracota claro | `#D4845F` |
| `--color-accent-cool`    | Azul claro      | `#6B8BA4` |
| `--color-accent-gold`    | Oro             | `#CEAC6E` |

### Regla de oro

- Los colores de acento se usan con moderación (máx. 10% de la pantalla visible).
- El 80% del diseño es blanco/negro/grises. El acento marca jerarquía.

---

## Tipografía

### Font Stack

| Uso                | Fuente                 | Fallback                               | Weight             |
| ------------------ | ---------------------- | -------------------------------------- | ------------------ |
| **Headings**       | `'Playfair Display'`   | `Georgia, serif`                       | 400, 500, 700      |
| **Body**           | `'Inter'`              | `system-ui, -apple-system, sans-serif` | 300, 400, 500, 600 |
| **Monospace**      | `'JetBrains Mono'`     | `monospace`                            | 400                |
| **Display (hero)** | `'Cormorant Garamond'` | `'Playfair Display', serif`            | 300, 400, 600      |

### Escala Tipográfica (fluid)

```css
:root {
  --text-xs: clamp(0.694rem, 0.66rem + 0.17vw, 0.8rem);
  --text-sm: clamp(0.833rem, 0.78rem + 0.27vw, 1rem);
  --text-base: clamp(1rem, 0.93rem + 0.36vw, 1.25rem);
  --text-lg: clamp(1.2rem, 1.1rem + 0.5vw, 1.563rem);
  --text-xl: clamp(1.44rem, 1.3rem + 0.7vw, 1.953rem);
  --text-2xl: clamp(1.728rem, 1.53rem + 0.99vw, 2.441rem);
  --text-3xl: clamp(2.074rem, 1.79rem + 1.42vw, 3.052rem);
  --text-4xl: clamp(2.488rem, 2.09rem + 1.99vw, 3.815rem);
  --text-hero: clamp(3rem, 2.4rem + 3vw, 5.5rem);
}
```

### Reglas

- **Headings**: `Playfair Display` para títulos de artículos, secciones y hero. Siempre en mayúsculas o capitalize.
- **Body**: `Inter` para todo el texto corrido, UI, botones, metadata.
- **Display**: `Cormorant Garamond` solo para el hero de la home y citas editoriales.
- **Letter spacing**: Headings con `letter-spacing: -0.02em`. Labels/buttons con `0.05em`.
- **Line height**: Body `1.65`. Headings `1.15`. Display `1.05`.

---

## Espaciado

### Sistema base 4px

```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */
  --space-32: 8rem; /* 128px */
}
```

### Reglas de espaciado

- Secciones principales: `--space-24` a `--space-32` entre secciones.
- Cards: `--space-6` de padding interno, `--space-6` de gap en grid.
- Contenido de artículo: `max-width: 680px` centrado. Imágenes full-bleed.

---

## Layout

### Grid System

- **Max width de contenido**: `1280px` (centrado).
- **Grid de artículos/looks**: CSS Grid responsive:
  - Mobile (< 640px): 1 columna.
  - Tablet (640-1024px): 2 columnas.
  - Desktop (> 1024px): 3 columnas (artículos) / 3-4 columnas (looks).
- **Masonry** para la galería de looks (CSS `columns` o JS masonry).

### Breakpoints

| Token | Valor  | Uso               |
| ----- | ------ | ----------------- |
| `sm`  | 640px  | Móviles grandes   |
| `md`  | 768px  | Tablets           |
| `lg`  | 1024px | Laptops           |
| `xl`  | 1280px | Desktop           |
| `2xl` | 1536px | Pantallas grandes |

---

## Componentes UI — Guía Visual

### Botones

```
┌─────────────────────────────────────────┐
│ Primary:   ████████████  Negro sólido    │
│            Texto blanco, tracking wide   │
│            Hover: opacity 85%            │
│                                          │
│ Secondary: ┌──────────┐  Borde negro     │
│            │          │  Texto negro      │
│            └──────────┘  Hover: fill negro│
│                                          │
│ Ghost:     Texto solo    Underline hover  │
│            Sin borde     Color accent     │
│                                          │
│ Icon:      [ ♡ ] [ ⊕ ]  40x40 circle     │
│            Hover: bg subtle              │
└─────────────────────────────────────────┘
```

- Border radius: `0px` (rectangulares) o `999px` (pill) — NO intermedios.
- Transición: `all 200ms ease`.
- Padding: `12px 24px` (normal), `8px 16px` (small), `16px 32px` (large).

### Cards

#### Article Card

```
┌──────────────────────────────┐
│                              │
│    [Imagen cover 16:10]      │
│                              │
├──────────────────────────────┤
│ CATEGORÍA                    │  ← Uppercase, --text-xs, accent color
│ Título del artículo que      │  ← Playfair Display, --text-xl
│ puede ser largo              │
│                              │
│ Breve excerpt del artículo   │  ← Inter, --text-sm, text-secondary
│ en una o dos líneas...       │
│                              │
│ Por Autor · 5 min · ♡ 24    │  ← --text-xs, text-muted
└──────────────────────────────┘
```

#### Look Card

```
┌──────────────────────────────┐
│                              │
│                              │
│    [Imagen look 3:4]         │
│                              │
│     ♡ guardado               │  ← Overlay bottom, glassmorphism
│                              │
├──────────────────────────────┤
│ Título del look              │  ← Playfair, --text-lg
│ Estilo · Ocasión             │  ← Inter, --text-xs, badge pills
└──────────────────────────────┘
```

### Navigation (Header)

```
Desktop:
┌──────────────────────────────────────────────────────┐
│  VOGUEV ERSE     Artículos  Looks  Tendencias   🔍 👤│
└──────────────────────────────────────────────────────┘

Mobile:
┌──────────────────────────────────────────────────────┐
│  ☰   VOGUEVERSE                              🔍  👤 │
└──────────────────────────────────────────────────────┘
```

- Header: Sticky, fondo blur (`backdrop-filter: blur(12px)`), semi-transparente.
- Logo: Tipografía custom, tracking amplio (`0.3em`), mayúsculas.
- Transición al hacer scroll: border-bottom sutil aparece.

### Footer

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  VOGUEVERSE                                          │
│                                                      │
│  Explorar        Legal           Síguenos            │
│  Artículos       Privacidad      Instagram           │
│  Looks           Términos        Twitter/X            │
│  Tendencias      Cookies         Pinterest           │
│                                                      │
│  ──────────────────────────────────────────────       │
│  © 2026 VogueVerse. Con estilo.                      │
└──────────────────────────────────────────────────────┘
```

---

## Micro-interacciones & Animaciones

### Principios

- **Sutileza**: Las animaciones son funcionales, no decorativas. 200-400ms.
- **Ease curves**: `cubic-bezier(0.25, 0.1, 0.25, 1)` para la mayoría.
- **No animar layout properties** (width, height, top, left). Usar `transform` y `opacity`.
- **Reduce motion**: Respetar `prefers-reduced-motion`.

### Animaciones clave

| Elemento           | Animación                          | Duración             |
| ------------------ | ---------------------------------- | -------------------- |
| Page transition    | Fade + slide up (20px)             | 300ms                |
| Card hover         | Imagen scale(1.03), shadow lift    | 300ms                |
| Like button        | Heart pulse + fill color           | 400ms                |
| Modal open         | Fade overlay + scale(0.95→1)       | 250ms                |
| Skeleton pulse     | Shimmer gradient loop              | 1.5s                 |
| Toast notification | Slide in right + auto dismiss      | 300ms in, 3s visible |
| Scroll reveal      | Fade up + stagger 50ms entre cards | 400ms                |
| Image lazy load    | Blur(20px) → blur(0) + opacity     | 500ms                |
| Tab switch         | Underline slide + content fade     | 250ms                |
| Menu mobile        | Slide from left + overlay          | 300ms                |

### Hover states

- Cards: Ligero elevamiento (`translateY(-4px)`) + sombra suave.
- Links: Underline animado de izquierda a derecha.
- Botones: Background/opacity suave.
- Imágenes en cards: `scale(1.03)` con `overflow: hidden`.

---

## Iconografía

- **Librería**: Lucide Icons (consistente, limpia, customizable).
- **Tamaños**: 16px (inline), 20px (UI elements), 24px (navegación), 32px (hero/empty states).
- **Stroke width**: 1.5px (por defecto). 1px en tamaños grandes.
- **Color**: Hereda `currentColor`.

---

## Imágenes & Media

### Ratios

- **Article cover**: 16:10 (landscape editorial).
- **Look photo**: 3:4 (portrait, estilo editorial de moda).
- **Avatar**: 1:1 (circular).
- **Trend cover**: 2:1 (banner wide).
- **Product thumbnail**: 1:1 (cuadrado).

### Tratamiento

- Las imágenes siempre llenan su contenedor (`object-fit: cover`).
- Lazy loading nativo (`loading="lazy"`).
- Placeholder: Solid color (`--color-bg-subtle`) o blur low-res.
- Formato: WebP preferido, JPEG como fallback.

### Filtros editoriales (opcionales)

- Para consistencia visual, se puede aplicar un filtro CSS sutil a todas las imágenes de looks:
  ```css
  .look-image {
    filter: contrast(1.05) saturate(0.9);
  }
  ```

---

## Responsive Design

### Mobile-first

- Todo componente se diseña primero para 375px de ancho.
- Las mejoras se añaden con media queries ascendentes.

### Touch targets

- Mínimo **44x44px** para elementos interactivos en móvil.
- Espaciado generoso entre elementos clickeables.

### Navegación mobile

- Menú hamburguesa → Panel lateral slide-in.
- Bottom bar opcional para acciones principales (Home, Explorar, Bookmarks, Perfil).

---

## Dark Mode

### Implementación

- Clase `dark` en `<html>` (gestionada por JS).
- Toggle: Botón en el header. Persistido en `localStorage`.
- Default: Respeta `prefers-color-scheme` del sistema.
- Transición: `transition: background-color 200ms, color 200ms` en body.

### Reglas

- Las imágenes NO se oscurecen. El contenido visual se mantiene fiel.
- Los fondos nunca son negro puro (`#000`). Usar `#0F0F0F` o `#1A1A1A`.
- Los textos nunca son blanco puro (`#FFF`). Usar `#EDEDEB`.
- Sombras en dark mode: Más sutiles o reemplazadas por bordes.

---

## SEO & Open Graph

### Meta tags por página

- `<title>`: "[Título] — VogueVerse"
- `<meta name="description">`: Excerpt o descripción de la página.
- `<meta property="og:image">`: Imagen de portada de cada artículo/look.
- `<meta property="og:type">`: `article` para artículos, `website` para home.
- **Structured data (JSON-LD)**: Schema.org Article para artículos.

### URLs

- Artículos: `/articulos/[slug]`
- Looks: `/looks/[slug]`
- Tendencias: `/tendencias/[slug]`
- Perfil: `/perfil/[username]`

---

## Empty States & Error States

### Empty state

- Ilustración minimalista (line art) + mensaje claro + CTA.
- Ejemplo: "Aún no hay looks de hombre. ¡Sé el primero en crear uno!"

### Error state

- Mensaje amigable, sin jerga técnica.
- Botón de reintentar cuando aplique.
- 404: Ilustración editorial + "Parece que esta página se fue de pasarela."

### Loading state

- Skeleton con animación shimmer que replica la forma del contenido.
- Nunca spinner genérico. Siempre skeleton contextual.

---

## Referentes de Diseño

| Web              | Inspiración                                                   |
| ---------------- | ------------------------------------------------------------- |
| **Highsnobiety** | Editorial layout, tipografía, navegación                      |
| **SSENSE**       | Minimalismo extremo, uso del espacio                          |
| **The Line**     | Estética y elegancia, product display                         |
| **Vogue**        | Como NO hacerlo (oversaturado) pero sí la jerarquía editorial |
| **Kinfolk**      | Tonos cálidos, fotografía, whitespace                         |
| **COS (H&M)**    | Limpieza, dark/light, product cards                           |

---

## Assets a Crear/Obtener

| Asset                               | Prioridad | Estado    |
| ----------------------------------- | --------- | --------- |
| Logo "VOGUEVERSE" (tipográfico SVG) | Alta      | Pendiente |
| Favicon (V minimalista)             | Alta      | Pendiente |
| OG image default (1200x630)         | Alta      | Pendiente |
| Ilustraciones empty states (3-4)    | Media     | Pendiente |
| Placeholder avatar default          | Media     | Pendiente |
| Loading skeleton components         | Alta      | Pendiente |

---

## Notas Evolutivas

- Este skill se irá actualizando conforme se refine la identidad visual.
- Las decisiones de diseño grandes (cambio de fuente, paleta, etc.) se documentan aquí con fecha.
