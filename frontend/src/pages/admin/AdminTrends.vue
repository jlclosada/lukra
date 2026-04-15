<script setup lang="ts">
import { api } from '@/services/api'
import type { Trend } from '@/stores/trends'
import { useTrendsStore } from '@/stores/trends'
import { Edit3, ImagePlus, Plus, Search, Trash2, TrendingUp, Upload, X } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

interface StaffUser {
  id: string
  display_name: string | null
  username: string
  avatar_url: string | null
  role: string
}

interface ApiTag {
  id: string
  name: string
}

const trendsStore = useTrendsStore()
const allTrends = computed(() => trendsStore.trends)
const searchQuery = ref('')
const showForm = ref(false)
const editingTrend = ref<Trend | null>(null)
const confirmDelete = ref<string | null>(null)

const form = ref({
  title: '',
  description: '',
  image: '',
  author: '',
  authorAvatar: '',
  tags: [] as string[],
  season: 'SS26',
  popularity: 50,
  published: true,
})

// ── Tag input (from backend) ──
const tagInput = ref('')
const showTagSuggestions = ref(false)
const apiTags = ref<ApiTag[]>([])

function delayBlur(fn: () => void) { setTimeout(fn, 200) }

async function fetchTags() {
  try {
    const data = await api<{ items: ApiTag[] }>('/tags/', { params: { per_page: 200 } })
    apiTags.value = data.items
  } catch {
    // Fallback: extract from existing trends
    const tagSet = new Set<string>()
    trendsStore.trends.forEach(t => t.tags.forEach(tag => tagSet.add(tag)))
    apiTags.value = Array.from(tagSet).map(name => ({ id: name, name }))
  }
}

const filteredTagSuggestions = computed(() => {
  const existing = form.value.tags
  const available = apiTags.value.filter(t => !existing.includes(t.name))
  if (!tagInput.value) return available.slice(0, 20)
  const q = tagInput.value.toLowerCase()
  return available.filter(t => t.name.toLowerCase().includes(q))
})

function addTag(tag: string) {
  const trimmed = tag.trim().toLowerCase()
  if (trimmed && !form.value.tags.includes(trimmed)) {
    form.value.tags.push(trimmed)
  }
  tagInput.value = ''
  showTagSuggestions.value = false
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

function onTagInputKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    if (tagInput.value.trim()) addTag(tagInput.value)
  } else if (e.key === 'Backspace' && !tagInput.value && form.value.tags.length > 0) {
    form.value.tags.pop()
  }
}

// ── Author search ──
const staffUsers = ref<StaffUser[]>([])
const staffLoading = ref(false)
const authorSearch = ref('')
const showAuthorDropdown = ref(false)

async function fetchStaffUsers() {
  staffLoading.value = true
  try {
    const [admins, editors] = await Promise.all([
      api<{ items: StaffUser[] }>('/users/', { params: { role: 'admin', per_page: 50 } }),
      api<{ items: StaffUser[] }>('/users/', { params: { role: 'editor', per_page: 50 } }),
    ])
    const all = [...(admins.items || []), ...(editors.items || [])]
    const map = new Map<string, StaffUser>()
    all.forEach(u => map.set(u.id, u))
    staffUsers.value = Array.from(map.values())
  } catch {
    const authorMap = new Map<string, StaffUser>()
    trendsStore.trends.forEach(t => {
      if (t.author && !authorMap.has(t.author)) {
        authorMap.set(t.author, {
          id: t.author,
          display_name: t.author,
          username: t.author.toLowerCase().replace(/\s+/g, '.'),
          avatar_url: t.authorAvatar || null,
          role: 'editor',
        })
      }
    })
    staffUsers.value = Array.from(authorMap.values())
  } finally {
    staffLoading.value = false
  }
}

function getStaffName(user: StaffUser) {
  return user.display_name || user.username
}

const filteredStaff = computed(() => {
  if (!authorSearch.value) return staffUsers.value
  const q = authorSearch.value.toLowerCase()
  return staffUsers.value.filter(u => getStaffName(u).toLowerCase().includes(q))
})

