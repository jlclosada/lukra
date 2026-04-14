<script setup lang="ts">
import { api } from '@/services/api'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface PartnerBrand {
  id: string
  name: string
  logo_url: string | null
  website: string | null
}

const config = useSiteConfigStore()
const brands = ref<PartnerBrand[]>([])

const repeatedBrands = computed(() => {
  if (brands.value.length === 0) return []
  const minItems = Math.max(8, Math.ceil(12 / brands.value.length))
  const result: (PartnerBrand & { _key: string })[] = []
  for (let i = 0; i < minItems; i++) {
    for (const b of brands.value) {
      result.push({ ...b, _key: `${b.id}-${i}` })
    }
  }
  return result
})

/* ---------- JS-driven animation + drag ---------- */
const trackRef = ref<HTMLElement | null>(null)
let offset = 0
let speed = 0.5 // px per frame
let hovering = false
let isDragging = false
let dragStartX = 0
let dragStartOffset = 0
let hasDragged = false
let rafId = 0

function getHalfWidth() {
  if (!trackRef.value) return 1
  return trackRef.value.scrollWidth / 2
}

function wrapOffset() {
  const half = getHalfWidth()
  if (offset <= -half) offset += half
  if (offset > 0) offset -= half
}

function tick() {
  if (!isDragging && !hovering) {
    offset -= speed
    wrapOffset()
  }
  if (trackRef.value) {
    trackRef.value.style.transform = `translateX(${offset}px)`
  }
  rafId = requestAnimationFrame(tick)
}

/* Mouse drag */
function onPointerDown(e: PointerEvent) {
  isDragging = true
  hasDragged = false
  dragStartX = e.clientX
  dragStartOffset = offset
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
  if (!isDragging) return
  const dx = e.clientX - dragStartX
  if (Math.abs(dx) > 3) hasDragged = true
  offset = dragStartOffset + dx
  wrapOffset()
}
function onPointerUp(e: PointerEvent) {
  isDragging = false
  ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
}

/* Prevent link navigation after a drag */
function onLinkClick(e: MouseEvent) {
  if (hasDragged) {
    e.preventDefault()
    e.stopPropagation()
  }
}

/* Hover pause */
function onEnter() { hovering = true }
function onLeave() { hovering = false; isDragging = false }

async function fetchPartnerBrands() {
  try {
    const data = await api<{ items: PartnerBrand[] }>('/brands/', { params: { partner: true, per_page: 100 } })
    brands.value = data.items
  } catch {
    brands.value = config.brands.map((b, i) => ({ id: String(i), name: b.name, logo_url: null, website: null }))
  }
}

onMounted(() => {
  fetchPartnerBrands()
  rafId = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(rafId))
</script>

<template>
  <section v-if="brands.length > 0" class="py-12 border-t border-b" :style="{ borderColor: 'var(--color-border)' }">
    <div class="mb-8 text-center">
      <p class="text-[10px] font-semibold uppercase tracking-[0.4em]" style="color: var(--color-text-muted)">
        Nuestros socios
      </p>
    </div>

    <!-- Marquee container -->
    <div
      class="marquee-container relative overflow-hidden py-4"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
    >
      <!-- Fade edges -->
      <div class="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[var(--color-bg)] to-transparent" />
      <div class="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[var(--color-bg)] to-transparent" />

      <!-- Scrolling track -->
      <div ref="trackRef" class="marquee-track">
        <div class="marquee-half flex items-center">
          <a
            v-for="item in repeatedBrands"
            :key="'a-' + item._key"
            :href="item.website || '#'"
            :target="item.website ? '_blank' : undefined"
            :rel="item.website ? 'noopener noreferrer' : undefined"
            @click="onLinkClick"
            class="mx-10 flex shrink-0 items-center justify-center transition-all duration-300 hover:opacity-100 hover:scale-110"
            style="opacity: 0.45"
          >
            <img
              v-if="item.logo_url"
              :src="item.logo_url"
              :alt="item.name"
              class="h-12 w-auto max-w-[160px] object-contain drop-shadow-sm sm:h-14"
            />
            <span
              v-else
              class="text-2xl font-light tracking-[0.2em] whitespace-nowrap sm:text-3xl"
              style="font-family: var(--font-display); color: var(--color-text)"
            >
              {{ item.name }}
            </span>
          </a>
        </div>
        <div class="marquee-half flex items-center" aria-hidden="true">
          <a
            v-for="item in repeatedBrands"
            :key="'b-' + item._key"
            href="#"
            @click.prevent
            tabindex="-1"
            class="mx-10 flex shrink-0 items-center justify-center transition-all duration-300 hover:opacity-100 hover:scale-110"
            style="opacity: 0.45"
          >
            <img
              v-if="item.logo_url"
              :src="item.logo_url"
              :alt="item.name"
              class="h-12 w-auto max-w-[160px] object-contain drop-shadow-sm sm:h-14"
            />
            <span
              v-else
              class="text-2xl font-light tracking-[0.2em] whitespace-nowrap sm:text-3xl"
              style="font-family: var(--font-display); color: var(--color-text)"
            >
              {{ item.name }}
            </span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.marquee-container {
  cursor: grab;
  user-select: none;
  touch-action: pan-y;
}
.marquee-container:active {
  cursor: grabbing;
}

.marquee-track {
  display: flex;
  width: max-content;
  will-change: transform;
}

.marquee-half {
  flex-shrink: 0;
}
</style>
