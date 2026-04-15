<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import type { Look, ProductHotspot } from '@/stores/looks';
import { useUserActivityStore } from '@/stores/userActivity';
import { ArrowRight, Bookmark, ExternalLink, Heart, Share2, ShoppingBag, Sparkles, X } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const activity = useUserActivityStore()
const auth = useAuthStore()

const props = defineProps<{
  look: Look | null
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const activeHotspot = ref<ProductHotspot | null>(null)
const hoveredHotspot = ref<ProductHotspot | null>(null)
const imageLoaded = ref(false)
const showPanel = ref(false)
let hoverTimeout: ReturnType<typeof setTimeout> | null = null

const hasHotspots = computed(() => (props.look?.hotspots?.length ?? 0) > 0)
const displayedHotspot = computed(() => hoveredHotspot.value || activeHotspot.value)

function selectHotspot(hotspot: ProductHotspot) {
  activeHotspot.value = activeHotspot.value?.id === hotspot.id ? null : hotspot
}

function hoverHotspot(hotspot: ProductHotspot) {
  if (hoverTimeout) { clearTimeout(hoverTimeout); hoverTimeout = null }
  hoveredHotspot.value = hotspot
}

function leaveHotspot() {
  hoverTimeout = setTimeout(() => {
    hoveredHotspot.value = null
  }, 400)
}

function enterTooltip() {
  if (hoverTimeout) { clearTimeout(hoverTimeout); hoverTimeout = null }
}

function leaveTooltip() {
  hoverTimeout = setTimeout(() => {
    hoveredHotspot.value = null
  }, 300)
}

function closeModal() {
  activeHotspot.value = null
  hoveredHotspot.value = null
  imageLoaded.value = false
  showPanel.value = false
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal()
}

function formatPrice(price: number, currency: string) {
  return `${price.toFixed(2).replace('.', ',')} ${currency}`
}

function tooltipPosition(hotspot: ProductHotspot) {
  const x = Math.min(Math.max(hotspot.x, 15), 85)
  const above = hotspot.y > 60
  return {
    left: `${x}%`,
    top: above ? `${hotspot.y - 3}%` : `${hotspot.y + 3}%`,
    transform: above ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)',
  }
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => (showPanel.value = true), 300)
    } else {
      document.body.style.overflow = ''
      activeHotspot.value = null
      hoveredHotspot.value = null
      showPanel.value = false
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible && look"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8"
        @click.self="closeModal"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/85 backdrop-blur-md" @click="closeModal" />

        <!-- Modal content -->
        <div
          class="relative z-10 flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden shadow-2xl lg:flex-row"
          style="background-color: var(--color-bg-elevated); border-radius: 2px"
        >
          <!-- Close button -->
          <button
            @click="closeModal"
            class="absolute right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-all duration-300 hover:text-white hover:bg-white/20 hover:scale-110 cursor-pointer"
            style="backdrop-filter: blur(12px); background: rgba(0,0,0,0.3)"
          >
            <X :size="18" :stroke-width="1.5" />
          </button>

          <!-- Image Side -->
          <div class="relative flex-1 min-h-[350px] lg:min-h-0 overflow-hidden">
            <div class="relative h-full max-h-[55vh] lg:max-h-[94vh]">
              <img
                :src="look.image"
                :alt="look.title"
                class="h-full w-full object-cover transition-all duration-700"
                :class="imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'"
                @load="imageLoaded = true"
              />

              <!-- Cinematic gradient overlays -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 pointer-events-none lg:block hidden" />

              <!-- Loading skeleton -->
              <div v-if="!imageLoaded" class="absolute inset-0 skeleton" />

              <!-- Hotspot count badge -->
              <div
                v-if="hasHotspots && imageLoaded"
                class="absolute left-5 top-5 flex items-center gap-2 rounded-full px-4 py-2 text-white/90"
                style="backdrop-filter: blur(16px); background: rgba(0,0,0,0.35)"
              >
                <ShoppingBag :size="13" :stroke-width="1.5" />
                <span class="text-[11px] font-medium tracking-wide">
                  {{ look.hotspots!.length }} {{ look.hotspots!.length === 1 ? 'prenda' : 'prendas' }}
                </span>
              </div>

              <!-- Hotspot Dots -->
              <template v-if="hasHotspots && imageLoaded">
                <button
                  v-for="hotspot in look.hotspots"
                  :key="hotspot.id"
                  class="group/dot absolute z-20 flex h-8 w-8 cursor-pointer items-center justify-center transition-all duration-300"
                  :class="{
                    'scale-125': activeHotspot?.id === hotspot.id || hoveredHotspot?.id === hotspot.id,
                  }"
                  :style="{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)' }"
                  @click.stop="selectHotspot(hotspot)"
                  @mouseenter="hoverHotspot(hotspot)"
                  @mouseleave="leaveHotspot"
                >
                  <!-- Pulse rings -->
                  <span
                    v-if="activeHotspot?.id !== hotspot.id && hoveredHotspot?.id !== hotspot.id"
                    class="absolute inset-0 rounded-full border border-white/30 animate-[hotspotPulse_2.5s_ease-out_infinite]"
                  />
                  <span
                    v-if="activeHotspot?.id !== hotspot.id && hoveredHotspot?.id !== hotspot.id"
                    class="absolute inset-0 rounded-full border border-white/20 animate-[hotspotPulse_2.5s_ease-out_0.8s_infinite]"
                  />
                  <!-- Dot -->
                  <span
                    class="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] transition-all duration-300 shadow-lg"
                    :class="
                      activeHotspot?.id === hotspot.id || hoveredHotspot?.id === hotspot.id
                        ? 'bg-white border-white scale-110'
                        : 'bg-white/90 border-white/70 group-hover/dot:bg-white group-hover/dot:border-white'
                    "
                    style="box-shadow: 0 2px 12px rgba(0,0,0,0.3)"
                  >
                    <span
                      class="h-[5px] w-[5px] rounded-full transition-colors duration-200"
                      :class="activeHotspot?.id === hotspot.id || hoveredHotspot?.id === hotspot.id ? 'bg-black' : 'bg-black/60'"
                    />
                  </span>
                </button>
              </template>

              <!-- Hover Tooltip -->
              <Transition name="tooltip">
                <div
                  v-if="displayedHotspot"
                  class="absolute z-30"
                  :style="tooltipPosition(displayedHotspot)"
                  @mouseenter="enterTooltip"
                  @mouseleave="leaveTooltip"
                >
                  <div
                    class="relative min-w-[260px] max-w-[300px] overflow-hidden shadow-2xl"
                    style="background: rgba(255,255,255,0.98); backdrop-filter: blur(20px); border-radius: 4px"
                  >
                    <!-- Accent top bar -->
                    <div class="h-[3px] w-full" style="background: linear-gradient(90deg, var(--color-accent-warm), var(--color-accent-gold))" />
                    <div class="p-5">
                      <p class="text-[9px] font-semibold uppercase tracking-[0.25em]" style="color: var(--color-accent-warm)">
                        {{ displayedHotspot.brand }}
                      </p>
                      <p class="mt-1.5 text-sm font-medium text-gray-900 leading-snug">{{ displayedHotspot.name }}</p>
                      <div class="mt-3 flex items-center justify-between">
                        <p class="text-xl font-light text-gray-900" style="font-family: var(--font-display)">
                          {{ formatPrice(displayedHotspot.price, displayedHotspot.currency) }}
                        </p>
                      </div>
                      <a
                        v-if="displayedHotspot.productUrl"
                        :href="displayedHotspot.productUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="mt-3 flex items-center justify-center gap-2 w-full py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-80"
                        style="background-color: var(--color-accent); border-radius: 2px"
                        @click.stop
                      >
                        Ver producto <ExternalLink :size="11" />
                      </a>
                    </div>
                  </div>
                </div>
              </Transition>

              <!-- Bottom image info (mobile) -->
              <div v-if="imageLoaded" class="absolute inset-x-0 bottom-0 p-6 lg:hidden">
                <span
                  class="inline-block px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-white/80"
                  style="backdrop-filter: blur(8px); background: rgba(255,255,255,0.15)"
                >
                  {{ look.season }}
                </span>
                <h2
                  class="mt-3 text-2xl font-light text-white"
                  style="font-family: var(--font-display); text-shadow: 0 2px 20px rgba(0,0,0,0.3)"
                >
                  {{ look.title }}
                </h2>
              </div>
            </div>
          </div>

          <!-- Info Panel -->
          <div
            class="flex w-full flex-col overflow-y-auto lg:w-[400px] lg:shrink-0 transition-all duration-500"
            :class="showPanel ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'"
          >
            <div class="flex-1 p-8 lg:p-10">
              <span
                class="hidden lg:inline-block mb-2 text-[9px] font-semibold uppercase tracking-[0.3em]"
                style="color: var(--color-accent-warm)"
              >
                {{ look.season }}
              </span>

              <h2
                class="hidden lg:block text-3xl font-light leading-tight lg:text-[2.2rem]"
                style="font-family: var(--font-display); letter-spacing: -0.02em"
              >
                {{ look.title }}
              </h2>

              <p
                v-if="look.description"
                class="mt-5 text-[13px] leading-[1.8]"
                style="color: var(--color-text-secondary)"
              >
                {{ look.description }}
              </p>

              <!-- Author -->
              <div class="mt-7 flex items-center gap-3.5">
                <img
                  :src="look.authorAvatar"
                  :alt="look.author"
                  class="h-11 w-11 rounded-full object-cover ring-2 ring-offset-2"
                  style="--tw-ring-color: var(--color-border); --tw-ring-offset-color: var(--color-bg-elevated)"
                />
                <div>
                  <p class="text-sm font-medium">{{ look.author }}</p>
                  <p class="text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Estilista</p>
                </div>
              </div>

              <!-- Tags -->
              <div class="mt-7 flex flex-wrap gap-2">
                <span
                  v-for="tag in look.tags"
                  :key="tag"
                  class="border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] cursor-pointer transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-subtle)]"
                  :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }"
                >
                  #{{ tag }}
                </span>
              </div>

              <!-- Actions -->
              <div v-if="auth.isAuthenticated" class="mt-7 flex items-center gap-4 border-t border-b py-5" :style="{ borderColor: 'var(--color-border)' }">
                <button
                  @click="activity.toggleLike(look.id, 'look')"
                  class="flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200 cursor-pointer group border"
                  :style="{
                    color: activity.isLiked(look.id, 'look') ? 'var(--color-error)' : 'var(--color-text-secondary)',
                    borderColor: activity.isLiked(look.id, 'look') ? 'var(--color-error)' : 'var(--color-border)',
                  }"
                >
                  <Heart :size="16" :fill="activity.isLiked(look.id, 'look') ? 'currentColor' : 'none'" class="transition-transform group-hover:scale-110" />
                  <span class="text-xs font-medium">{{ look.likes }}</span>
                </button>
                <button
                  @click="activity.toggleSave(look.id, 'look')"
                  class="flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200 cursor-pointer group border"
                  :style="{
                    color: activity.isSaved(look.id, 'look') ? 'var(--color-accent-warm)' : 'var(--color-text-secondary)',
                    borderColor: activity.isSaved(look.id, 'look') ? 'var(--color-accent-warm)' : 'var(--color-border)',
                  }"
                >
                  <Bookmark :size="16" :fill="activity.isSaved(look.id, 'look') ? 'currentColor' : 'none'" class="transition-transform group-hover:scale-110" />
                  <span class="text-xs font-medium">{{ activity.isSaved(look.id, 'look') ? 'Guardado' : 'Guardar' }}</span>
                </button>
                <button
                  class="flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200 hover:opacity-60 cursor-pointer border"
                  :style="{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }"
                >
                  <Share2 :size="16" />
                  <span class="text-xs font-medium">Compartir</span>
                </button>
              </div>

              <!-- Product List -->
              <div v-if="hasHotspots" class="mt-7">
                <div class="mb-5 flex items-center gap-2">
                  <Sparkles :size="14" style="color: var(--color-accent-gold)" />
                  <p class="text-[10px] font-semibold uppercase tracking-[0.3em]" style="color: var(--color-text-muted)">
                    Prendas del look
                  </p>
                </div>

                <div class="space-y-0">
                  <button
                    v-for="(hotspot, idx) in look.hotspots"
                    :key="hotspot.id"
                    class="flex w-full items-center gap-4 py-4 text-left transition-all duration-200 cursor-pointer group/item"
                    :class="[
                      idx > 0 ? 'border-t' : '',
                      activeHotspot?.id === hotspot.id || hoveredHotspot?.id === hotspot.id
                        ? 'bg-[var(--color-bg-subtle)] -mx-4 px-4'
                        : 'hover:bg-[var(--color-bg-subtle)] hover:-mx-2 hover:px-2',
                    ]"
                    :style="{ borderColor: 'var(--color-border)' }"
                    @click="selectHotspot(hotspot)"
                    @mouseenter="hoverHotspot(hotspot)"
                    @mouseleave="leaveHotspot"
                  >
                    <div
                      class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-200"
                      :class="
                        activeHotspot?.id === hotspot.id || hoveredHotspot?.id === hotspot.id
                          ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                          : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
                      "
                    >
                      {{ idx + 1 }}
                    </div>

                    <div class="flex-1 min-w-0">
                      <p class="text-[9px] font-semibold uppercase tracking-[0.2em] transition-colors" style="color: var(--color-accent-warm)">
                        {{ hotspot.brand }}
                      </p>
                      <p class="mt-0.5 text-sm font-medium truncate">{{ hotspot.name }}</p>
                    </div>

                    <div class="shrink-0 text-right">
                      <p class="text-sm font-medium" style="font-family: var(--font-display); color: var(--color-text)">
                        {{ formatPrice(hotspot.price, hotspot.currency) }}
                      </p>
                      <a
                        v-if="hotspot.productUrl"
                        :href="hotspot.productUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider transition-all duration-200 opacity-0 group-hover/item:opacity-100"
                        style="color: var(--color-accent-warm)"
                        @click.stop
                      >
                        Ver <ArrowRight :size="9" />
                      </a>
                    </div>
                  </button>
                </div>

                <!-- Total -->
                <div
                  class="mt-5 flex items-center justify-between border-t pt-5"
                  :style="{ borderColor: 'var(--color-border)' }"
                >
                  <span class="text-[10px] font-semibold uppercase tracking-[0.2em]" style="color: var(--color-text-muted)">
                    Total look
                  </span>
                  <span class="text-base font-medium" style="font-family: var(--font-display)">
                    {{ formatPrice(look.hotspots!.reduce((acc, h) => acc + h.price, 0), '€') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active {
  animation: fadeIn 0.35s ease-out;
}
.modal-enter-active > div:first-child {
  animation: fadeIn 0.35s ease-out;
}
.modal-enter-active > div:nth-child(2) {
  animation: modalSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-leave-active {
  animation: fadeIn 0.25s ease-in reverse;
}

.tooltip-enter-active {
  animation: tooltipIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.tooltip-leave-active {
  animation: fadeIn 0.12s ease-in reverse;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes tooltipIn {
  from {
    opacity: 0;
    transform: translate(-50%, 0%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0%) scale(1);
  }
}

@keyframes hotspotPulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}
</style>
