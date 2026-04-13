<script setup lang="ts">
import type { Look } from '@/data/mock'
import { looks as mockLooks } from '@/data/mock'
import { Camera, Edit3, Heart, Plus, Search, Trash2, X } from 'lucide-vue-next'
import { computed, ref } from 'vue'

// Local mutable copy of looks
const allLooks = ref<Look[]>([...mockLooks])
const searchQuery = ref('')
const showForm = ref(false)
const editingLook = ref<Look | null>(null)
const confirmDelete = ref<string | null>(null)

// Form data
const form = ref({
  title: '',
  description: '',
  image: '',
  author: '',
  authorAvatar: '',
  tags: '',
  season: 'SS26',
  aspect: 'tall' as 'tall' | 'wide' | 'square',
})

const filteredLooks = computed(() => {
  if (!searchQuery.value) return allLooks.value
  const q = searchQuery.value.toLowerCase()
  return allLooks.value.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.author.toLowerCase().includes(q) ||
      l.tags.some((t) => t.toLowerCase().includes(q)),
  )
})

function openCreate() {
  editingLook.value = null
  form.value = { title: '', description: '', image: '', author: '', authorAvatar: '', tags: '', season: 'SS26', aspect: 'tall' }
  showForm.value = true
}

function openEdit(look: Look) {
  editingLook.value = look
  form.value = {
    title: look.title,
    description: look.description || '',
    image: look.image,
    author: look.author,
    authorAvatar: look.authorAvatar,
    tags: look.tags.join(', '),
    season: look.season,
    aspect: look.aspect,
  }
  showForm.value = true
}

function saveLook() {
  const tags = form.value.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  if (editingLook.value) {
    const idx = allLooks.value.findIndex((l) => l.id === editingLook.value!.id)
    if (idx !== -1) {
      allLooks.value[idx] = {
        ...allLooks.value[idx],
        title: form.value.title,
        description: form.value.description,
        image: form.value.image,
        author: form.value.author,
        authorAvatar: form.value.authorAvatar,
        tags,
        season: form.value.season,
        aspect: form.value.aspect,
      }
    }
  } else {
    allLooks.value.unshift({
      id: String(Date.now()),
      title: form.value.title,
      description: form.value.description,
      image: form.value.image || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
      author: form.value.author,
      authorAvatar: form.value.authorAvatar || 'https://i.pravatar.cc/80?img=1',
      tags,
      likes: 0,
      season: form.value.season,
      aspect: form.value.aspect,
    })
  }
  showForm.value = false
}

function deleteLook(id: string) {
  allLooks.value = allLooks.value.filter((l) => l.id !== id)
  confirmDelete.value = null
}

function closeForm() {
  showForm.value = false
  editingLook.value = null
}
</script>

