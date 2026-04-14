<script setup lang="ts">
import LookModal from '@/components/LookModal.vue'
import type { Look } from '@/data/mock'
import { useAuthStore } from '@/stores/auth'
import { useLooksStore } from '@/stores/looks'
import { useUserActivityStore } from '@/stores/userActivity'
import { Bookmark, Eye, Heart, Search, X } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const auth = useAuthStore()
const activity = useUserActivityStore()
const looksStore = useLooksStore()

const activeFilter = ref<string | null>(null)
const searchQuery = ref('')
const revealed = ref(false)
const selectedLook = ref<Look | null>(null)
const modalVisible = ref(false)
const showAllTags = ref(false)

const allTags = computed(() => looksStore.allTags)

const visibleTags = computed(() => {
  if (showAllTags.value) return allTags.value
  return allTags.value.slice(0, 6)
})

const filteredLooks = computed(() => {
  let result = looksStore.looks
  if (activeFilter.value) {
    result = result.filter((l) => l.tags.includes(activeFilter.value!))
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.author.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q)) ||
        l.season.toLowerCase().includes(q),
    )
  }
  return result
})

function toggleFilter(tag: string) {
  activeFilter.value = activeFilter.value === tag ? null : tag
}

function openLook(look: Look) {
  selectedLook.value = look
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  setTimeout(() => {
    selectedLook.value = null
  }, 300)
}

onMounted(() => {
  requestAnimationFrame(() => (revealed.value = true))
  // Auto-open look from route param
  const id = route.params.id as string | undefined
  if (id) {
    const look = looksStore.getById(id)
    if (look) openLook(look)
  }
})

