<script setup lang="ts">
import type { Article } from '@/data/mock'
import { articles as mockArticles } from '@/data/mock'
import { BookOpen, Clock, Edit3, Plus, Search, Trash2, X } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const allArticles = ref<Article[]>([...mockArticles])
const searchQuery = ref('')
const showForm = ref(false)
const editingArticle = ref<Article | null>(null)
const confirmDelete = ref<string | null>(null)

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
    const idx = allArticles.value.findIndex((a) => a.id === editingArticle.value!.id)
    if (idx !== -1) {
      allArticles.value[idx] = {
        ...allArticles.value[idx],
        ...form.value,
        date: allArticles.value[idx].date,
      }
    }
  } else {
    allArticles.value.unshift({
      id: String(Date.now()),
      ...form.value,
      date: new Date().toISOString().split('T')[0],
    })
  }
  showForm.value = false
}

function deleteArticle(id: string) {
  allArticles.value = allArticles.value.filter((a) => a.id !== id)
  confirmDelete.value = null
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
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

    <!-- Form modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="fixed inset-0 z-[100] flex items-center justify-center" @click.self="showForm = false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showForm = false" />
          <div class="relative z-10 mx-4 w-full max-w-2xl overflow-y-auto rounded-sm" style="background-color: var(--color-bg-elevated); max-height: 90vh">
            <div class="flex items-center justify-between border-b px-8 py-5" :style="{ borderColor: 'var(--color-border)' }">
              <h2 class="text-lg font-medium" style="font-family: var(--font-heading)">
                {{ editingArticle ? 'Editar Artículo' : 'Nuevo Artículo' }}
              </h2>
              <button @click="showForm = false" class="cursor-pointer transition-opacity hover:opacity-60"><X :size="20" /></button>
            </div>

            <div class="space-y-5 px-8 py-6">
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Título</label>
                <input v-model="form.title" type="text" class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" placeholder="Título del artículo" />
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Extracto</label>
                <textarea v-model="form.excerpt" rows="2" class="w-full resize-none border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" placeholder="Breve resumen" />
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Contenido</label>
                <textarea v-model="form.content" rows="6" class="w-full resize-none border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" placeholder="Contenido del artículo..." />
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">URL de imagen</label>
                <input v-model="form.image" type="url" class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" placeholder="https://..." />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Autor</label>
                  <input v-model="form.author" type="text" class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" />
                </div>
                <div>
                  <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Categoría</label>
                  <select v-model="form.category" class="w-full border px-4 py-2.5 text-sm outline-none cursor-pointer transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }">
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Lectura (min)</label>
                  <input v-model.number="form.readTime" type="number" min="1" class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" />
                </div>
                <div class="flex items-end">
                  <label class="flex cursor-pointer items-center gap-2 py-2.5">
                    <input v-model="form.featured" type="checkbox" class="h-4 w-4 cursor-pointer" />
                    <span class="text-sm">Destacado</span>
                  </label>
                </div>
                <div class="flex items-end">
                  <label class="flex cursor-pointer items-center gap-2 py-2.5">
                    <input v-model="form.published" type="checkbox" class="h-4 w-4 cursor-pointer" />
                    <span class="text-sm">Publicado</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 border-t px-8 py-5" :style="{ borderColor: 'var(--color-border)' }">
              <button @click="showForm = false" class="px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer btn-outline">Cancelar</button>
              <button @click="saveArticle" :disabled="!form.title" class="px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                {{ editingArticle ? 'Guardar' : 'Crear' }}
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
