<script setup lang="ts">
import { useArticlesStore } from '@/stores/articles'
import { useLooksStore } from '@/stores/looks'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useTrendsStore } from '@/stores/trends'
import {
    Check,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    GripVertical,
    Image,
    Plus,
    Save,
    Trash2,
    X
} from 'lucide-vue-next'
import { ref } from 'vue'

const config = useSiteConfigStore()
const articlesStore = useArticlesStore()
const looksStore = useLooksStore()
const trendsStore = useTrendsStore()
const articles = articlesStore.articles
const looks = looksStore.looks
const trends = trendsStore.trends
const saved = ref(false)
const activeTab = ref<'sections' | 'hero' | 'brands' | 'team' | 'about' | 'social' | 'newsletter' | 'content'>('sections')

function handleSave() {
  config.save()
  saved.value = true
  setTimeout(() => (saved.value = false), 2500)
}

// ── Hero slide editing ──
const editingSlide = ref<number | null>(null)

function addHeroSlide() {
  config.heroSlides.push({
    id: String(Date.now()),
    title: '',
    subtitle: '',
    image: '',
    cta: 'Descubrir',
    link: '/looks',
  })
  editingSlide.value = config.heroSlides.length - 1
}

function removeHeroSlide(index: number) {
  config.heroSlides.splice(index, 1)
  editingSlide.value = null
}

// ── Brand editing ──
const newBrand = ref('')

function addBrand() {
  if (newBrand.value.trim()) {
    config.brands.push({ name: newBrand.value.trim().toUpperCase() })
    newBrand.value = ''
  }
}

function removeBrand(index: number) {
  config.brands.splice(index, 1)
}

// ── Team editing ──
const editingMember = ref<number | null>(null)

function addTeamMember() {
  config.team.push({ name: '', role: '', avatar: '', quote: '' })
  editingMember.value = config.team.length - 1
}

function removeTeamMember(index: number) {
  config.team.splice(index, 1)
  editingMember.value = null
}

const tabs = [
  { id: 'sections' as const, label: 'Secciones' },
  { id: 'hero' as const, label: 'Hero Carousel' },
  { id: 'content' as const, label: 'Contenido Inicio' },
  { id: 'brands' as const, label: 'Marcas' },
  { id: 'team' as const, label: 'Equipo' },
  { id: 'about' as const, label: 'About Page' },
  { id: 'social' as const, label: 'Redes Sociales' },
  { id: 'newsletter' as const, label: 'Newsletter' },
]

// ── Content selection helpers ──
function toggleHomeLook(id: string) {
  const idx = config.homeLookIds.indexOf(id)
  if (idx !== -1) config.homeLookIds.splice(idx, 1)
  else config.homeLookIds.push(id)
}

function toggleHomeArticle(id: string) {
  const idx = config.homeArticleIds.indexOf(id)
  if (idx !== -1) config.homeArticleIds.splice(idx, 1)
  else config.homeArticleIds.push(id)
}