// Watch for route changes (e.g. navigating between looks)
watch(() => route.params.id, (id) => {
  if (id) {
    const look = looksStore.getById(id as string)
    if (look) openLook(look)
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <section class="px-6 pb-12 pt-20 sm:px-12 lg:px-24">
      <div
        class="max-w-3xl transition-all duration-700"
        :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
      >
        <p class="text-xs font-medium uppercase tracking-[0.3em]" style="color: var(--color-text-muted)">Lookbook</p>
        <h1 class="mt-3 text-5xl font-light tracking-tight sm:text-6xl" style="font-family: var(--font-display)">Looks</h1>
        <p class="mt-4 max-w-xl text-base leading-relaxed" style="color: var(--color-text-secondary)">
          Inspiración visual curada por nuestra comunidad. Cada look cuenta una historia.
          <span class="text-xs italic" style="color: var(--color-text-muted)">Pulsa sobre un look para explorar las prendas.</span>
        </p>
      </div>
    </section>

    <!-- Search & Filters -->
    <section class="px-6 pb-8 sm:px-12 lg:px-24">
      <div
        class="transition-all duration-700 delay-200"
        :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <!-- Search bar -->
        <div
          class="flex items-center gap-3 border px-4 py-3 mb-5"
          :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
        >
          <Search :size="16" style="color: var(--color-text-muted)" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar looks, marcas, estilos..."
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

        <!-- Tag filters -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="tag in visibleTags"
            :key="tag"
            @click="toggleFilter(tag)"
            class="cursor-pointer px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            :style="{
              backgroundColor: activeFilter === tag ? 'var(--color-accent)' : 'transparent',
              color: activeFilter === tag ? 'var(--color-bg)' : 'var(--color-text-muted)',
              border: activeFilter === tag ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
            }"
          >
            {{ tag }}
          </button>
          <button
            v-if="allTags.length > 6 && !showAllTags"
            @click="showAllTags = true"
            class="cursor-pointer px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-all duration-200 hover:text-[var(--color-text)]"
            style="color: var(--color-text-muted); border: 1px dashed var(--color-border)"
          >
            +{{ allTags.length - 6 }} más
          </button>
          <button
            v-if="showAllTags && allTags.length > 6"
            @click="showAllTags = false"
            class="cursor-pointer px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-all duration-200 hover:text-[var(--color-text)]"
            style="color: var(--color-text-muted)"
          >
            Ver menos
          </button>
          <button
            v-if="activeFilter"
            @click="activeFilter = null"
            class="flex cursor-pointer items-center gap-1 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-all duration-200 hover:text-[var(--color-text)]"
            style="color: var(--color-text-muted)"
          >
            <X :size="12" /> Limpiar
          </button>
        </div>
      </div>
    </section>

    <!-- Masonry Gallery -->
    <section class="px-6 pb-24 sm:px-12 lg:px-24">
      <div class="columns-2 gap-4 space-y-4 sm:columns-3 lg:columns-4 xl:columns-5">
        <div
          v-for="(look, index) in filteredLooks"
          :key="look.id"
          class="group relative break-inside-avoid overflow-hidden transition-all duration-500"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'"
          :style="{ transitionDelay: `${300 + index * 60}ms` }"
        >
          <div
            class="relative cursor-pointer overflow-hidden"
            :class="{
              'aspect-[3/4]': look.aspect === 'tall',
              'aspect-[4/3]': look.aspect === 'wide',
              'aspect-square': look.aspect === 'square',
            }"
            @click="openLook(look)"
          >
            <img
              :src="look.image"
              :alt="look.title"
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />

            <!-- Hover overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <!-- Season badge -->
            <div
              class="absolute left-3 top-3 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white/80"
              style="background: rgba(0,0,0,0.3); backdrop-filter: blur(8px)"
            >
              {{ look.season }}
            </div>

            <!-- Hotspot indicator -->
            <div
              v-if="look.hotspots?.length"
              class="absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-medium uppercase tracking-wider text-white opacity-0 transition-all duration-400 group-hover:opacity-100"
              style="background: rgba(0,0,0,0.4); backdrop-filter: blur(8px)"
            >
              <Eye :size="11" />
              {{ look.hotspots.length }} prendas
            </div>

            <!-- Content on hover -->
            <div class="absolute inset-x-0 bottom-0 translate-y-4 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <h3 class="text-lg font-medium text-white" style="font-family: var(--font-heading)">{{ look.title }}</h3>
              <div class="mt-2 flex items-center gap-3">
                <div class="h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20 flex items-center justify-center text-[9px] font-medium" :style="{ backgroundColor: look.authorAvatar ? 'transparent' : 'rgba(255,255,255,0.15)', color: '#fff' }">
                  <img v-if="look.authorAvatar" :src="look.authorAvatar" :alt="look.author" class="h-full w-full object-cover" />
                  <span v-else>{{ look.author.charAt(0).toUpperCase() }}</span>
                </div>
                <span class="text-xs text-white/70">{{ look.author }}</span>
              </div>
              <div class="mt-3 flex flex-wrap gap-1.5">
                <span
                  v-for="tag in look.tags"
                  :key="tag"
                  class="px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/60"
                  style="background: rgba(255,255,255,0.1); backdrop-filter: blur(4px)"
                >
                  {{ tag }}
                </span>
              </div>
              <div class="mt-3 flex items-center gap-1.5">
                <Heart :size="13" class="text-white/70" />
                <span class="text-xs text-white/70">{{ look.likes }}</span>
              </div>
              <!-- Like / Save buttons -->
              <div v-if="auth.isAuthenticated" class="mt-3 flex items-center gap-3">
                <button
                  @click.stop="activity.toggleLike(look.id, 'look')"
                  class="flex items-center gap-1.5 text-xs transition-all duration-200 cursor-pointer"
                  :class="activity.isLiked(look.id, 'look') ? 'text-red-400' : 'text-white/70 hover:text-red-400'"
                >
                  <Heart :size="15" :fill="activity.isLiked(look.id, 'look') ? 'currentColor' : 'none'" />
                </button>
                <button
                  @click.stop="activity.toggleSave(look.id, 'look')"
                  class="flex items-center gap-1.5 text-xs transition-all duration-200 cursor-pointer"
                  :class="activity.isSaved(look.id, 'look') ? 'text-amber-400' : 'text-white/70 hover:text-amber-400'"
                >
                  <Bookmark :size="15" :fill="activity.isSaved(look.id, 'look') ? 'currentColor' : 'none'" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredLooks.length === 0" class="py-20 text-center">
        <p class="text-lg" style="color: var(--color-text-muted)">No hay looks con ese filtro.</p>
        <button
          @click="activeFilter = null"
          class="mt-4 cursor-pointer text-sm underline transition-opacity hover:opacity-60"
          style="color: var(--color-text-secondary)"
        >
          Ver todos
        </button>
      </div>
    </section>

    <!-- Look modal -->
    <LookModal :look="selectedLook" :visible="modalVisible" @close="closeModal" />
  </div>
</template>
