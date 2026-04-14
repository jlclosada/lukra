<script setup lang="ts">
import { api } from '@/services/api'
import { Edit3, Globe, ImagePlus, Plus, Search, Trash2, X } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

interface Brand {
  id: string
  name: string
  logo_url: string | null
  website: string | null
  description: string | null
  is_partner: boolean
  created_at: string
  updated_at: string
}

const brands = ref<Brand[]>([])
const loading = ref(false)
const searchQuery = ref('')
const showForm = ref(false)
const editingBrand = ref<Brand | null>(null)
const confirmDelete = ref<string | null>(null)

// Logo upload
const logoMode = ref<'url' | 'upload'>('url')
const logoFileInput = ref<HTMLInputElement | null>(null)
const logoPreview = ref<string | null>(null)

const form = ref({
  name: '',
  logo_url: '',
  website: '',
  description: '',
  is_partner: false,
})

const filteredBrands = computed(() => {
  if (!searchQuery.value) return brands.value
  const q = searchQuery.value.toLowerCase()
  return brands.value.filter(b => b.name.toLowerCase().includes(q))
})

async function fetchBrands() {
  loading.value = true
  try {
    const data = await api<{ items: Brand[]; total: number }>('/brands/', { params: { per_page: 100 } })
    brands.value = data.items
  } catch {
    brands.value = []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingBrand.value = null
  form.value = { name: '', logo_url: '', website: '', description: '', is_partner: false }
  logoPreview.value = null
  logoMode.value = 'url'
  showForm.value = true
}

function openEdit(brand: Brand) {
  editingBrand.value = brand
  form.value = {
    name: brand.name,
    logo_url: brand.logo_url || '',
    website: brand.website || '',
    description: brand.description || '',
    is_partner: brand.is_partner,
  }
  logoPreview.value = null
  logoMode.value = brand.logo_url?.startsWith('data:') ? 'upload' : 'url'
  showForm.value = true
}

function onLogoFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const result = ev.target?.result as string
    logoPreview.value = result
    form.value.logo_url = result
  }
  reader.readAsDataURL(file)
}

function triggerLogoFileInput() { logoFileInput.value?.click() }

function onLogoDrop(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const result = ev.target?.result as string
    logoPreview.value = result
    form.value.logo_url = result
  }
  reader.readAsDataURL(file)
}

function removeLogo() {
  logoPreview.value = null
  form.value.logo_url = ''
  if (logoFileInput.value) logoFileInput.value.value = ''
}

async function saveBrand() {
  const body: Record<string, string | boolean | null> = {
    name: form.value.name,
    logo_url: form.value.logo_url || null,
    website: form.value.website || null,
    description: form.value.description || null,
    is_partner: form.value.is_partner,
  }

  try {
    if (editingBrand.value) {
      await api(`/brands/${editingBrand.value.id}`, { method: 'PATCH', body })
    } else {
      await api('/brands/', { method: 'POST', body })
    }
    showForm.value = false
    await fetchBrands()
  } catch (e: any) {
    const detail = e?.data?.detail || e?.message || 'Error al guardar'
    alert(detail)
  }
}

async function deleteBrand(id: string) {
  try {
    await api(`/brands/${id}`, { method: 'DELETE' })
    confirmDelete.value = null
    await fetchBrands()
  } catch (e: any) {
    alert(e?.data?.detail || 'Error al eliminar')
  }
}

onMounted(fetchBrands)
</script>

