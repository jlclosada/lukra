import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SiteSection {
  id: string
  label: string
  visible: boolean
}

export interface BrandItem {
  name: string
  logo?: string
}

export interface TeamMember {
  name: string
  role: string
  avatar: string
  quote: string
}

export interface SocialLinks {
  instagram: string
  twitter: string
  email: string
}

export const useSiteConfigStore = defineStore('siteConfig', () => {
  // ── Sections visibility ──
  const sections = ref<SiteSection[]>([
    { id: 'hero', label: 'Hero Carousel', visible: true },
    { id: 'looks-gallery', label: 'Galería de Looks', visible: true },
    { id: 'editorial-quote', label: 'Cita Editorial', visible: true },
    { id: 'brand-marquee', label: 'Carrusel de Marcas', visible: true },
    { id: 'articles', label: 'Artículos', visible: true },
    { id: 'trends', label: 'Tendencias', visible: true },
    { id: 'cta', label: 'CTA (Únete a Lukra)', visible: true },
    { id: 'about-hero', label: 'About: Hero', visible: true },
    { id: 'about-mission', label: 'About: Misión', visible: true },
    { id: 'about-values', label: 'About: Valores', visible: true },
    { id: 'about-quote', label: 'About: Cita', visible: true },
    { id: 'about-timeline', label: 'About: Timeline', visible: true },
    { id: 'about-team', label: 'About: Equipo', visible: true },
    { id: 'about-cta', label: 'About: CTA', visible: true },
  ])

  // ── Hero slides (editable) ──
  const heroSlides = ref([
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
  ])

  // ── Editorial quote ──
  const editorialQuote = ref({
    text: '"La moda no es algo que existe solo en los vestidos. La moda está en el cielo, en la calle, la moda tiene que ver con las ideas, con cómo vivimos."',
    author: 'Coco Chanel',
  })

  // ── Brands ──
  const brands = ref<BrandItem[]>([
    { name: 'GUCCI' }, { name: 'PRADA' }, { name: 'BALENCIAGA' }, { name: 'LOUIS VUITTON' },
    { name: 'DIOR' }, { name: 'SAINT LAURENT' }, { name: 'VERSACE' }, { name: 'GIVENCHY' },
    { name: 'VALENTINO' }, { name: 'FENDI' }, { name: 'CHANEL' }, { name: 'HERMÈS' },
    { name: 'BURBERRY' }, { name: 'BOTTEGA VENETA' }, { name: 'LOEWE' }, { name: 'COS' },
    { name: 'ACNE STUDIOS' }, { name: 'THE ROW' }, { name: 'MAISON MARGIELA' }, { name: 'RICK OWENS' },
  ])

  // ── Team members ──
  const team = ref<TeamMember[]>([
    { name: 'Sofía Martínez', role: 'Directora Creativa', avatar: 'https://i.pravatar.cc/300?img=1', quote: 'La moda no es solo ropa, es la armadura con la que enfrentas el mundo.' },
    { name: 'Carlos Vega', role: 'Editor Jefe', avatar: 'https://i.pravatar.cc/300?img=3', quote: 'Cada tendencia cuenta una historia. Nosotros la narramos.' },
    { name: 'Lucía Chen', role: 'Directora de Tendencias', avatar: 'https://i.pravatar.cc/300?img=5', quote: 'El estilo es instinto, pero se puede educar el ojo.' },
    { name: 'Andrés Ruiz', role: 'Director de Tecnología', avatar: 'https://i.pravatar.cc/300?img=8', quote: 'La tecnología al servicio de la belleza y la creatividad.' },
  ])

  // ── Social links ──
  const social = ref<SocialLinks>({
    instagram: 'https://instagram.com/lukra',
    twitter: 'https://twitter.com/lukra',
    email: 'hello@lukra.style',
  })

  // ── About page content ──
  const aboutHero = ref({
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600&q=80',
    title: 'Donde la moda cobra vida',
    subtitle: 'Lukra es más que una plataforma. Es un espacio donde la inspiración, la creatividad y la innovación convergen para redefinir cómo experimentamos la moda.',
  })

  // ── Newsletter settings ──
  const newsletter = ref({
    enabled: true,
    title: 'Newsletter',
    description: 'Recibe las últimas tendencias y artículos en tu correo.',
  })

  // ── Homepage featured content IDs ──
  const featuredArticleId = ref<string>('1')
  const homeArticleIds = ref<string[]>(['2', '3', '4'])
  const homeLookIds = ref<string[]>(['1', '2', '3', '4', '5', '6', '7', '8'])
  const homeTrendIds = ref<string[]>(['1', '2', '3'])

  // ── Helpers ──
  function isSectionVisible(id: string) {
    return sections.value.find(s => s.id === id)?.visible ?? true
  }

  function toggleSection(id: string) {
    const s = sections.value.find(s => s.id === id)
    if (s) s.visible = !s.visible
  }

  // Persist to localStorage
  function save() {
    localStorage.setItem('lukra_site_config', JSON.stringify({
      sections: sections.value,
      heroSlides: heroSlides.value,
      editorialQuote: editorialQuote.value,
      brands: brands.value,
      team: team.value,
      social: social.value,
      aboutHero: aboutHero.value,
      newsletter: newsletter.value,
      featuredArticleId: featuredArticleId.value,
      homeArticleIds: homeArticleIds.value,
      homeLookIds: homeLookIds.value,
      homeTrendIds: homeTrendIds.value,
    }))
  }

  function load() {
    const raw = localStorage.getItem('lukra_site_config')
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (data.sections) sections.value = data.sections
      if (data.heroSlides) heroSlides.value = data.heroSlides
      if (data.editorialQuote) editorialQuote.value = data.editorialQuote
      if (data.brands) brands.value = data.brands
      if (data.team) team.value = data.team
      if (data.social) social.value = data.social
      if (data.aboutHero) aboutHero.value = data.aboutHero
      if (data.newsletter) newsletter.value = data.newsletter
      if (data.featuredArticleId) featuredArticleId.value = data.featuredArticleId
      if (data.homeArticleIds) homeArticleIds.value = data.homeArticleIds
      if (data.homeLookIds) homeLookIds.value = data.homeLookIds
      if (data.homeTrendIds) homeTrendIds.value = data.homeTrendIds
    } catch { /* ignore parse errors */ }
  }

  // Load on init
  load()

  return {
    sections,
    heroSlides,
    editorialQuote,
    brands,
    team,
    social,
    aboutHero,
    newsletter,
    featuredArticleId,
    homeArticleIds,
    homeLookIds,
    homeTrendIds,
    isSectionVisible,
    toggleSection,
    save,
    load,
  }
})
