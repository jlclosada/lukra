<script setup lang="ts">
import type { Trend } from '@/data/mock'
import { trends as mockTrends } from '@/data/mock'
import { Edit3, Plus, Search, Trash2, TrendingUp, X } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const allTrends = ref<Trend[]>([...mockTrends])
const searchQuery = ref('')
const showForm = ref(false)
const editingTrend = ref<Trend | null>(null)
const confirmDelete = ref<string | null>(null)

const form = ref({
  title: '',
  description: '',
  image: '',
  tags: '',
  season: 'SS26',
  popularity: 50,
  published: true,
})

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
  form.value = { title: '', description: '', image: '', tags: '', season: 'SS26', popularity: 50, published: true }
  showForm.value = true
}

function openEdit(trend: Trend) {
  editingTrend.value = trend
  form.value = {
    title: trend.title,
    description: trend.description,
    image: trend.image,
    tags: trend.tags.join(', '),
    season: trend.season,
    popularity: trend.popularity,
    published: trend.published !== false,
  }
  showForm.value = true
}

function saveTrend() {
  const tags = form.value.tags.split(',').map((t) => t.trim()).filter(Boolean)
  if (editingTrend.value) {
    const idx = allTrends.value.findIndex((t) => t.id === editingTrend.value!.id)
    if (idx !== -1) {
      allTrends.value[idx] = {
        ...allTrends.value[idx],
        title: form.value.title,
        description: form.value.description,
        image: form.value.image,
        tags,
        season: form.value.season,
        popularity: form.value.popularity,
        published: form.value.published,
      }
    }
  } else {
    allTrends.value.unshift({
      id: String(Date.now()),
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

function deleteTrend(id: string) {
  allTrends.value = allTrends.value.filter((t) => t.id !== id)
  confirmDelete.value = null
}
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
        <!-- Number -->
        <span class="w-8 text-center text-2xl font-light shrink-0" style="font-family: var(--font-display); color: var(--color-border)">
          {{ String(i + 1).padStart(2, '0') }}
        </span>

        <!-- Image -->
        <img :src="trend.image" :alt="trend.title" class="h-16 w-16 shrink-0 rounded-sm object-cover" />

        <!-- Content -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-medium">{{ trend.title }}</h3>
            <span class="text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-accent-warm)">{{ trend.season }}</span>
          </div>
          <p class="mt-1 truncate text-xs" style="color: var(--color-text-muted)">{{ trend.description }}</p>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <span v-for="tag in trend.tags" :key="tag" class="border px-2 py-0.5 text-[9px] uppercase tracking-wider" :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }">
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Popularity -->
        <div class="hidden w-32 shrink-0 sm:block">
          <div class="flex items-center justify-between mb-1">
            <TrendingUp :size="12" style="color: var(--color-success)" />
            <span class="text-xs font-medium">{{ trend.popularity }}%</span>
          </div>
          <div class="h-1.5 w-full overflow-hidden" :style="{ backgroundColor: 'var(--color-bg-subtle)' }">
            <div class="h-full transition-all duration-500" :style="{ width: `${trend.popularity}%`, backgroundColor: 'var(--color-accent)' }" />
          </div>
        </div>

        <!-- Status -->
        <span
          class="hidden shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider lg:inline-block"
          :style="{
            backgroundColor: trend.published !== false ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' : 'color-mix(in srgb, var(--color-text-muted) 15%, transparent)',
            color: trend.published !== false ? 'var(--color-success)' : 'var(--color-text-muted)',
          }"
        >
          {{ trend.published !== false ? 'Activa' : 'Borrador' }}
        </span>

        <!-- Actions -->
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
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Título</label>
                <input v-model="form.title" type="text" class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" placeholder="Nombre de la tendencia" />
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Descripción</label>
                <textarea v-model="form.description" rows="4" class="w-full resize-none border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" placeholder="Descripción de la tendencia" />
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">URL de imagen</label>
                <input v-model="form.image" type="url" class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" />
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Tags (separados por coma)</label>
                <input v-model="form.tags" type="text" class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" />
              </div>
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