<template>
  <div class="p-8 lg:p-12">
    <!-- Header -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-light" style="font-family: var(--font-display)">Marcas</h1>
        <p class="mt-2 text-sm" style="color: var(--color-text-secondary)">
          Gestiona las marcas registradas. {{ brands.length }} marcas en total.
        </p>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer btn-primary"
      >
        <Plus :size="15" />
        Nueva Marca
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
          placeholder="Buscar marcas..."
          class="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="cursor-pointer">
          <X :size="14" style="color: var(--color-text-muted)" />
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-16 text-center">
      <p class="text-sm" style="color: var(--color-text-muted)">Cargando marcas...</p>
    </div>

    <!-- Brands grid -->
    <div v-else-if="filteredBrands.length > 0" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="brand in filteredBrands"
        :key="brand.id"
        class="group border p-5 transition-all duration-200 hover:border-[var(--color-accent)]"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
      >
        <!-- Logo + name -->
        <div class="flex items-center gap-4 mb-3">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm"
            :style="{ backgroundColor: 'var(--color-bg-subtle)' }"
          >
            <img
              v-if="brand.logo_url"
              :src="brand.logo_url"
              :alt="brand.name"
              class="h-full w-full object-contain p-1"
            />
            <span v-else class="text-lg font-bold" style="color: var(--color-text-muted)">
              {{ brand.name.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-medium truncate">{{ brand.name }}</h3>
              <span
                v-if="brand.is_partner"
                class="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                :style="{ backgroundColor: 'color-mix(in srgb, var(--color-accent-gold) 18%, transparent)', color: 'var(--color-accent-gold)' }"
              >
                Socio
              </span>
            </div>
            <a
              v-if="brand.website"
              :href="brand.website"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-[10px] transition-opacity hover:opacity-60"
              style="color: var(--color-accent)"
              @click.stop
            >
              <Globe :size="10" /> Web
            </a>
          </div>
        </div>

        <!-- Description -->
        <p
          v-if="brand.description"
          class="text-xs line-clamp-2 mb-4"
          style="color: var(--color-text-muted)"
        >
          {{ brand.description }}
        </p>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-1 border-t pt-3" :style="{ borderColor: 'var(--color-border)' }">
          <button
            @click="openEdit(brand)"
            class="flex h-8 w-8 items-center justify-center rounded cursor-pointer transition-all hover:bg-[var(--color-bg-subtle)]"
            title="Editar"
          >
            <Edit3 :size="14" style="color: var(--color-text-secondary)" />
          </button>
          <button
            v-if="confirmDelete !== brand.id"
            @click="confirmDelete = brand.id"
            class="flex h-8 w-8 items-center justify-center rounded cursor-pointer transition-all hover:bg-red-50"
            title="Eliminar"
          >
            <Trash2 :size="14" style="color: var(--color-error)" />
          </button>
          <div v-else class="flex items-center gap-1">
            <button @click="deleteBrand(brand.id)" class="px-2 py-1 text-[10px] font-medium uppercase cursor-pointer btn-danger">Sí</button>
            <button @click="confirmDelete = null" class="px-2 py-1 text-[10px] font-medium uppercase cursor-pointer btn-ghost">No</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="py-16 text-center" :style="{ backgroundColor: 'var(--color-bg-elevated)' }">
      <ImagePlus :size="40" class="mx-auto mb-4" style="color: var(--color-text-muted)" />
      <p class="text-sm" style="color: var(--color-text-muted)">No hay marcas registradas</p>
      <button @click="openCreate" class="mt-4 text-xs underline cursor-pointer" style="color: var(--color-accent)">
        Crear la primera marca
      </button>
    </div>

    <!-- Form modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showForm"
          class="fixed inset-0 z-[100] flex items-center justify-center"
          @click.self="showForm = false"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showForm = false" />
          <div
            class="relative z-10 mx-4 w-full max-w-lg overflow-y-auto rounded-sm"
            style="background-color: var(--color-bg-elevated); max-height: 90vh"
          >
            <!-- Header -->
            <div class="flex items-center justify-between border-b px-8 py-5" :style="{ borderColor: 'var(--color-border)' }">
              <h2 class="text-lg font-medium" style="font-family: var(--font-heading)">
                {{ editingBrand ? 'Editar Marca' : 'Nueva Marca' }}
              </h2>
              <button @click="showForm = false" class="cursor-pointer transition-opacity hover:opacity-60">
                <X :size="20" />
              </button>
            </div>

            <!-- Body -->
            <div class="space-y-5 px-8 py-6">
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Nombre *</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                  :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                  placeholder="Ej: Zara, Balenciaga, Nike..."
                />
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Logotipo</label>
                <!-- Mode toggle -->
                <div class="mb-3 flex gap-0 border rounded-sm overflow-hidden" :style="{ borderColor: 'var(--color-border)' }">
                  <button
                    @click="logoMode = 'upload'"
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-wider cursor-pointer transition-all"
                    :style="{ backgroundColor: logoMode === 'upload' ? 'var(--color-accent)' : 'transparent', color: logoMode === 'upload' ? 'var(--color-bg)' : 'var(--color-text-muted)' }"
                  >
                    <Upload :size="13" /> Subir archivo
                  </button>
                  <button
                    @click="logoMode = 'url'"
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-wider cursor-pointer transition-all"
                    :style="{ backgroundColor: logoMode === 'url' ? 'var(--color-accent)' : 'transparent', color: logoMode === 'url' ? 'var(--color-bg)' : 'var(--color-text-muted)' }"
                  >
                    <ImagePlus :size="13" /> URL
                  </button>
                </div>
                <!-- Upload mode -->
                <div v-if="logoMode === 'upload'">
                  <input ref="logoFileInput" type="file" accept="image/*" class="hidden" @change="onLogoFileSelect" />
                  <div
                    v-if="!logoPreview && !form.logo_url"
                    class="relative flex flex-col items-center justify-center border-2 border-dashed rounded-sm px-6 py-8 cursor-pointer transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-subtle)]"
                    :style="{ borderColor: 'var(--color-border)' }"
                    @click="triggerLogoFileInput"
                    @dragover.prevent
                    @drop="onLogoDrop"
                  >
                    <Upload :size="24" style="color: var(--color-text-muted)" />
                    <p class="mt-2 text-xs" style="color: var(--color-text-secondary)">Haz clic o arrastra el logotipo</p>
                    <p class="mt-1 text-[10px]" style="color: var(--color-text-muted)">PNG, SVG, JPG — fondo transparente recomendado</p>
                  </div>
                  <div v-else class="relative inline-block">
                    <img :src="logoPreview || form.logo_url" class="h-16 w-auto max-w-[200px] rounded-sm object-contain p-2" :style="{ backgroundColor: 'var(--color-bg-subtle)' }" />
                    <button @click="removeLogo" class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white cursor-pointer hover:bg-black/80">
                      <X :size="10" />
                    </button>
                  </div>
                </div>
                <!-- URL mode -->
                <div v-else>
                  <input
                    v-model="form.logo_url"
                    type="text"
                    class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                    :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                    placeholder="https://ejemplo.com/logo.png"
                  />
                  <div v-if="form.logo_url && !form.logo_url.startsWith('data:')" class="mt-2 flex items-center gap-3">
                    <img :src="form.logo_url" class="h-10 w-auto max-w-[120px] rounded-sm object-contain p-1" :style="{ backgroundColor: 'var(--color-bg-subtle)' }" @error="($event.target as HTMLImageElement).style.display='none'" />
                    <span class="text-[10px]" style="color: var(--color-text-muted)">Vista previa</span>
                  </div>
                </div>
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Sitio web</label>
                <input
                  v-model="form.website"
                  type="url"
                  class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                  :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                  placeholder="https://www.marca.com"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Descripción</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full resize-none border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                  :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
                  placeholder="Breve descripción de la marca"
                />
              </div>
              <div class="flex items-center gap-3 border rounded-sm px-4 py-3" :style="{ borderColor: form.is_partner ? 'var(--color-accent-gold)' : 'var(--color-border)', backgroundColor: form.is_partner ? 'color-mix(in srgb, var(--color-accent-gold) 5%, transparent)' : 'transparent' }">
                <label class="relative inline-flex cursor-pointer items-center">
                  <input v-model="form.is_partner" type="checkbox" class="peer sr-only" />
                  <div class="h-5 w-9 rounded-full border transition-all peer-checked:bg-[var(--color-accent-gold)] peer-checked:border-[var(--color-accent-gold)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: form.is_partner ? '' : 'var(--color-bg-subtle)' }">
                    <div class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" :class="form.is_partner ? 'translate-x-4' : ''" />
                  </div>
                </label>
                <div>
                  <p class="text-sm font-medium">Marca socia</p>
                  <p class="text-[10px]" style="color: var(--color-text-muted)">Aparece en el carrusel de socios en la página principal</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3 border-t px-8 py-5" :style="{ borderColor: 'var(--color-border)' }">
              <button
                @click="showForm = false"
                class="px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer btn-outline"
              >
                Cancelar
              </button>
              <button
                @click="saveBrand"
                :disabled="!form.name.trim()"
                class="px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {{ editingBrand ? 'Guardar' : 'Crear marca' }}
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
