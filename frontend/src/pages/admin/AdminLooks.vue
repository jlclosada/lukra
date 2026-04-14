<script setup lang="ts">
import type { Look } from '@/data/mock'
import { looks as mockLooks } from '@/data/mock'
import { Camera, Edit3, Heart, ImagePlus, Plus, Search, Trash2, Upload, X } from 'lucide-vue-next'
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

// Image upload
const imageMode = ref<'url' | 'upload'>('url')
const imagePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return
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

// Hotspot editor
const showHotspotEditor = ref(false)
const hotspotEditorLook = ref<Look | null>(null)
const editingHotspots = ref<ProductHotspot[]>([])
const selectedHotspotId = ref<string | null>(null)
const hotspotImageRef = ref<HTMLImageElement | null>(null)
const hotspotForm = ref({ name: '', brand: '', price: 0, currency: '€', productUrl: '' })

function openHotspotEditor(look: Look) {
  hotspotEditorLook.value = look
  editingHotspots.value = [...(look.hotspots || []).map(h => ({ ...h }))]
  selectedHotspotId.value = null
  showHotspotEditor.value = true
}

function onImageClick(e: MouseEvent) {
  const img = hotspotImageRef.value
  if (!img) return
  const rect = img.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  const newHotspot: ProductHotspot = {
    id: `h-${Date.now()}`,
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    name: 'Nueva prenda',
    brand: 'Marca',
    price: 0,
    currency: '€',
    productUrl: '',
  }
  editingHotspots.value.push(newHotspot)
  selectHotspotForEdit(newHotspot.id)
}

function selectHotspotForEdit(id: string) {
  selectedHotspotId.value = id
  const h = editingHotspots.value.find(h => h.id === id)
  if (h) {
    hotspotForm.value = { name: h.name, brand: h.brand, price: h.price, currency: h.currency, productUrl: h.productUrl }
  }
}

function updateSelectedHotspot() {
  const h = editingHotspots.value.find(h => h.id === selectedHotspotId.value)
  if (h) {
    h.name = hotspotForm.value.name
    h.brand = hotspotForm.value.brand
    h.price = hotspotForm.value.price
    h.currency = hotspotForm.value.currency
    h.productUrl = hotspotForm.value.productUrl
  }
}

function removeHotspot(id: string) {
  editingHotspots.value = editingHotspots.value.filter(h => h.id !== id)
  if (selectedHotspotId.value === id) selectedHotspotId.value = null
}

let draggingHotspot: string | null = null

