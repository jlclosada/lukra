<script setup lang="ts">
import RichTextEditor from '@/components/RichTextEditor.vue'
import type { Article } from '@/data/mock'
import { api } from '@/services/api'
import { useArticlesStore } from '@/stores/articles'
import { BookOpen, Clock, Edit3, ImagePlus, Plus, Search, Trash2, Upload, X } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

interface StaffUser {
  id: string
  display_name: string | null
  username: string
  avatar_url: string | null
  role: string
}

const articlesStore = useArticlesStore()
const allArticles = computed(() => articlesStore.articles)
const searchQuery = ref('')
const showForm = ref(false)
const editingArticle = ref<Article | null>(null)
const confirmDelete = ref<string | null>(null)

// ── Staff users (authors) ──
const staffUsers = ref<StaffUser[]>([])
const staffLoading = ref(false)

async function fetchStaffUsers() {
  staffLoading.value = true
  try {
    const [admins, editors] = await Promise.all([
      api<{ items: StaffUser[] }>('/users/', { params: { role: 'admin', per_page: 50 } }),
      api<{ items: StaffUser[] }>('/users/', { params: { role: 'editor', per_page: 50 } }),
    ])
    const all = [...(admins.items || []), ...(editors.items || [])]
    // Deduplicate by id
    const map = new Map<string, StaffUser>()
    all.forEach(u => map.set(u.id, u))
    staffUsers.value = Array.from(map.values())
  } catch {
    // Backend not available — extract unique authors from existing articles as fallback
    const authorMap = new Map<string, StaffUser>()
    articlesStore.articles.forEach(a => {
      if (a.author && !authorMap.has(a.author)) {
        authorMap.set(a.author, {
          id: a.author,
          display_name: a.author,
          username: a.author.toLowerCase().replace(/\s+/g, '.'),
          avatar_url: a.authorAvatar || null,
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

function selectAuthor(user: StaffUser) {
  form.value.author = getStaffName(user)
  form.value.authorAvatar = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getStaffName(user))}&background=random&size=200`
  authorSearch.value = ''
  showAuthorDropdown.value = false
}

const authorSearch = ref('')
const showAuthorDropdown = ref(false)
const filteredStaff = computed(() => {
  if (!authorSearch.value) return staffUsers.value
  const q = authorSearch.value.toLowerCase()
  return staffUsers.value.filter(u => getStaffName(u).toLowerCase().includes(q))
})

onMounted(() => {
  fetchStaffUsers()
})

const form = ref({
  title: '',
  excerpt: '',
  content: '',
  image: '',
  author: '',
  authorAvatar: '',
  category: 'Tendencias',
  readTime: 5,
  featured: false,
  published: true,
})

const categories = ['Tendencias', 'Guías', 'Sostenibilidad', 'Street Style', 'Estilo', 'Sneakers']

const filteredArticles = computed(() => {
  if (!searchQuery.value) return allArticles.value
  const q = searchQuery.value.toLowerCase()
  return allArticles.value.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q),
  )
})

function openCreate() {
  editingArticle.value = null
  form.value = { title: '', excerpt: '', content: '', image: '', author: '', authorAvatar: '', category: 'Tendencias', readTime: 5, featured: false, published: true }
  showForm.value = true
}

function openEdit(article: Article) {
  editingArticle.value = article
  form.value = {
    title: article.title,
    excerpt: article.excerpt,
    content: article.content || '',
    image: article.image,
    author: article.author,
    authorAvatar: article.authorAvatar,
    category: article.category,
    readTime: article.readTime,
    featured: article.featured || false,
    published: article.published !== false,
  }
  showForm.value = true
}

function saveArticle() {
  if (editingArticle.value) {
    articlesStore.updateArticle(editingArticle.value.id, {
      ...form.value,
    })
  } else {
    articlesStore.addArticle({
      ...form.value,
      date: new Date().toISOString().split('T')[0],
    })
  }
  showForm.value = false
}

function deleteArticle(id: string) {
  articlesStore.deleteArticle(id)
  confirmDelete.value = null
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Image upload
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

function triggerFileInput() {
  fileInput.value?.click()
}

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
</script>

<template>
  <div class="p-8 lg:p-12">
    <!-- Header -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-light" style="font-family: var(--font-display)">Artículos</h1>
        <p class="mt-2 text-sm" style="color: var(--color-text-secondary)">
          Gestiona los artículos editoriales. {{ allArticles.length }} artículos en total.
        </p>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer btn-primary"
      >
        <Plus :size="15" />
        Nuevo Artículo
      </button>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <div
        class="flex items-center gap-3 border px-4 py-2.5"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
      >
        <Search :size="16" style="color: var(--color-text-muted)" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título, autor o categoría..."
          class="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="cursor-pointer transition-opacity hover:opacity-60">
          <X :size="14" style="color: var(--color-text-muted)" />
        </button>
      </div>
    </div>

    <!-- Articles table -->
    <div class="overflow-hidden rounded-sm border" :style="{ borderColor: 'var(--color-border)' }">
      <table class="w-full">
        <thead>
          <tr :style="{ backgroundColor: 'var(--color-bg-subtle)' }">
            <th class="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Artículo</th>
            <th class="hidden px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] md:table-cell" style="color: var(--color-text-muted)">Categoría</th>
            <th class="hidden px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] lg:table-cell" style="color: var(--color-text-muted)">Autor</th>
            <th class="hidden px-6 py-3 text-center text-[10px] font-medium uppercase tracking-[0.15em] sm:table-cell" style="color: var(--color-text-muted)">Fecha</th>
            <th class="px-6 py-3 text-center text-[10px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Estado</th>
            <th class="px-6 py-3 text-right text-[10px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y" :style="{ '--tw-divide-color': 'var(--color-border)' } as any">
          <tr
            v-for="article in filteredArticles"
            :key="article.id"
            class="transition-colors duration-200 hover:bg-[var(--color-bg-subtle)]"
            :style="{ backgroundColor: 'var(--color-bg-elevated)' }"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-4">
                <img :src="article.image" :alt="article.title" class="h-12 w-16 rounded-sm object-cover" />
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="truncate text-sm font-medium">{{ article.title }}</p>
                    <span v-if="article.featured" class="shrink-0 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider" style="background-color: var(--color-accent-gold); color: #fff">
                      ★
                    </span>
                  </div>
                  <p class="mt-0.5 truncate text-xs" style="color: var(--color-text-muted)">{{ article.excerpt }}</p>
                </div>
              </div>
            </td>
            <td class="hidden px-6 py-4 md:table-cell">
              <span class="text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-accent-warm)">
                {{ article.category }}
              </span>
            </td>
            <td class="hidden px-6 py-4 lg:table-cell">
              <div class="flex items-center gap-2">
                <img :src="article.authorAvatar" :alt="article.author" class="h-6 w-6 rounded-full object-cover" />
                <span class="text-sm" style="color: var(--color-text-secondary)">{{ article.author }}</span>
              </div>
            </td>
            <td class="hidden px-6 py-4 text-center sm:table-cell">
              <div class="flex items-center justify-center gap-1.5 text-xs" style="color: var(--color-text-muted)">
                <Clock :size="11" />
                {{ article.readTime }}min
              </div>
              <p class="mt-0.5 text-[10px]" style="color: var(--color-text-muted)">{{ formatDate(article.date) }}</p>
            </td>
            <td class="px-6 py-4 text-center">
              <span
                class="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                :style="{
                  backgroundColor: article.published !== false ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' : 'color-mix(in srgb, var(--color-text-muted) 15%, transparent)',
                  color: article.published !== false ? 'var(--color-success)' : 'var(--color-text-muted)',
                }"
              >
                {{ article.published !== false ? 'Publicado' : 'Borrador' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="openEdit(article)"
                  class="flex h-8 w-8 items-center justify-center rounded transition-all duration-200 cursor-pointer hover:bg-[var(--color-bg-subtle)]"
                  title="Editar"
                >
                  <Edit3 :size="14" style="color: var(--color-text-secondary)" />
                </button>
                <button
                  v-if="confirmDelete !== article.id"
                  @click="confirmDelete = article.id"
                  class="flex h-8 w-8 items-center justify-center rounded transition-all duration-200 cursor-pointer hover:bg-red-50"
                  title="Eliminar"
                >
                  <Trash2 :size="14" style="color: var(--color-error)" />
                </button>
                <div v-else class="flex items-center gap-1">
                  <button @click="deleteArticle(article.id)" class="px-2 py-1 text-[10px] font-medium uppercase tracking-wider cursor-pointer btn-danger">Sí</button>
                  <button @click="confirmDelete = null" class="px-2 py-1 text-[10px] font-medium uppercase tracking-wider cursor-pointer btn-ghost">No</button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredArticles.length === 0" class="px-6 py-16 text-center" :style="{ backgroundColor: 'var(--color-bg-elevated)' }">
        <BookOpen :size="40" class="mx-auto mb-4" style="color: var(--color-text-muted)" />
        <p class="text-sm" style="color: var(--color-text-muted)">No se encontraron artículos</p>
      </div>
    </div>

    <!-- Form modal — full-screen editor -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="fixed inset-0 z-[100] flex flex-col" style="background-color: var(--color-bg)">
          <!-- Top bar -->
          <div class="flex items-center justify-between border-b px-6 py-3 shrink-0" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }">
            <div class="flex items-center gap-4">
              <button @click="showForm = false" class="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-60 text-sm" style="color: var(--color-text-muted)">
                <X :size="18" />
                Cerrar
              </button>
              <span class="h-5 w-px" style="background-color: var(--color-border)" />
              <h2 class="text-sm font-medium" style="font-family: var(--font-heading)">
                {{ editingArticle ? 'Editar Artículo' : 'Nuevo Artículo' }}
              </h2>
            </div>
            <div class="flex items-center gap-3">
              <button @click="showForm = false" class="px-4 py-2 text-[11px] font-medium uppercase tracking-wider cursor-pointer btn-outline">Cancelar</button>
              <button @click="saveArticle" :disabled="!form.title" class="px-5 py-2 text-[11px] font-medium uppercase tracking-wider cursor-pointer btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                {{ editingArticle ? 'Guardar Cambios' : 'Crear Artículo' }}
              </button>
            </div>
          </div>

          <!-- Main content: two columns -->
          <div class="flex flex-1 overflow-hidden">
            <!-- Left: Editor area (takes most space) -->
            <div class="flex-1 overflow-y-auto px-8 py-6 lg:px-12">
              <!-- Title -->
              <input
                v-model="form.title"
                type="text"
                class="w-full bg-transparent text-3xl font-light outline-none mb-4 placeholder:text-[var(--color-text-muted)]"
                style="font-family: var(--font-display); color: var(--color-text)"
                placeholder="Título del artículo"
              />
              <!-- Excerpt -->
              <textarea
                v-model="form.excerpt"
                rows="2"
                class="w-full bg-transparent text-base outline-none resize-none mb-6 placeholder:text-[var(--color-text-muted)]"
                style="color: var(--color-text-secondary)"
                placeholder="Escribe un breve resumen del artículo..."
              />
              <div class="h-px mb-6" style="background-color: var(--color-border)" />
              <!-- Rich text editor -->
              <RichTextEditor v-model="form.content" />
            </div>

            <!-- Right: Sidebar with metadata -->
            <div class="w-80 shrink-0 overflow-y-auto border-l px-6 py-6 space-y-5" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }">
              <!-- Cover image -->
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Imagen de portada</label>
                <div class="mb-2 flex gap-0 border rounded-sm overflow-hidden" :style="{ borderColor: 'var(--color-border)' }">
                  <button
                    @click="imageMode = 'upload'"
                    class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[9px] font-medium uppercase tracking-wider cursor-pointer transition-all"
                    :style="{
                      backgroundColor: imageMode === 'upload' ? 'var(--color-accent)' : 'transparent',
                      color: imageMode === 'upload' ? 'var(--color-bg)' : 'var(--color-text-muted)',
                    }"
                  >
                    <Upload :size="11" /> Subir
                  </button>
                  <button
                    @click="imageMode = 'url'"
                    class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[9px] font-medium uppercase tracking-wider cursor-pointer transition-all"
                    :style="{
                      backgroundColor: imageMode === 'url' ? 'var(--color-accent)' : 'transparent',
                      color: imageMode === 'url' ? 'var(--color-bg)' : 'var(--color-text-muted)',
                    }"
                  >
                    <ImagePlus :size="11" /> URL
                  </button>
                </div>
                <div v-if="imageMode === 'upload'">
                  <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelect" />
                  <div
                    v-if="!imagePreview && !form.image"
                    class="relative flex flex-col items-center justify-center border-2 border-dashed rounded-sm px-4 py-6 cursor-pointer transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-subtle)]"
                    :style="{ borderColor: 'var(--color-border)' }"
                    @click="triggerFileInput"
                    @dragover.prevent
                    @drop="onImageDrop"
                  >
                    <Upload :size="22" style="color: var(--color-text-muted)" />
                    <p class="mt-2 text-xs" style="color: var(--color-text-secondary)">Arrastra o haz clic</p>
                  </div>
                  <div v-else class="relative">
                    <img :src="imagePreview || form.image" class="w-full aspect-video object-cover rounded-sm" />
                    <button @click="removeImage" class="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white cursor-pointer hover:bg-black/70"><X :size="12" /></button>
                  </div>
                </div>
                <div v-else>
                  <input v-model="form.image" type="url" class="w-full border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" placeholder="https://..." />
                  <div v-if="form.image" class="mt-2">
                    <img :src="form.image" class="w-full aspect-video object-cover rounded-sm" @error="($event.target as HTMLImageElement).style.display='none'" />
                  </div>
                </div>
              </div>

              <!-- Author selector -->
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Autor</label>
                <!-- Selected author preview -->
                <div v-if="form.author" class="flex items-center gap-3 border px-3 py-2 mb-2" :style="{ borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-bg)' }">
                  <img :src="form.authorAvatar" :alt="form.author" class="h-7 w-7 rounded-full object-cover shrink-0" />
                  <span class="text-sm flex-1 truncate">{{ form.author }}</span>
                  <button @click="form.author = ''; form.authorAvatar = ''" class="cursor-pointer shrink-0 transition-opacity hover:opacity-60">
                    <X :size="14" style="color: var(--color-text-muted)" />
                  </button>
                </div>
                <!-- Author search -->
                <div v-if="!form.author" class="relative">
                  <div class="flex items-center gap-2 border px-3 py-2" :style="{ borderColor: showAuthorDropdown ? 'var(--color-accent)' : 'var(--color-border)', backgroundColor: 'var(--color-bg)' }">
                    <Search :size="14" style="color: var(--color-text-muted)" />
                    <input
                      v-model="authorSearch"
                      type="text"
                      placeholder="Buscar autor..."
                      class="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
                      @focus="showAuthorDropdown = true"
                      @blur="setTimeout(() => showAuthorDropdown = false, 200)"
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

              <!-- Category -->
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Categoría</label>
                <select v-model="form.category" class="w-full border px-3 py-2 text-sm outline-none cursor-pointer transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }">
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>

              <!-- Read time -->
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Tiempo de lectura (min)</label>
                <input v-model.number="form.readTime" type="number" min="1" class="w-full border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" />
              </div>

              <!-- Toggles -->
              <div class="space-y-3 pt-2">
                <label class="flex cursor-pointer items-center gap-2">
                  <input v-model="form.featured" type="checkbox" class="h-4 w-4 cursor-pointer" />
                  <span class="text-sm">Destacado</span>
                </label>
                <label class="flex cursor-pointer items-center gap-2">
                  <input v-model="form.published" type="checkbox" class="h-4 w-4 cursor-pointer" />
                  <span class="text-sm">Publicado</span>
                </label>
              </div>
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