function toggleHomeTrend(id: string) {
  const idx = config.homeTrendIds.indexOf(id)
  if (idx !== -1) config.homeTrendIds.splice(idx, 1)
  else config.homeTrendIds.push(id)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1
          class="text-2xl font-light tracking-tight"
          style="font-family: var(--font-heading)"
        >
          Configuración del sitio
        </h1>
        <p class="mt-1 text-sm" style="color: var(--color-text-secondary)">
          Administra todo el contenido visible en la web
        </p>
      </div>
      <button
        @click="handleSave"
        class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-wider transition-all duration-200 cursor-pointer"
        :style="{
          backgroundColor: saved ? 'var(--color-success)' : 'var(--color-accent)',
          color: 'var(--color-bg)',
        }"
      >
        <component :is="saved ? Check : Save" :size="14" />
        {{ saved ? 'Guardado' : 'Guardar cambios' }}
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex flex-wrap gap-1 border-b" :style="{ borderColor: 'var(--color-border)' }">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer"
        :style="{
          borderColor: activeTab === tab.id ? 'var(--color-accent)' : 'transparent',
          color: activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-muted)',
        }"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ═══════ SECTIONS ═══════ -->
    <div v-if="activeTab === 'sections'" class="space-y-3">
      <p class="text-sm" style="color: var(--color-text-secondary)">
        Activa o desactiva secciones de la web. Los cambios se reflejan en tiempo real.
      </p>
      <div
        v-for="section in config.sections"
        :key="section.id"
        class="flex items-center justify-between border px-5 py-4 transition-all duration-200"
        :style="{
          borderColor: 'var(--color-border)',
          backgroundColor: section.visible ? 'var(--color-bg-elevated)' : 'var(--color-bg)',
          opacity: section.visible ? 1 : 0.5,
        }"
      >
        <div class="flex items-center gap-3">
          <component
            :is="section.visible ? Eye : EyeOff"
            :size="16"
            :style="{ color: section.visible ? 'var(--color-success)' : 'var(--color-text-muted)' }"
          />
          <span class="text-sm font-medium">{{ section.label }}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded" style="background-color: var(--color-bg-subtle); color: var(--color-text-muted)">
            {{ section.id }}
          </span>
        </div>
        <button
          @click="config.toggleSection(section.id)"
          class="relative h-6 w-11 rounded-full transition-all duration-200 cursor-pointer"
          :style="{
            backgroundColor: section.visible ? 'var(--color-accent)' : 'var(--color-border)',
          }"
        >
          <span
            class="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-200 shadow-sm"
            :class="section.visible ? 'left-[22px]' : 'left-0.5'"
          />
        </button>
      </div>
    </div>

    <!-- ═══════ HERO CAROUSEL ═══════ -->
    <div v-if="activeTab === 'hero'" class="space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm" style="color: var(--color-text-secondary)">
          Gestiona los slides del carrusel principal
        </p>
        <button
          @click="addHeroSlide"
          class="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border transition-all duration-200 cursor-pointer hover:opacity-70"
          :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }"
        >
          <Plus :size="14" />
          Añadir slide
        </button>
      </div>

      <div
        v-for="(slide, index) in config.heroSlides"
        :key="slide.id"
        class="border overflow-hidden"
        :style="{ borderColor: 'var(--color-border)' }"
      >
        <!-- Slide header -->
        <div
          class="flex items-center justify-between px-5 py-3 cursor-pointer"
          :style="{ backgroundColor: 'var(--color-bg-elevated)' }"
          @click="editingSlide = editingSlide === index ? null : index"
        >
          <div class="flex items-center gap-3">
            <GripVertical :size="14" style="color: var(--color-text-muted)" />
            <img v-if="slide.image" :src="slide.image" class="h-8 w-12 object-cover" />
            <div v-else class="flex h-8 w-12 items-center justify-center" style="background-color: var(--color-bg-subtle)">
              <Image :size="14" style="color: var(--color-text-muted)" />
            </div>
            <span class="text-sm font-medium">{{ slide.title || 'Sin título' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button @click.stop="removeHeroSlide(index)" class="p-1 cursor-pointer text-red-400 hover:text-red-300">
              <Trash2 :size="14" />
            </button>
            <component :is="editingSlide === index ? ChevronUp : ChevronDown" :size="16" style="color: var(--color-text-muted)" />
          </div>
        </div>

        <!-- Slide form -->
        <div v-if="editingSlide === index" class="space-y-4 px-5 py-5">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Título</label>
              <input
                v-model="slide.title"
                class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
                :style="{ borderColor: 'var(--color-border)' }"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">CTA</label>
              <input
                v-model="slide.cta"
                class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
                :style="{ borderColor: 'var(--color-border)' }"
              />
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Subtítulo</label>
            <input
              v-model="slide.subtitle"
              class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
              :style="{ borderColor: 'var(--color-border)' }"
            />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">URL de imagen</label>
              <input
                v-model="slide.image"
                class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
                :style="{ borderColor: 'var(--color-border)' }"
                placeholder="https://..."
              />
            </div>
            <div>
              <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Enlace</label>
              <input
                v-model="slide.link"
                class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
                :style="{ borderColor: 'var(--color-border)' }"
                placeholder="/looks"
              />
            </div>
          </div>
          <div v-if="slide.image" class="mt-2">
            <img :src="slide.image" class="h-32 w-full object-cover" />
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ BRANDS ═══════ -->
    <div v-if="activeTab === 'brands'" class="space-y-4">
      <p class="text-sm" style="color: var(--color-text-secondary)">
        Gestiona las marcas que aparecen en el carrusel
      </p>

      <!-- Add brand -->
      <div class="flex gap-2">
        <input
          v-model="newBrand"
          @keydown.enter="addBrand"
          placeholder="Nombre de la marca..."
          class="flex-1 border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
          :style="{ borderColor: 'var(--color-border)' }"
        />
        <button
          @click="addBrand"
          class="px-4 py-2 text-xs font-medium cursor-pointer transition-all duration-200"
          :style="{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }"
        >
          Añadir
        </button>
      </div>

      <!-- Brand list -->
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(brand, index) in config.brands"
          :key="index"
          class="group flex items-center gap-2 border px-3 py-1.5 text-sm transition-all duration-200"
          :style="{ borderColor: 'var(--color-border)' }"
        >
          <span>{{ brand.name }}</span>
          <button @click="removeBrand(index)" class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <X :size="12" class="text-red-400" />
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════ TEAM ═══════ -->
    <div v-if="activeTab === 'team'" class="space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm" style="color: var(--color-text-secondary)">
          Gestiona los miembros del equipo (About page)
        </p>
        <button
          @click="addTeamMember"
          class="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border transition-all duration-200 cursor-pointer hover:opacity-70"
          :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }"
        >
          <Plus :size="14" />
          Añadir miembro
        </button>
      </div>

      <div
        v-for="(member, index) in config.team"
        :key="index"
        class="border overflow-hidden"
        :style="{ borderColor: 'var(--color-border)' }"
      >
        <div
          class="flex items-center justify-between px-5 py-3 cursor-pointer"
          :style="{ backgroundColor: 'var(--color-bg-elevated)' }"
          @click="editingMember = editingMember === index ? null : index"
        >
          <div class="flex items-center gap-3">
            <img v-if="member.avatar" :src="member.avatar" class="h-8 w-8 rounded-full object-cover" />
            <div v-else class="h-8 w-8 rounded-full" style="background-color: var(--color-bg-subtle)" />
            <div>
              <span class="text-sm font-medium">{{ member.name || 'Sin nombre' }}</span>
              <span class="ml-2 text-xs" style="color: var(--color-text-muted)">{{ member.role }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click.stop="removeTeamMember(index)" class="p-1 cursor-pointer text-red-400 hover:text-red-300">
              <Trash2 :size="14" />
            </button>
            <component :is="editingMember === index ? ChevronUp : ChevronDown" :size="16" style="color: var(--color-text-muted)" />
          </div>
        </div>

        <div v-if="editingMember === index" class="space-y-4 px-5 py-5">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Nombre</label>
              <input
                v-model="member.name"
                class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
                :style="{ borderColor: 'var(--color-border)' }"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Rol</label>
              <input
                v-model="member.role"
                class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
                :style="{ borderColor: 'var(--color-border)' }"
              />
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">URL Avatar</label>
            <input
              v-model="member.avatar"
              class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
              :style="{ borderColor: 'var(--color-border)' }"
              placeholder="https://..."
            />
          </div>
          <div>
            <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Cita</label>
            <textarea
              v-model="member.quote"
              rows="2"
              class="w-full border px-3 py-2 text-sm bg-transparent outline-none resize-none focus:border-[var(--color-accent)]"
              :style="{ borderColor: 'var(--color-border)' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ ABOUT ═══════ -->
    <div v-if="activeTab === 'about'" class="space-y-6">
      <p class="text-sm" style="color: var(--color-text-secondary)">
        Contenido de la página About
      </p>

      <div class="border p-5 space-y-4" :style="{ borderColor: 'var(--color-border)' }">
        <h3 class="text-xs font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Hero</h3>
        <div>
          <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Imagen de fondo</label>
          <input
            v-model="config.aboutHero.image"
            class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
            :style="{ borderColor: 'var(--color-border)' }"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Título</label>
          <input
            v-model="config.aboutHero.title"
            class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
            :style="{ borderColor: 'var(--color-border)' }"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Subtítulo</label>
          <textarea
            v-model="config.aboutHero.subtitle"
            rows="3"
            class="w-full border px-3 py-2 text-sm bg-transparent outline-none resize-none focus:border-[var(--color-accent)]"
            :style="{ borderColor: 'var(--color-border)' }"
          />
        </div>
        <div v-if="config.aboutHero.image" class="mt-2">
          <img :src="config.aboutHero.image" class="h-32 w-full object-cover" />
        </div>
      </div>

      <div class="border p-5 space-y-4" :style="{ borderColor: 'var(--color-border)' }">
        <h3 class="text-xs font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Cita Editorial</h3>
        <div>
          <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Texto</label>
          <textarea
            v-model="config.editorialQuote.text"
            rows="3"
            class="w-full border px-3 py-2 text-sm bg-transparent outline-none resize-none focus:border-[var(--color-accent)]"
            :style="{ borderColor: 'var(--color-border)' }"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Autor</label>
          <input
            v-model="config.editorialQuote.author"
            class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
            :style="{ borderColor: 'var(--color-border)' }"
          />
        </div>
      </div>
    </div>

    <!-- ═══════ CONTENT SELECTION ═══════ -->
    <div v-if="activeTab === 'content'" class="space-y-8">
      <p class="text-sm" style="color: var(--color-text-secondary)">
        Selecciona qué contenido aparece en la página de inicio. Ideal para campañas y cambios de temporada.
      </p>

      <!-- Featured article (main) -->
      <div class="border p-5 space-y-4" :style="{ borderColor: 'var(--color-border)' }">
        <h3 class="text-xs font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Artículo destacado (principal)</h3>
        <div class="space-y-2">
          <div
            v-for="article in articles"
            :key="article.id"
            class="flex items-center gap-3 border px-4 py-3 cursor-pointer transition-all duration-200"
            :style="{
              borderColor: config.featuredArticleId === article.id ? 'var(--color-accent)' : 'var(--color-border)',
              backgroundColor: config.featuredArticleId === article.id ? 'var(--color-bg-elevated)' : 'var(--color-bg)',
            }"
            @click="config.featuredArticleId = article.id"
          >
            <img :src="article.image" class="h-10 w-14 object-cover shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ article.title }}</p>
              <p class="text-[10px]" style="color: var(--color-text-muted)">{{ article.category }} · {{ article.author }}</p>
            </div>
            <div
              class="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0"
              :style="{ borderColor: config.featuredArticleId === article.id ? 'var(--color-accent)' : 'var(--color-border)' }"
            >
              <div
                v-if="config.featuredArticleId === article.id"
                class="h-2.5 w-2.5 rounded-full"
                style="background-color: var(--color-accent)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary articles -->
      <div class="border p-5 space-y-4" :style="{ borderColor: 'var(--color-border)' }">
        <h3 class="text-xs font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">
          Artículos secundarios
          <span class="ml-1 text-[10px] font-normal normal-case">({{ config.homeArticleIds.length }} seleccionados)</span>
        </h3>
        <div class="space-y-2">
          <div
            v-for="article in articles.filter(a => a.id !== config.featuredArticleId)"
            :key="article.id"
            class="flex items-center gap-3 border px-4 py-3 cursor-pointer transition-all duration-200"
            :style="{
              borderColor: config.homeArticleIds.includes(article.id) ? 'var(--color-accent)' : 'var(--color-border)',
              backgroundColor: config.homeArticleIds.includes(article.id) ? 'var(--color-bg-elevated)' : 'var(--color-bg)',
            }"
            @click="toggleHomeArticle(article.id)"
          >
            <img :src="article.image" class="h-10 w-14 object-cover shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ article.title }}</p>
              <p class="text-[10px]" style="color: var(--color-text-muted)">{{ article.category }} · {{ article.author }}</p>
            </div>
            <div
              class="h-5 w-5 border-2 flex items-center justify-center shrink-0"
              :style="{ borderColor: config.homeArticleIds.includes(article.id) ? 'var(--color-accent)' : 'var(--color-border)' }"
            >
              <Check v-if="config.homeArticleIds.includes(article.id)" :size="12" style="color: var(--color-accent)" />
            </div>
          </div>
        </div>
      </div>

      <!-- Looks -->
      <div class="border p-5 space-y-4" :style="{ borderColor: 'var(--color-border)' }">
        <h3 class="text-xs font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">
          Looks en portada
          <span class="ml-1 text-[10px] font-normal normal-case">({{ config.homeLookIds.length }} seleccionados)</span>
        </h3>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="look in looks"
            :key="look.id"
            class="relative cursor-pointer overflow-hidden border transition-all duration-200"
            :style="{
              borderColor: config.homeLookIds.includes(look.id) ? 'var(--color-accent)' : 'var(--color-border)',
              borderWidth: config.homeLookIds.includes(look.id) ? '2px' : '1px',
            }"
            @click="toggleHomeLook(look.id)"
          >
            <img :src="look.image" :alt="look.title" class="aspect-square w-full object-cover" />
            <div class="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity" :class="config.homeLookIds.includes(look.id) ? 'opacity-100' : 'opacity-0'">
              <Check :size="24" class="text-white" />
            </div>
            <div class="p-2">
              <p class="text-[11px] font-medium truncate">{{ look.title }}</p>
              <p class="text-[9px]" style="color: var(--color-text-muted)">{{ look.author }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Trends -->
      <div class="border p-5 space-y-4" :style="{ borderColor: 'var(--color-border)' }">
        <h3 class="text-xs font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">
          Tendencias en portada
          <span class="ml-1 text-[10px] font-normal normal-case">({{ config.homeTrendIds.length }} seleccionados)</span>
        </h3>
        <div class="space-y-2">
          <div
            v-for="trend in trends"
            :key="trend.id"
            class="flex items-center gap-3 border px-4 py-3 cursor-pointer transition-all duration-200"
            :style="{
              borderColor: config.homeTrendIds.includes(trend.id) ? 'var(--color-accent)' : 'var(--color-border)',
              backgroundColor: config.homeTrendIds.includes(trend.id) ? 'var(--color-bg-elevated)' : 'var(--color-bg)',
            }"
            @click="toggleHomeTrend(trend.id)"
          >
            <img :src="trend.image" class="h-10 w-14 object-cover shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ trend.title }}</p>
              <p class="text-[10px]" style="color: var(--color-text-muted)">{{ trend.tags.slice(0, 2).map(t => '#' + t).join(' ') }} · {{ trend.season }}</p>
            </div>
            <div
              class="h-5 w-5 border-2 flex items-center justify-center shrink-0"
              :style="{ borderColor: config.homeTrendIds.includes(trend.id) ? 'var(--color-accent)' : 'var(--color-border)' }"
            >
              <Check v-if="config.homeTrendIds.includes(trend.id)" :size="12" style="color: var(--color-accent)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ SOCIAL ═══════ -->
    <div v-if="activeTab === 'social'" class="space-y-4">
      <p class="text-sm" style="color: var(--color-text-secondary)">
        Redes sociales del footer
      </p>
      <div class="border p-5 space-y-4" :style="{ borderColor: 'var(--color-border)' }">
        <div>
          <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Instagram</label>
          <input
            v-model="config.social.instagram"
            class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
            :style="{ borderColor: 'var(--color-border)' }"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Twitter</label>
          <input
            v-model="config.social.twitter"
            class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
            :style="{ borderColor: 'var(--color-border)' }"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Email</label>
          <input
            v-model="config.social.email"
            class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
            :style="{ borderColor: 'var(--color-border)' }"
          />
        </div>
      </div>
    </div>

    <!-- ═══════ NEWSLETTER ═══════ -->
    <div v-if="activeTab === 'newsletter'" class="space-y-4">
      <p class="text-sm" style="color: var(--color-text-secondary)">
        Configuración del newsletter
      </p>
      <div class="border p-5 space-y-4" :style="{ borderColor: 'var(--color-border)' }">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium">Newsletter activo</label>
          <button
            @click="config.newsletter.enabled = !config.newsletter.enabled"
            class="relative h-6 w-11 rounded-full transition-all duration-200 cursor-pointer"
            :style="{ backgroundColor: config.newsletter.enabled ? 'var(--color-accent)' : 'var(--color-border)' }"
          >
            <span
              class="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-200 shadow-sm"
              :class="config.newsletter.enabled ? 'left-[22px]' : 'left-0.5'"
            />
          </button>
        </div>
        <div>
          <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Título</label>
          <input
            v-model="config.newsletter.title"
            class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]"
            :style="{ borderColor: 'var(--color-border)' }"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Descripción</label>
          <textarea
            v-model="config.newsletter.description"
            rows="2"
            class="w-full border px-3 py-2 text-sm bg-transparent outline-none resize-none focus:border-[var(--color-accent)]"
            :style="{ borderColor: 'var(--color-border)' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