function startDrag(id: string, e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  draggingHotspot = id
  const onMove = (ev: MouseEvent) => {
    const img = hotspotImageRef.value
    if (!img || !draggingHotspot) return
    const rect = img.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((ev.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((ev.clientY - rect.top) / rect.height) * 100))
    const h = editingHotspots.value.find(h => h.id === draggingHotspot)
    if (h) {
      h.x = Math.round(x * 10) / 10
      h.y = Math.round(y * 10) / 10
    }
  }
  const onUp = () => {
    draggingHotspot = null
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function saveHotspots() {
  if (hotspotEditorLook.value) {
    const idx = allLooks.value.findIndex(l => l.id === hotspotEditorLook.value!.id)
    if (idx !== -1) {
      allLooks.value[idx] = { ...allLooks.value[idx], hotspots: [...editingHotspots.value] }
    }
  }
  showHotspotEditor.value = false
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
                  @click="openHotspotEditor(look)"
                  class="flex h-8 w-8 items-center justify-center rounded transition-all duration-200 cursor-pointer hover:bg-[var(--color-bg-subtle)]"
                  title="Editar hotspots"
                >
                  <MapPin :size="14" style="color: var(--color-accent-warm)" />
                </button>
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
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Imagen</label>

                <!-- Mode tabs -->
                <div class="mb-3 flex gap-0 border rounded-sm overflow-hidden" :style="{ borderColor: 'var(--color-border)' }">
                  <button
                    @click="imageMode = 'upload'"
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-wider cursor-pointer transition-all"
                    :style="{
                      backgroundColor: imageMode === 'upload' ? 'var(--color-accent)' : 'transparent',
                      color: imageMode === 'upload' ? 'var(--color-bg)' : 'var(--color-text-muted)',
                    }"
                  >
                    <Upload :size="13" /> Subir archivo
                  </button>
                  <button
                    @click="imageMode = 'url'"
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-wider cursor-pointer transition-all"
                    :style="{
                      backgroundColor: imageMode === 'url' ? 'var(--color-accent)' : 'transparent',
                      color: imageMode === 'url' ? 'var(--color-bg)' : 'var(--color-text-muted)',
                    }"
                  >
                    <ImagePlus :size="13" /> URL
                  </button>
                </div>

                <!-- Upload zone -->
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
                  <!-- Preview -->
                  <div v-else class="relative">
                    <img :src="imagePreview || form.image" class="w-full max-h-48 object-cover rounded-sm" />
                    <button
                      @click="removeImage"
                      class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white cursor-pointer hover:bg-black/70"
                    >
                      <X :size="14" />
                    </button>
                  </div>
                </div>

                <!-- URL input -->
                <div v-else>
                  <input
                    v-model="form.image"
                    type="url"
                    class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                    :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                    placeholder="https://..."
                  />
                  <div v-if="form.image" class="mt-2">
                    <img :src="form.image" class="w-full max-h-32 object-cover rounded-sm" @error="($event.target as HTMLImageElement).style.display='none'" />
                  </div>
                </div>
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

    <!-- Hotspot editor modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showHotspotEditor && hotspotEditorLook"
          class="fixed inset-0 z-[100] flex items-center justify-center"
          @click.self="showHotspotEditor = false"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showHotspotEditor = false" />
          <div
            class="relative z-10 mx-4 flex w-full max-w-5xl flex-col overflow-hidden rounded-sm lg:flex-row"
            style="background-color: var(--color-bg-elevated); max-height: 90vh"
          >
            <!-- Header -->
            <div class="absolute right-4 top-4 z-30">
              <button @click="showHotspotEditor = false" class="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white cursor-pointer hover:bg-black/60 backdrop-blur-sm">
                <X :size="18" />
              </button>
            </div>

            <!-- Image area -->
            <div class="relative flex-1 min-h-[300px]">
              <div class="relative h-full max-h-[50vh] lg:max-h-[90vh] overflow-hidden">
                <img
                  ref="hotspotImageRef"
                  :src="hotspotEditorLook.image"
                  :alt="hotspotEditorLook.title"
                  class="h-full w-full object-cover cursor-crosshair"
                  @click="onImageClick"
                />

                <!-- Instruction overlay -->
                <div class="absolute left-4 top-4 flex items-center gap-2 rounded-full px-4 py-2 text-white/90 text-xs" style="backdrop-filter: blur(12px); background: rgba(0,0,0,0.4)">
                  <MapPin :size="13" /> Haz clic para añadir. Arrastra para mover.
                </div>

                <!-- Hotspot dots (draggable) -->
                <div
                  v-for="(h, i) in editingHotspots"
                  :key="h.id"
                  class="absolute z-20 flex h-8 w-8 items-center justify-center cursor-grab active:cursor-grabbing transition-transform"
                  :class="selectedHotspotId === h.id ? 'scale-125' : 'hover:scale-110'"
                  :style="{ left: `${h.x}%`, top: `${h.y}%`, transform: 'translate(-50%, -50%)' }"
                  @mousedown="startDrag(h.id, $event)"
                  @click.stop="selectHotspotForEdit(h.id)"
                >
                  <span
                    class="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shadow-lg transition-all"
                    :class="selectedHotspotId === h.id ? 'bg-[var(--color-accent-warm)] text-white' : 'bg-white text-black border border-black/20'"
                  >
                    {{ i + 1 }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Hotspot list & form -->
            <div class="w-full lg:w-[360px] lg:shrink-0 overflow-y-auto border-l" :style="{ borderColor: 'var(--color-border)' }">
              <div class="p-6">
                <h3 class="text-lg font-medium mb-1" style="font-family: var(--font-heading)">Editor de Hotspots</h3>
                <p class="text-xs mb-6" style="color: var(--color-text-muted)">{{ hotspotEditorLook.title }} — {{ editingHotspots.length }} prendas</p>

                <!-- Hotspot list -->
                <div class="space-y-2 mb-6">
                  <div
                    v-for="(h, i) in editingHotspots"
                    :key="h.id"
                    class="flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-all"
                    :class="selectedHotspotId === h.id ? 'border-[var(--color-accent-warm)] bg-[var(--color-bg-subtle)]' : ''"
                    :style="selectedHotspotId !== h.id ? { borderColor: 'var(--color-border)' } : {}"
                    @click="selectHotspotForEdit(h.id)"
                  >
                    <span
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      :class="selectedHotspotId === h.id ? 'bg-[var(--color-accent-warm)] text-white' : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'"
                    >
                      {{ i + 1 }}
                    </span>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium truncate">{{ h.name }}</p>
                      <p class="text-[10px]" style="color: var(--color-text-muted)">{{ h.brand }} · ({{ h.x.toFixed(1) }}%, {{ h.y.toFixed(1) }}%)</p>
                    </div>
                    <button
                      @click.stop="removeHotspot(h.id)"
                      class="flex h-6 w-6 items-center justify-center rounded-full cursor-pointer hover:bg-red-50"
                    >
                      <Trash2 :size="12" style="color: var(--color-error)" />
                    </button>
                  </div>

                  <div v-if="editingHotspots.length === 0" class="py-8 text-center">
                    <MapPin :size="24" class="mx-auto mb-2" style="color: var(--color-text-muted)" />
                    <p class="text-xs" style="color: var(--color-text-muted)">Haz clic en la imagen para añadir prendas</p>
                  </div>
                </div>

                <!-- Edit selected hotspot form -->
                <div v-if="selectedHotspotId" class="border-t pt-5 space-y-3" :style="{ borderColor: 'var(--color-border)' }">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.15em]" style="color: var(--color-accent-warm)">Editar prenda</p>
                  <div>
                    <input v-model="hotspotForm.name" @input="updateSelectedHotspot" type="text" placeholder="Nombre de la prenda" class="w-full border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" />
                  </div>
                  <div>
                    <input v-model="hotspotForm.brand" @input="updateSelectedHotspot" type="text" placeholder="Marca" class="w-full border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <input v-model.number="hotspotForm.price" @input="updateSelectedHotspot" type="number" placeholder="Precio" class="w-full border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" />
                    <input v-model="hotspotForm.currency" @input="updateSelectedHotspot" type="text" placeholder="€" class="w-full border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" />
                  </div>
                  <div>
                    <input v-model="hotspotForm.productUrl" @input="updateSelectedHotspot" type="text" placeholder="URL del producto" class="w-full border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" />
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="sticky bottom-0 flex items-center justify-end gap-3 border-t px-6 py-4" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }">
                <button @click="showHotspotEditor = false" class="px-4 py-2 text-xs font-medium uppercase tracking-wider cursor-pointer btn-outline">Cancelar</button>
                <button @click="saveHotspots" class="px-4 py-2 text-xs font-medium uppercase tracking-wider cursor-pointer btn-primary">Guardar hotspots</button>
              </div>
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
