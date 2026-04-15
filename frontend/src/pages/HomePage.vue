<script setup lang="ts">
import BrandMarquee from '@/components/BrandMarquee.vue'
import { useArticlesStore } from '@/stores/articles'
import { useAuthStore } from '@/stores/auth'
import { useLooksStore } from '@/stores/looks'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useTrendsStore } from '@/stores/trends'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Clock, Heart } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const auth = useAuthStore()
const config = useSiteConfigStore()
const articlesStore = useArticlesStore()
const articles = computed(() => articlesStore.publishedArticles)

// ── Hero carousel ──
const currentSlide = ref(0)
const isTransitioning = ref(false)
let slideInterval: ReturnType<typeof setInterval> | undefined

function nextSlide() {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentSlide.value = (currentSlide.value + 1) % config.heroSlides.length
  setTimeout(() => (isTransitioning.value = false), 800)
}

function prevSlide() {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentSlide.value = (currentSlide.value - 1 + config.heroSlides.length) % config.heroSlides.length
  setTimeout(() => (isTransitioning.value = false), 800)
}

function goToSlide(index: number) {
  if (isTransitioning.value || index === currentSlide.value) return
  isTransitioning.value = true
  currentSlide.value = index
  setTimeout(() => (isTransitioning.value = false), 800)
  resetAutoplay()
}

function resetAutoplay() {
  if (slideInterval) clearInterval(slideInterval)
  slideInterval = setInterval(nextSlide, 6000)
}

onMounted(() => {
  slideInterval = setInterval(nextSlide, 6000)
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})

const activeSlide = computed(() => config.heroSlides[currentSlide.value])

// ── Looks gallery ──
const looksStore = useLooksStore()

const homeLooks = computed(() => {
  if (config.homeLookIds.length === 0) return looksStore.looks.slice(0, 8)
  return config.homeLookIds.map(id => looksStore.looks.find(l => l.id === id)).filter((x): x is NonNullable<typeof x> => Boolean(x))
})

// ── Articles preview ──
const featuredArticle = computed(() => {
  const found = articles.value.find(a => a.id === config.featuredArticleId)
  return found || articles.value.find(a => a.featured) || articles.value[0]
})
const recentArticles = computed(() => {
  if (config.homeArticleIds.length === 0) {
    return articles.value.filter(a => a.id !== featuredArticle.value?.id).slice(0, 3)
  }
  return config.homeArticleIds
    .map(id => articles.value.find(a => a.id === id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
})

// ── Trends ──
const trendsStore = useTrendsStore()
const homeTrends = computed(() => {
  if (config.homeTrendIds.length === 0) return trendsStore.trends.slice(0, 3)
  return config.homeTrendIds.map(id => trendsStore.trends.find(t => t.id === id)).filter((x): x is NonNullable<typeof x> => Boolean(x))
})

// ── Scroll-reveal observer ──
const observedSections = ref<Set<string>>(new Set())

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observedSections.value.add(entry.target.id)
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )
  document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
}
</script>

