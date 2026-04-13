// ── Mock data for development branch ──

export interface Look {
  id: string
  title: string
  image: string
  author: string
  authorAvatar: string
  tags: string[]
  likes: number
  season: string
  aspect: 'tall' | 'wide' | 'square'
}

export interface Article {
  id: string
  title: string
  excerpt: string
  image: string
  author: string
  authorAvatar: string
  category: string
  readTime: number
  date: string
  featured?: boolean
}

export interface Trend {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  season: string
  popularity: number
}

export interface HeroSlide {
  id: string
  title: string
  subtitle: string
  image: string
  cta: string
  link: string
}

// ── Hero Carousel ──
export const heroSlides: HeroSlide[] = [
  {
    id: '1',
    title: 'Primavera 2026',
    subtitle: 'La nueva colección que redefine el minimalismo contemporáneo',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80',
    cta: 'Descubrir',
    link: '/looks',
  },
  {
    id: '2',
    title: 'Street Couture',
    subtitle: 'Donde la calle se encuentra con la alta costura',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=80',
    cta: 'Explorar',
    link: '/looks',
  },
  {
    id: '3',
    title: 'Editorial: Sombras',
    subtitle: 'Un ensayo visual sobre la dualidad en la moda moderna',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80',
    cta: 'Leer más',
    link: '/articles',
  },
]

// ── Looks Gallery ──
export const looks: Look[] = [
  {
    id: '1',
    title: 'Minimal Noir',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    author: 'María García',
    authorAvatar: 'https://i.pravatar.cc/80?img=1',
    tags: ['minimal', 'noir', 'streetwear'],
    likes: 342,
    season: 'SS26',
    aspect: 'tall',
  },
  {
    id: '2',
    title: 'Urban Elegance',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    author: 'Carlos Ruiz',
    authorAvatar: 'https://i.pravatar.cc/80?img=3',
    tags: ['urban', 'elegante', 'tailoring'],
    likes: 287,
    season: 'SS26',
    aspect: 'wide',
  },
  {
    id: '3',
    title: 'Deconstructed Layers',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    author: 'Lucía Fernández',
    authorAvatar: 'https://i.pravatar.cc/80?img=5',
    tags: ['capas', 'deconstruido', 'avant-garde'],
    likes: 456,
    season: 'AW25',
    aspect: 'tall',
  },
  {
    id: '4',
    title: 'Linen Dreams',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
    author: 'Ana López',
    authorAvatar: 'https://i.pravatar.cc/80?img=9',
    tags: ['lino', 'natural', 'bohemio'],
    likes: 198,
    season: 'SS26',
    aspect: 'square',
  },
  {
    id: '5',
    title: 'Chrome Future',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
    author: 'Pablo Martín',
    authorAvatar: 'https://i.pravatar.cc/80?img=11',
    tags: ['futurista', 'metalizado', 'tech-wear'],
    likes: 523,
    season: 'AW25',
    aspect: 'tall',
  },
  {
    id: '6',
    title: 'Soft Power',
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80',
    author: 'María García',
    authorAvatar: 'https://i.pravatar.cc/80?img=1',
    tags: ['suave', 'poder', 'femenino'],
    likes: 389,
    season: 'SS26',
    aspect: 'wide',
  },
  {
    id: '7',
    title: 'Raw Denim',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80',
    author: 'Carlos Ruiz',
    authorAvatar: 'https://i.pravatar.cc/80?img=3',
    tags: ['denim', 'raw', 'workwear'],
    likes: 267,
    season: 'AW25',
    aspect: 'square',
  },
  {
    id: '8',
    title: 'Ethereal White',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=800&q=80',
    author: 'Ana López',
    authorAvatar: 'https://i.pravatar.cc/80?img=9',
    tags: ['etéreo', 'blanco', 'romántico'],
    likes: 412,
    season: 'SS26',
    aspect: 'tall',
  },
  {
    id: '9',
    title: 'Structured Chaos',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    author: 'Lucía Fernández',
    authorAvatar: 'https://i.pravatar.cc/80?img=5',
    tags: ['estructura', 'caos', 'experimental'],
    likes: 178,
    season: 'AW25',
    aspect: 'wide',
  },
  {
    id: '10',
    title: 'Botanical Mood',
    image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=800&q=80',
    author: 'Pablo Martín',
    authorAvatar: 'https://i.pravatar.cc/80?img=11',
    tags: ['botánico', 'verde', 'natural'],
    likes: 305,
    season: 'SS26',
    aspect: 'tall',
  },
  {
    id: '11',
    title: 'Midnight Velvet',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    author: 'María García',
    authorAvatar: 'https://i.pravatar.cc/80?img=1',
    tags: ['terciopelo', 'noche', 'luxe'],
    likes: 491,
    season: 'AW25',
    aspect: 'square',
  },
  {
    id: '12',
    title: 'Resort Lines',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80',
    author: 'Carlos Ruiz',
    authorAvatar: 'https://i.pravatar.cc/80?img=3',
    tags: ['resort', 'líneas', 'verano'],
    likes: 234,
    season: 'SS26',
    aspect: 'wide',
  },
]