function selectAuthor(user: StaffUser) {
  form.value.author = getStaffName(user)
  form.value.authorAvatar = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getStaffName(user))}&background=random&size=200`
  authorSearch.value = ''
  showAuthorDropdown.value = false
}

// ── Image upload ──
const imageMode = ref<'url' | 'upload'>('url')
const imagePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const result = ev.target?.result as string
    imagePreview.value = result
    form.value.image = result
  }
  reader.readAsDataURL(file)
}

function triggerFileInput() { fileInput.value?.click() }

function onImageDrop(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const result = ev.target?.result as string
    imagePreview.value = result
    form.value.image = result
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  imagePreview.value = null
  form.value.image = ''
  if (fileInput.value) fileInput.value.value = ''
}

// ── CRUD ──
const filteredTrends = computed(() => {
  if (!searchQuery.value) return allTrends.value
  const q = searchQuery.value.toLowerCase()
  return allTrends.value.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)),
  )
})

function openCreate() {
  editingTrend.value = null
  form.value = { title: '', description: '', image: '', author: '', authorAvatar: '', tags: [], season: 'SS26', popularity: 50, published: true }
  tagInput.value = ''
  authorSearch.value = ''
  imagePreview.value = null
  imageMode.value = 'url'
  showForm.value = true
}

function openEdit(trend: Trend) {
  editingTrend.value = trend
  form.value = {
    title: trend.title,
    description: trend.description,
    image: trend.image,
    author: trend.author || '',
    authorAvatar: trend.authorAvatar || '',
    tags: [...trend.tags],
    season: trend.season,
    popularity: trend.popularity,
    published: trend.published !== false,
  }
  tagInput.value = ''
  authorSearch.value = ''
  imagePreview.value = null
  imageMode.value = trend.image.startsWith('data:') ? 'upload' : 'url'
  showForm.value = true
}

async function saveTrend() {
  const tags = form.value.tags
  if (editingTrend.value) {
    await trendsStore.updateTrend(editingTrend.value.id, {
      title: form.value.title,
      description: form.value.description,
      image: form.value.image,
      tags,
      season: form.value.season,
      popularity: form.value.popularity,
      published: form.value.published,
    })
  } else {
    await trendsStore.addTrend({
      title: form.value.title,
      description: form.value.description,
      image: form.value.image || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
      tags,
      season: form.value.season,
      popularity: form.value.popularity,
      published: form.value.published,
    })
  }
  showForm.value = false
}

async function deleteTrend(id: string) {
  await trendsStore.deleteTrend(id)
  confirmDelete.value = null
}

onMounted(() => {
  fetchTags()
  fetchStaffUsers()
})
</script>

<template>
  <div class="p-8 lg:p-12">
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-light" style="font-family: var(--font-display)">Tendencias</h1>
        <p class="mt-2 text-sm" style="color: var(--color-text-secondary)">
          Gestiona las tendencias de moda. {{ allTrends.length }} tendencias en total.
        </p>
      </div>
      <button @click="openCreate" class="flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer btn-primary">
        <Plus :size="15" /> Nueva Tendencia
      </button>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <div class="flex items-center gap-3 border px-4 py-2.5" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }">
        <Search :size="16" style="color: var(--color-text-muted)" />
        <input v-model="searchQuery" type="text" placeholder="Buscar tendencias..." class="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]" />
        <button v-if="searchQuery" @click="searchQuery = ''" class="cursor-pointer"><X :size="14" style="color: var(--color-text-muted)" /></button>
      </div>
    </div>

    <!-- Trends list -->
    <div class="space-y-0 rounded-sm border overflow-hidden" :style="{ borderColor: 'var(--color-border)' }">
      <div
        v-for="(trend, i) in filteredTrends"
        :key="trend.id"
        class="flex items-center gap-6 border-b px-6 py-5 transition-colors duration-200 hover:bg-[var(--color-bg-subtle)]"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
      >
        <span class="w-8 text-center text-2xl font-light shrink-0" style="font-family: var(--font-display); color: var(--color-border)">
          {{ String(i + 1).padStart(2, '0') }}
        </span>
        <img :src="trend.image" :alt="trend.title" class="h-16 w-16 shrink-0 rounded-sm object-cover" />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-medium">{{ trend.title }}</h3>
            <span class="text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-accent-warm)">{{ trend.season }}</span>
          </div>
          <div v-if="trend.author" class="mt-1 flex items-center gap-2">
            <img :src="trend.authorAvatar" :alt="trend.author" class="h-4 w-4 rounded-full object-cover" />
            <span class="text-[10px]" style="color: var(--color-text-muted)">{{ trend.author }}</span>
          </div>
          <p class="mt-1 truncate text-xs" style="color: var(--color-text-muted)">{{ trend.description }}</p>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <span v-for="tag in trend.tags" :key="tag" class="border px-2 py-0.5 text-[9px] uppercase tracking-wider" :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }">
              #{{ tag }}
            </span>
          </div>
        </div>
        <div class="hidden w-32 shrink-0 sm:block">
          <div class="flex items-center justify-between mb-1">
            <TrendingUp :size="12" style="color: var(--color-success)" />
            <span class="text-xs font-medium">{{ trend.popularity }}%</span>
          </div>
          <div class="h-1.5 w-full overflow-hidden" :style="{ backgroundColor: 'var(--color-bg-subtle)' }">
            <div class="h-full transition-all duration-500" :style="{ width: `${trend.popularity}%`, backgroundColor: 'var(--color-accent)' }" />
          </div>
        </div>
        <span
          class="hidden shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider lg:inline-block"
          :style="{
            backgroundColor: trend.published !== false ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' : 'color-mix(in srgb, var(--color-text-muted) 15%, transparent)',
            color: trend.published !== false ? 'var(--color-success)' : 'var(--color-text-muted)',
          }"
        >
          {{ trend.published !== false ? 'Activa' : 'Borrador' }}
        </span>
        <div class="flex shrink-0 items-center gap-1">
          <button @click="openEdit(trend)" class="flex h-8 w-8 items-center justify-center rounded cursor-pointer transition-all hover:bg-[var(--color-bg-subtle)]" title="Editar">
            <Edit3 :size="14" style="color: var(--color-text-secondary)" />
          </button>
          <button
            v-if="confirmDelete !== trend.id"
            @click="confirmDelete = trend.id"
            class="flex h-8 w-8 items-center justify-center rounded cursor-pointer transition-all hover:bg-red-50"
            title="Eliminar"
          >
            <Trash2 :size="14" style="color: var(--color-error)" />
          </button>
          <div v-else class="flex items-center gap-1">
            <button @click="deleteTrend(trend.id)" class="px-2 py-1 text-[10px] font-medium uppercase cursor-pointer btn-danger">Sí</button>
            <button @click="confirmDelete = null" class="px-2 py-1 text-[10px] font-medium uppercase cursor-pointer btn-ghost">No</button>
          </div>
        </div>
      </div>

      <div v-if="filteredTrends.length === 0" class="px-6 py-16 text-center" :style="{ backgroundColor: 'var(--color-bg-elevated)' }">
        <TrendingUp :size="40" class="mx-auto mb-4" style="color: var(--color-text-muted)" />
        <p class="text-sm" style="color: var(--color-text-muted)">No se encontraron tendencias</p>
      </div>
    </div>

    <!-- Form modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="fixed inset-0 z-[100] flex items-center justify-center" @click.self="showForm = false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showForm = false" />
          <div class="relative z-10 mx-4 w-full max-w-2xl overflow-y-auto rounded-sm" style="background-color: var(--color-bg-elevated); max-height: 90vh">
            <div class="flex items-center justify-between border-b px-8 py-5" :style="{ borderColor: 'var(--color-border)' }">
              <h2 class="text-lg font-medium" style="font-family: var(--font-heading)">
                {{ editingTrend ? 'Editar Tendencia' : 'Nueva Tendencia' }}
              </h2>
              <button @click="showForm = false" class="cursor-pointer transition-opacity hover:opacity-60"><X :size="20" /></button>
            </div>

            <div class="space-y-5 px-8 py-6">
              <!-- Title -->
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Título</label>
                <input v-model="form.title" type="text" class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" placeholder="Nombre de la tendencia" />
              </div>

              <!-- Description -->
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Descripción</label>
                <textarea v-model="form.description" rows="4" class="w-full resize-none border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" placeholder="Descripción de la tendencia" />
              </div>

              <!-- Image -->
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Imagen</label>
                <div class="mb-3 flex gap-0 border rounded-sm overflow-hidden" :style="{ borderColor: 'var(--color-border)' }">
                  <button
                    @click="imageMode = 'upload'"
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-wider cursor-pointer transition-all"
                    :style="{ backgroundColor: imageMode === 'upload' ? 'var(--color-accent)' : 'transparent', color: imageMode === 'upload' ? 'var(--color-bg)' : 'var(--color-text-muted)' }"
                  >
                    <Upload :size="13" /> Subir archivo
                  </button>
                  <button
                    @click="imageMode = 'url'"
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-wider cursor-pointer transition-all"
                    :style="{ backgroundColor: imageMode === 'url' ? 'var(--color-accent)' : 'transparent', color: imageMode === 'url' ? 'var(--color-bg)' : 'var(--color-text-muted)' }"
                  >
                    <ImagePlus :size="13" /> URL
                  </button>
                </div>
                <div v-if="imageMode === 'upload'">
                  <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelect" />
                  <div
                    v-if="!imagePreview && !form.image"
                    class="relative flex flex-col items-center justify-center border-2 border-dashed rounded-sm px-6 py-10 cursor-pointer transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-subtle)]"
                    :style="{ borderColor: 'var(--color-border)' }"
                    @click="triggerFileInput"
                    @dragover.prevent
                    @drop="onImageDrop"
                  >
                    <Upload :size="28" style="color: var(--color-text-muted)" />
                    <p class="mt-3 text-sm" style="color: var(--color-text-secondary)">Haz clic o arrastra una imagen</p>
                    <p class="mt-1 text-[10px]" style="color: var(--color-text-muted)">JPG, PNG, WebP — máx. 5MB</p>
                  </div>
                  <div v-else class="relative">
                    <img :src="imagePreview || form.image" class="w-full max-h-48 object-cover rounded-sm" />
                    <button @click="removeImage" class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white cursor-pointer hover:bg-black/70">
                      <X :size="14" />
                    </button>
                  </div>
                </div>
                <div v-else>
                  <input v-model="form.image" type="url" class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" placeholder="https://..." />
                  <div v-if="form.image && !form.image.startsWith('data:')" class="mt-2">
                    <img :src="form.image" class="w-full max-h-32 object-cover rounded-sm" @error="($event.target as HTMLImageElement).style.display='none'" />
                  </div>
                </div>
              </div>

              <!-- Author -->
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Autor</label>
                <div v-if="form.author" class="flex items-center gap-3 border px-3 py-2 mb-2" :style="{ borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-bg)' }">
                  <img :src="form.authorAvatar" :alt="form.author" class="h-7 w-7 rounded-full object-cover shrink-0" />
                  <span class="text-sm flex-1 truncate">{{ form.author }}</span>
                  <button @click="form.author = ''; form.authorAvatar = ''" class="cursor-pointer shrink-0 transition-opacity hover:opacity-60">
                    <X :size="14" style="color: var(--color-text-muted)" />
                  </button>
                </div>
                <div v-if="!form.author" class="relative">
                  <div class="flex items-center gap-2 border px-3 py-2" :style="{ borderColor: showAuthorDropdown ? 'var(--color-accent)' : 'var(--color-border)', backgroundColor: 'var(--color-bg)' }">
                    <Search :size="14" style="color: var(--color-text-muted)" />
                    <input
                      v-model="authorSearch"
                      type="text"
                      placeholder="Buscar autor..."
                      class="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
                      @focus="showAuthorDropdown = true"
                      @blur="delayBlur(() => showAuthorDropdown = false)"
                    />
                  </div>
                  <div v-if="showAuthorDropdown" class="absolute left-0 right-0 z-20 mt-1 border rounded-sm overflow-hidden shadow-lg" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }">
                    <div v-if="staffLoading" class="px-3 py-4 text-center">
                      <p class="text-xs" style="color: var(--color-text-muted)">Cargando equipo...</p>
                    </div>
                    <div v-else-if="filteredStaff.length === 0" class="px-3 py-4 text-center">
                      <p class="text-xs" style="color: var(--color-text-muted)">No se encontraron editores</p>
                    </div>
                    <div v-else class="max-h-48 overflow-y-auto">
                      <button
                        v-for="user in filteredStaff"
                        :key="user.id"
                        @mousedown.prevent="selectAuthor(user)"
                        class="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer hover:bg-[var(--color-bg-subtle)]"
                      >
                        <img
                          :src="user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getStaffName(user))}&background=random&size=200`"
                          :alt="getStaffName(user)"
                          class="h-7 w-7 rounded-full object-cover shrink-0"
                        />
                        <div class="flex-1 min-w-0">
                          <p class="text-sm truncate">{{ getStaffName(user) }}</p>
                          <p class="text-[10px] capitalize" style="color: var(--color-text-muted)">{{ user.role }}</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tags -->
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Tags</label>
                <div class="relative">
                  <div
                    class="flex flex-wrap items-center gap-1.5 border px-3 py-2 min-h-[42px] cursor-text"
                    :style="{ borderColor: showTagSuggestions ? 'var(--color-accent)' : 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                  >
                    <span
                      v-for="tag in form.tags"
                      :key="tag"
                      class="inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                      :style="{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)', backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)' }"
                    >
                      {{ tag }}
                      <button @click.stop="removeTag(tag)" class="cursor-pointer hover:opacity-60">
                        <X :size="10" />
                      </button>
                    </span>
                    <input
                      v-model="tagInput"
                      type="text"
                      placeholder="Escribe un tag..."
                      class="flex-1 min-w-[100px] bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
                      @keydown="onTagInputKeydown"
                      @focus="showTagSuggestions = true"
                      @blur="delayBlur(() => showTagSuggestions = false)"
                    />
                  </div>
                  <div
                    v-if="showTagSuggestions && filteredTagSuggestions.length > 0"
                    class="absolute left-0 right-0 z-20 mt-1 border rounded-sm overflow-hidden shadow-lg"
                    :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
                  >
                    <div class="max-h-36 overflow-y-auto">
                      <button
                        v-for="tag in filteredTagSuggestions"
                        :key="tag.id"
                        @mousedown.prevent="addTag(tag.name)"
                        class="flex w-full items-center px-3 py-2 text-left text-xs uppercase tracking-wider cursor-pointer transition-colors hover:bg-[var(--color-bg-subtle)]"
                        style="color: var(--color-text-secondary)"
                      >
                        {{ tag.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Season / Popularity / Published -->
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Temporada</label>
                  <select v-model="form.season" class="w-full border px-4 py-2.5 text-sm outline-none cursor-pointer" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }">
                    <option value="SS26">SS26</option>
                    <option value="AW25">AW25</option>
                    <option value="SS25">SS25</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Popularidad (%)</label>
                  <input v-model.number="form.popularity" type="number" min="0" max="100" class="w-full border px-4 py-2.5 text-sm outline-none" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" />
                </div>
                <div class="flex items-end">
                  <label class="flex cursor-pointer items-center gap-2 py-2.5">
                    <input v-model="form.published" type="checkbox" class="h-4 w-4 cursor-pointer" />
                    <span class="text-sm">Publicada</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 border-t px-8 py-5" :style="{ borderColor: 'var(--color-border)' }">
              <button @click="showForm = false" class="px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer btn-outline">Cancelar</button>
              <button @click="saveTrend" :disabled="!form.title" class="px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                {{ editingTrend ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active { animation: fadeIn 0.25s ease-out; }
.modal-enter-active > div:nth-child(2) { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-leave-active { animation: fadeIn 0.2s ease-in reverse; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