<template>
  <div>
    <!-- ════════ HERO CAROUSEL ════════ -->
    <section v-if="config.isSectionVisible('hero')" class="relative overflow-hidden" style="height: calc(100vh - 73px)">
      <div
        v-for="(slide, index) in config.heroSlides"
        :key="slide.id"
        class="absolute inset-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.77,0,0.175,1)]"
        :class="index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'"
      >
        <div
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${slide.image})` }"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      </div>

      <div class="relative z-10 flex h-full flex-col justify-end px-6 pb-24 sm:px-12 lg:px-24">
        <div class="max-w-3xl">
          <p
            class="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/60 transition-all duration-700"
            :class="isTransitioning ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'"
            style="transition-delay: 200ms"
          >
            {{ activeSlide.cta }}
          </p>
          <h1
            class="text-5xl font-light text-white sm:text-6xl lg:text-7xl transition-all duration-700"
            :class="isTransitioning ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'"
            style="font-family: var(--font-display); transition-delay: 100ms"
          >
            {{ activeSlide.title }}
          </h1>
          <p
            class="mt-5 max-w-xl text-base text-white/70 leading-relaxed transition-all duration-700"
            :class="isTransitioning ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'"
            style="transition-delay: 300ms"
          >
            {{ activeSlide.subtitle }}
          </p>
          <RouterLink
            :to="activeSlide.link"
            class="group mt-8 inline-flex items-center gap-3 border border-white/30 px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
            :class="isTransitioning ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'"
            style="transition-delay: 400ms"
          >
            {{ activeSlide.cta }}
            <ArrowRight :size="14" class="transition-transform duration-300 group-hover:translate-x-1" />
          </RouterLink>
        </div>
      </div>

      <!-- Arrows -->
      <div class="absolute bottom-24 right-6 z-20 flex items-center gap-3 sm:right-12 lg:right-24">
        <button
          @click="prevSlide(); resetAutoplay()"
          class="flex h-12 w-12 items-center justify-center border border-white/20 text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
        >
          <ChevronLeft :size="18" />
        </button>
        <button
          @click="nextSlide(); resetAutoplay()"
          class="flex h-12 w-12 items-center justify-center border border-white/20 text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
        >
          <ChevronRight :size="18" />
        </button>
      </div>

      <!-- Indicators -->
      <div class="absolute bottom-10 left-6 z-20 flex items-center gap-4 sm:left-12 lg:left-24">
        <button
          v-for="(slide, index) in config.heroSlides"
          :key="slide.id"
          @click="goToSlide(index)"
          class="group flex items-center gap-2"
        >
          <div
            class="h-[1px] transition-all duration-500"
            :class="index === currentSlide ? 'w-12 bg-white' : 'w-6 bg-white/30 group-hover:bg-white/60'"
          />
          <span
            class="text-[10px] font-medium tracking-wider transition-all duration-300"
            :class="index === currentSlide ? 'text-white' : 'text-white/30'"
          >
            {{ String(index + 1).padStart(2, '0') }}
          </span>
        </button>
      </div>
    </section>

    <!-- ════════ LOOKS GALLERY (Irregular Masonry) ════════ -->
    <section v-if="config.isSectionVisible('looks-gallery')" id="section-looks" data-reveal class="px-6 py-24 sm:px-12 lg:px-24">
      <div
        class="mb-16 flex items-end justify-between transition-all duration-700"
        :class="observedSections.has('section-looks') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
      >
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.3em]" style="color: var(--color-text-muted)">Galería</p>
          <h2 class="mt-2 text-4xl font-light tracking-tight sm:text-5xl" style="font-family: var(--font-display)">
            Looks recientes
          </h2>
        </div>
        <RouterLink
          to="/looks"
          class="group hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] transition-opacity hover:opacity-60 sm:flex"
        >
          Ver todos
          <ArrowUpRight :size="14" class="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </RouterLink>
      </div>

      <div class="columns-2 gap-4 space-y-4 sm:columns-3 lg:columns-4">
        <div
          v-for="(look, index) in homeLooks"
          :key="look.id"
          class="group relative break-inside-avoid overflow-hidden transition-all duration-700"
          :class="observedSections.has('section-looks') ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'"
          :style="{ transitionDelay: `${150 + index * 100}ms` }"
        >
          <RouterLink :to="`/looks/${look.id}`" class="block">
            <div
              class="relative overflow-hidden"
              :class="{
                'aspect-[3/4]': look.aspect === 'tall',
                'aspect-[4/3]': look.aspect === 'wide',
                'aspect-square': look.aspect === 'square',
              }"
            >
              <img
                :src="look.image"
                :alt="look.title"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div class="absolute inset-x-0 bottom-0 translate-y-4 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <p class="text-sm font-medium text-white">{{ look.title }}</p>
                <div class="mt-1.5 flex items-center gap-2">
                  <span class="text-xs text-white/60">{{ look.author }}</span>
                  <span class="text-white/30">·</span>
                  <Heart :size="12" class="text-white/60" />
                  <span class="text-xs text-white/60">{{ look.likes }}</span>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

      <div class="mt-10 text-center sm:hidden">
        <RouterLink to="/looks" class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em]">
          Ver todos los looks <ArrowRight :size="14" />
        </RouterLink>
      </div>
    </section>

    <!-- ════════ EDITORIAL QUOTE ════════ -->
    <section v-if="config.isSectionVisible('editorial-quote')" class="overflow-hidden px-6 py-16 sm:px-12 lg:px-24">
      <div class="mx-auto max-w-4xl text-center">
        <p
          class="text-3xl font-light italic leading-relaxed sm:text-4xl lg:text-5xl"
          style="font-family: var(--font-display); color: var(--color-text-secondary)"
        >
          {{ config.editorialQuote.text }}
        </p>
        <p class="mt-6 text-xs font-medium uppercase tracking-[0.3em]" style="color: var(--color-text-muted)">
          — {{ config.editorialQuote.author }}
        </p>
      </div>
    </section>

    <!-- ════════ BRAND MARQUEE ════════ -->
    <BrandMarquee v-if="config.isSectionVisible('brand-marquee')" />

    <!-- ════════ ARTICLES ════════ -->
    <section v-if="config.isSectionVisible('articles')" id="section-articles" data-reveal class="px-6 py-24 sm:px-12 lg:px-24" :style="{ backgroundColor: 'var(--color-bg-subtle)' }">
      <div
        class="mb-16 flex items-end justify-between transition-all duration-700"
        :class="observedSections.has('section-articles') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
      >
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.3em]" style="color: var(--color-text-muted)">Editorial</p>
          <h2 class="mt-2 text-4xl font-light tracking-tight sm:text-5xl" style="font-family: var(--font-display)">Artículos</h2>
        </div>
        <RouterLink
          to="/articles"
          class="group hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] transition-opacity hover:opacity-60 sm:flex"
        >
          Todos los artículos
          <ArrowUpRight :size="14" class="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <RouterLink
          v-if="featuredArticle"
          :to="`/articles/${featuredArticle.id}`"
          class="group transition-all duration-700"
          :class="observedSections.has('section-articles') ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'"
          style="transition-delay: 150ms"
        >
          <div class="relative aspect-[4/3] overflow-hidden">
            <img :src="featuredArticle.image" :alt="featuredArticle.title" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div class="absolute bottom-0 p-6 lg:p-8">
              <span class="mb-3 inline-block border border-white/30 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white">
                {{ featuredArticle.category }}
              </span>
              <h3 class="text-2xl font-light text-white lg:text-3xl" style="font-family: var(--font-display)">{{ featuredArticle.title }}</h3>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">{{ featuredArticle.excerpt }}</p>
            <div class="mt-3 flex items-center gap-3 text-xs" style="color: var(--color-text-muted)">
              <span>{{ featuredArticle.author }}</span>
              <span>·</span>
              <Clock :size="12" />
              <span>{{ featuredArticle.readTime }} min</span>
              <span>·</span>
              <span>{{ formatDate(featuredArticle.date) }}</span>
            </div>
          </div>
        </RouterLink>

        <div class="flex flex-col gap-8">
          <RouterLink
            v-for="(article, index) in recentArticles"
            :key="article.id"
            :to="`/articles/${article.id}`"
            class="group flex gap-5 transition-all duration-700"
            :class="observedSections.has('section-articles') ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'"
            :style="{ transitionDelay: `${250 + index * 100}ms` }"
          >
            <div class="h-28 w-28 shrink-0 overflow-hidden sm:h-32 sm:w-32">
              <img :src="article.image" :alt="article.title" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            </div>
            <div class="flex flex-col justify-center">
              <span class="mb-1.5 text-[10px] font-medium uppercase tracking-[0.2em]" style="color: var(--color-accent-warm)">{{ article.category }}</span>
              <h3 class="text-base font-medium leading-tight transition-opacity group-hover:opacity-70">{{ article.title }}</h3>
              <div class="mt-2 flex items-center gap-2 text-xs" style="color: var(--color-text-muted)">
                <Clock :size="11" />
                <span>{{ article.readTime }} min</span>
                <span>·</span>
                <span>{{ formatDate(article.date) }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ════════ TRENDS TEASER ════════ -->
    <section v-if="config.isSectionVisible('trends')" id="section-trends" data-reveal class="px-6 py-24 sm:px-12 lg:px-24">
      <div
        class="mb-16 text-center transition-all duration-700"
        :class="observedSections.has('section-trends') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
      >
        <p class="text-xs font-medium uppercase tracking-[0.3em]" style="color: var(--color-text-muted)">Lo que viene</p>
        <h2 class="mt-2 text-4xl font-light tracking-tight sm:text-5xl" style="font-family: var(--font-display)">Tendencias 2026</h2>
      </div>

      <div class="mx-auto grid max-w-5xl grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3" :style="{ backgroundColor: 'var(--color-border)' }">
        <RouterLink
          v-for="(trend, index) in homeTrends"
          :key="trend.id"
          :to="`/trends/${trend.id}`"
          class="group relative p-8 transition-all duration-700"
          :class="observedSections.has('section-trends') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
          :style="{ backgroundColor: 'var(--color-bg)', transitionDelay: `${150 + index * 100}ms` }"
        >
          <span class="text-6xl font-light" style="font-family: var(--font-display); color: var(--color-border)">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <h3 class="mt-4 text-xl font-medium transition-opacity group-hover:opacity-70">{{ trend.title }}</h3>
          <p class="mt-3 text-sm leading-relaxed" style="color: var(--color-text-secondary)">{{ trend.description }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span v-for="tag in trend.tags.slice(0, 2)" :key="tag" class="text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">#{{ tag }}</span>
          </div>
          <ArrowUpRight :size="16" class="absolute right-6 top-8 opacity-0 transition-all duration-300 group-hover:opacity-60" style="color: var(--color-text-secondary)" />
        </RouterLink>
      </div>

      <div class="mt-12 text-center">
        <RouterLink
          to="/trends"
          class="group inline-flex items-center gap-3 border-2 px-8 py-4 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-200 hover:opacity-70"
          :style="{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }"
        >
          Ver todas las tendencias
          <ArrowRight :size="14" class="transition-transform group-hover:translate-x-1" />
        </RouterLink>
      </div>
    </section>

    <!-- ════════ CTA ════════ -->
    <section v-if="!auth.isAuthenticated && config.isSectionVisible('cta')" class="px-6 py-24 text-center sm:px-12 lg:px-24" :style="{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }">
      <p class="text-xs font-medium uppercase tracking-[0.3em] opacity-50">Únete a Lukra</p>
      <h2 class="mx-auto mt-4 max-w-2xl text-3xl font-light sm:text-4xl lg:text-5xl" style="font-family: var(--font-display)">
        Donde la moda se vive, se comparte y se reinventa
      </h2>
      <p class="mx-auto mt-6 max-w-lg text-sm leading-relaxed opacity-60">
        Crea tu perfil, comparte tus looks, descubre tendencias y conecta con una comunidad que entiende la moda como forma de expresión.
      </p>
      <RouterLink
        to="/register"
        class="group mt-10 inline-flex items-center gap-3 border px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:bg-[var(--color-bg)] hover:text-[var(--color-accent)]"
        :style="{ borderColor: 'var(--color-bg)', color: 'var(--color-bg)' }"
      >
        Crear cuenta gratis
        <ArrowRight :size="14" class="transition-transform group-hover:translate-x-1" />
      </RouterLink>
    </section>
  </div>
</template>