<template>
  <div class="p-8 lg:p-12">
    <!-- Header -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-light" style="font-family: var(--font-display)">Looks</h1>
        <p class="mt-2 text-sm" style="color: var(--color-text-secondary)">
          Gestiona los looks del lookbook. {{ allLooks.length }} looks en total.
        </p>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-wider transition-all duration-200 cursor-pointer btn-primary"
      >
        <Plus :size="15" />
        Nuevo Look
      </button>
    </div>

    <!-- Search -->
    <div class="mb-6 flex items-center gap-3">
      <div
        class="flex flex-1 items-center gap-3 border px-4 py-2.5"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
      >
        <Search :size="16" style="color: var(--color-text-muted)" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título, autor o tags..."
          class="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="cursor-pointer transition-opacity hover:opacity-60"
        >
          <X :size="14" style="color: var(--color-text-muted)" />
        </button>
      </div>
    </div>

    <!-- Looks table -->
    <div
      class="overflow-hidden rounded-sm border"
      :style="{ borderColor: 'var(--color-border)' }"
    >
      <table class="w-full">
        <thead>
          <tr :style="{ backgroundColor: 'var(--color-bg-subtle)' }">
            <th class="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Look</th>
            <th class="hidden px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] md:table-cell" style="color: var(--color-text-muted)">Autor</th>
            <th class="hidden px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] lg:table-cell" style="color: var(--color-text-muted)">Tags</th>
            <th class="hidden px-6 py-3 text-center text-[10px] font-medium uppercase tracking-[0.15em] sm:table-cell" style="color: var(--color-text-muted)">Temporada</th>
            <th class="px-6 py-3 text-center text-[10px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Likes</th>
            <th class="px-6 py-3 text-right text-[10px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y" :style="{ '--tw-divide-color': 'var(--color-border)' } as any">
          <tr
            v-for="look in filteredLooks"
            :key="look.id"
            class="transition-colors duration-200 hover:bg-[var(--color-bg-subtle)]"
            :style="{ backgroundColor: 'var(--color-bg-elevated)' }"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-4">
                <img :src="look.image" :alt="look.title" class="h-12 w-12 rounded-sm object-cover" />
                <div>
                  <p class="text-sm font-medium">{{ look.title }}</p>
                  <p v-if="look.hotspots?.length" class="mt-0.5 text-[10px]" style="color: var(--color-accent-warm)">
                    {{ look.hotspots.length }} prendas etiquetadas
                  </p>
                </div>
              </div>
            </td>
            <td class="hidden px-6 py-4 md:table-cell">
              <div class="flex items-center gap-2">
                <img :src="look.authorAvatar" :alt="look.author" class="h-6 w-6 rounded-full object-cover" />
                <span class="text-sm" style="color: var(--color-text-secondary)">{{ look.author }}</span>
              </div>
            </td>
            <td class="hidden px-6 py-4 lg:table-cell">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tag in look.tags.slice(0, 3)"
                  :key="tag"
                  class="border px-2 py-0.5 text-[9px] uppercase tracking-wider"
                  :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }"
                >
                  {{ tag }}
                </span>
              </div>
            </td>
            <td class="hidden px-6 py-4 text-center sm:table-cell">
              <span
                class="inline-block px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                :style="{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }"
              >
                {{ look.season }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex items-center justify-center gap-1">
                <Heart :size="12" style="color: var(--color-error)" />
                <span class="text-sm">{{ look.likes }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="openEdit(look)"
                  class="flex h-8 w-8 items-center justify-center rounded transition-all duration-200 cursor-pointer hover:bg-[var(--color-bg-subtle)]"
                  title="Editar"
                >
                  <Edit3 :size="14" style="color: var(--color-text-secondary)" />
                </button>
                <button
                  v-if="confirmDelete !== look.id"
                  @click="confirmDelete = look.id"
                  class="flex h-8 w-8 items-center justify-center rounded transition-all duration-200 cursor-pointer hover:bg-red-50"
                  title="Eliminar"
                >
                  <Trash2 :size="14" style="color: var(--color-error)" />
                </button>
                <div v-else class="flex items-center gap-1">
                  <button
                    @click="deleteLook(look.id)"
                    class="px-2 py-1 text-[10px] font-medium uppercase tracking-wider cursor-pointer btn-danger"
                  >
                    Sí
                  </button>
                  <button
                    @click="confirmDelete = null"
                    class="px-2 py-1 text-[10px] font-medium uppercase tracking-wider cursor-pointer btn-ghost"
                  >
                    No
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty state -->
      <div
        v-if="filteredLooks.length === 0"
        class="px-6 py-16 text-center"
        :style="{ backgroundColor: 'var(--color-bg-elevated)' }"
      >
        <Camera :size="40" class="mx-auto mb-4" style="color: var(--color-text-muted)" />
        <p class="text-sm" style="color: var(--color-text-muted)">No se encontraron looks</p>
      </div>
    </div>

    <!-- Form modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showForm"
          class="fixed inset-0 z-[100] flex items-center justify-center"
          @click.self="closeForm"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeForm" />
          <div
            class="relative z-10 mx-4 w-full max-w-2xl overflow-y-auto rounded-sm"
            style="background-color: var(--color-bg-elevated); max-height: 90vh"
          >
            <!-- Form header -->
            <div class="flex items-center justify-between border-b px-8 py-5" :style="{ borderColor: 'var(--color-border)' }">
              <h2 class="text-lg font-medium" style="font-family: var(--font-heading)">
                {{ editingLook ? 'Editar Look' : 'Nuevo Look' }}
              </h2>
              <button @click="closeForm" class="cursor-pointer transition-opacity hover:opacity-60">
                <X :size="20" />
              </button>
            </div>

            <!-- Form body -->
            <div class="space-y-5 px-8 py-6">
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Título</label>
                <input
                  v-model="form.title"
                  type="text"
                  class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                  :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                  placeholder="Nombre del look"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Descripción</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full resize-none border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                  :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                  placeholder="Descripción del look"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">URL de imagen</label>
                <input
                  v-model="form.image"
                  type="url"
                  class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                  :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                  placeholder="https://..."
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Autor</label>
                  <input
                    v-model="form.author"
                    type="text"
                    class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                    :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                    placeholder="Nombre del autor"
                  />
                </div>
                <div>
                  <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Avatar URL</label>
                  <input
                    v-model="form.authorAvatar"
                    type="url"
                    class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                    :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                    placeholder="https://i.pravatar.cc/80?img=1"
                  />
                </div>
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Tags (separados por coma)</label>
                <input
                  v-model="form.tags"
                  type="text"
                  class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                  :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                  placeholder="minimal, noir, streetwear"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Temporada</label>
                  <select
                    v-model="form.season"
                    class="w-full border px-4 py-2.5 text-sm outline-none cursor-pointer transition-colors focus:border-[var(--color-accent)]"
                    :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                  >
                    <option value="SS26">SS26</option>
                    <option value="AW25">AW25</option>
                    <option value="SS25">SS25</option>
                    <option value="AW24">AW24</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Aspecto</label>
                  <select
                    v-model="form.aspect"
                    class="w-full border px-4 py-2.5 text-sm outline-none cursor-pointer transition-colors focus:border-[var(--color-accent)]"
                    :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                  >
                    <option value="tall">Vertical (3:4)</option>
                    <option value="wide">Horizontal (4:3)</option>
                    <option value="square">Cuadrado (1:1)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Form footer -->
            <div class="flex items-center justify-end gap-3 border-t px-8 py-5" :style="{ borderColor: 'var(--color-border)' }">
              <button
                @click="closeForm"
                class="px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer btn-outline"
              >
                Cancelar
              </button>
              <button
                @click="saveLook"
                :disabled="!form.title"
                class="px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {{ editingLook ? 'Guardar cambios' : 'Crear look' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active {
  animation: fadeIn 0.25s ease-out;
}
.modal-enter-active > div:nth-child(2) {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-leave-active {
  animation: fadeIn 0.2s ease-in reverse;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