// ── Articles ──
export const articles: Article[] = [
  {
    id: '1',
    title: 'El regreso del tailoring: por qué 2026 es el año del traje',
    excerpt: 'La sastrería vuelve con fuerza, pero esta vez las reglas las ponemos nosotros. Hombros amplios, cinturas marcadas y tejidos que respiran.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    author: 'María García',
    authorAvatar: 'https://i.pravatar.cc/80?img=1',
    category: 'Tendencias',
    readTime: 7,
    date: '2026-04-10',
    featured: true,
  },
  {
    id: '2',
    title: 'Guía definitiva: cómo crear un armario cápsula que funcione',
    excerpt: 'Menos es más. Te enseñamos a construir un guardarropa de 30 piezas que te dure todo el año sin repetir look.',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
    author: 'Carlos Ruiz',
    authorAvatar: 'https://i.pravatar.cc/80?img=3',
    category: 'Guías',
    readTime: 12,
    date: '2026-04-08',
  },
  {
    id: '3',
    title: 'Moda sostenible: marcas que están cambiando las reglas',
    excerpt: 'De Pangaia a Bode, estas marcas demuestran que la moda consciente puede ser tan deseable como cualquier casa de lujo.',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
    author: 'Lucía Fernández',
    authorAvatar: 'https://i.pravatar.cc/80?img=5',
    category: 'Sostenibilidad',
    readTime: 9,
    date: '2026-04-05',
  },
  {
    id: '4',
    title: 'Street style Madrid: lo mejor de la Fashion Week 2026',
    excerpt: 'Las calles de Madrid se convierten en pasarela. Capturamos los mejores looks de la semana de la moda madrileña.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    author: 'Pablo Martín',
    authorAvatar: 'https://i.pravatar.cc/80?img=11',
    category: 'Street Style',
    readTime: 5,
    date: '2026-04-03',
  },
  {
    id: '5',
    title: 'El arte de mezclar texturas: una masterclass visual',
    excerpt: 'Seda con cuero, lana con organza. Descubre las combinaciones de texturas que elevan cualquier outfit al siguiente nivel.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    author: 'Ana López',
    authorAvatar: 'https://i.pravatar.cc/80?img=9',
    category: 'Estilo',
    readTime: 8,
    date: '2026-03-28',
  },
  {
    id: '6',
    title: 'Zapatillas que son obras de arte: el sneaker como lienzo',
    excerpt: 'La línea entre moda y arte se difumina en el mundo del sneaker. Un recorrido por las colaboraciones más ambiciosas.',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80',
    author: 'Carlos Ruiz',
    authorAvatar: 'https://i.pravatar.cc/80?img=3',
    category: 'Sneakers',
    readTime: 6,
    date: '2026-03-25',
  },
]

// ── Trends ──
export const trends: Trend[] = [
  {
    id: '1',
    title: 'Quiet Luxury',
    description: 'La opulencia silenciosa domina 2026. Prendas sin logos, tejidos premium y cortes que hablan por sí solos. Menos señalización, más sustancia.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    tags: ['minimal', 'lujo', 'sin-logos'],
    season: 'SS26',
    popularity: 95,
  },
  {
    id: '2',
    title: 'Neo-Artisan',
    description: 'Lo hecho a mano recupera protagonismo. Punto, crochet, bordados y tintes naturales redefinen el concepto de exclusividad.',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
    tags: ['artesanal', 'handmade', 'texturas'],
    season: 'SS26',
    popularity: 82,
  },
  {
    id: '3',
    title: 'Tech-Wear Evolved',
    description: 'La ropa técnica trasciende lo funcional: Gore-Tex en trajes, membrana impermeable en blazers. La performance se viste de elegancia.',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
    tags: ['tech', 'funcional', 'futurista'],
    season: 'AW25',
    popularity: 78,
  },
  {
    id: '4',
    title: 'Earth Tones Redux',
    description: 'Marrones, terracota, oliva y arena: la paleta de la tierra vuelve con sofisticación renovada. El color como conexión con la naturaleza.',
    image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=800&q=80',
    tags: ['tierra', 'natural', 'color'],
    season: 'AW25',
    popularity: 88,
  },
  {
    id: '5',
    title: 'Fluid Genderless',
    description: 'Las colecciones sin género se consolidan como norma. Siluetas que celebran el cuerpo más allá de cualquier etiqueta.',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80',
    tags: ['genderless', 'fluido', 'inclusivo'],
    season: 'SS26',
    popularity: 91,
  },
  {
    id: '6',
    title: 'Maxi Volumes',
    description: 'Volúmenes exagerados, faldas amplias y abrigos oversize: la moda abraza el dramatismo escultórico como forma de expresión.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    tags: ['volumen', 'oversize', 'dramático'],
    season: 'AW25',
    popularity: 74,
  },
]
