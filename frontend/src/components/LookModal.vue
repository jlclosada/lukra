<script setup lang="ts">
import type { Look, ProductHotspot } from '@/data/mock';
import { ArrowRight, ExternalLink, Heart, Share2, X } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  look: Look | null
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const activeHotspot = ref<ProductHotspot | null>(null)
const imageLoaded = ref(false)

const hasHotspots = computed(() => (props.look?.hotspots?.length ?? 0) > 0)

function selectHotspot(hotspot: ProductHotspot) {
  activeHotspot.value = activeHotspot.value?.id === hotspot.id ? null : hotspot
}

function closeModal() {
  activeHotspot.value = null
  imageLoaded.value = false
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal()
}

function formatPrice(price: number, currency: string) {
  return `${price.toFixed(2).replace('.', ',')} ${currency}`
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      activeHotspot.value = null
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
        class="fixed inset-0 z-[100] flex items-center justify-center"
        @click.self="closeModal"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="closeModal" />

        <!-- Modal content -->
        <div
          class="relative z-10 mx-4 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden lg:flex-row"
          style="background-color: var(--color-bg-elevated)"
        >
          <!-- Close button -->
          <button
            @click="closeModal"
            class="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/60 cursor-pointer"
          >
            <X :size="20" />
          </button>

          <!-- Image with hotspots -->
          <div class="relative flex-1 min-h-[300px] lg:min-h-0">
            <div class="relative h-full max-h-[60vh] lg:max-h-[92vh] overflow-hidden">
              <img
                :src="look.image"
                :alt="look.title"
                class="h-full w-full object-cover transition-opacity duration-500"
                :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
                @load="imageLoaded = true"
              />

              <!-- Loading skeleton -->
              <div
                v-if="!imageLoaded"
                class="absolute inset-0 skeleton"
              />

              <!-- Hotspots -->
              <template v-if="hasHotspots && imageLoaded">
                <button
                  v-for="hotspot in look.hotspots"
                  :key="hotspot.id"
                  class="absolute z-20 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-black/50 backdrop-blur-sm transition-all duration-300 hover:scale-125 hover:bg-white hover:border-black"
                  :class="{ 'bg-white !border-black scale-125': activeHotspot?.id === hotspot.id }"
                  :style="{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)' }"
                  @click.stop="selectHotspot(hotspot)"
                >
                  <div
                    class="h-2 w-2 rounded-full transition-colors duration-200"
                    :class="activeHotspot?.id === hotspot.id ? 'bg-black' : 'bg-white'"
                  />
                  <!-- Pulse ring -->
                  <span
                    v-if="activeHotspot?.id !== hotspot.id"
                    class="absolute inset-0 rounded-full border border-white/40 animate-[hotspotPing_2s_cubic-bezier(0,0,0.2,1)_infinite]"
                  />
                </button>
              </template>

              <!-- Active hotspot tooltip (on image) -->
              <Transition name="tooltip">
                <div
                  v-if="activeHotspot"
                  class="absolute z-30 min-w-[220px] p-4 lg:hidden"
                  :style="{
                    left: `${Math.min(Math.max(activeHotspot.x, 20), 80)}%`,
                    top: `${activeHotspot.y + 5}%`,
                    transform: 'translateX(-50%)',
                  }"
                >
                  <div
                    class="rounded-sm p-4 shadow-xl"
                    style="background-color: var(--color-bg-elevated); border: 1px solid var(--color-border)"
                  >
                    <p class="text-[10px] font-medium uppercase tracking-[0.2em]" style="color: var(--color-text-muted)">
                      {{ activeHotspot.brand }}
                    </p>
                    <p class="mt-1 text-sm font-medium" style="color: var(--color-text)">{{ activeHotspot.name }}</p>
                    <p class="mt-1 text-base font-medium" style="color: var(--color-accent-warm)">
                      {{ formatPrice(activeHotspot.price, activeHotspot.currency) }}
                    </p>
                    <a
                      :href="activeHotspot.productUrl"
                      class="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-opacity hover:opacity-60 cursor-pointer"
                      style="color: var(--color-text)"
                    >
                      Ver producto <ExternalLink :size="11" />
                    </a>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Info panel -->
          <div
            class="flex w-full flex-col overflow-y-auto lg:w-[380px] lg:shrink-0"
            style="border-left: 1px solid var(--color-border)"
          >
            <div class="flex-1 p-8">
              <!-- Season badge -->
              <span
                class="inline-block px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em]"
                style="background-color: var(--color-bg-subtle); color: var(--color-text-muted)"
              >
                {{ look.season }}
              </span>

              <h2
                class="mt-4 text-3xl font-light"
                style="font-family: var(--font-display)"
              >
                {{ look.title }}
              </h2>

              <p
                v-if="look.description"
                class="mt-4 text-sm leading-relaxed"
                style="color: var(--color-text-secondary)"
              >
                {{ look.description }}
              </p>

              <!-- Author -->
              <div class="mt-6 flex items-center gap-3">
                <img
                  :src="look.authorAvatar"
                  :alt="look.author"
                  class="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p class="text-sm font-medium">{{ look.author }}</p>
                  <p class="text-xs" style="color: var(--color-text-muted)">Estilista</p>
                </div>
              </div>

              <!-- Tags -->
              <div class="mt-6 flex flex-wrap gap-2">
                <span
                  v-for="tag in look.tags"
                  :key="tag"
                  class="border px-3 py-1 text-[10px] font-medium uppercase tracking-wider cursor-pointer transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }"
                >
                  #{{ tag }}
                </span>
              </div>

              <!-- Actions -->
              <div class="mt-6 flex items-center gap-4">
                <button
                  class="flex items-center gap-2 text-sm transition-all duration-200 hover:text-[var(--color-error)] cursor-pointer"
                  style="color: var(--color-text-secondary)"
                >
                  <Heart :size="16" />
                  {{ look.likes }}
                </button>
                <button
                  class="flex items-center gap-2 text-sm transition-opacity duration-200 hover:opacity-60 cursor-pointer"
                  style="color: var(--color-text-secondary)"
                >
                  <Share2 :size="16" />
                  Compartir
                </button>
              </div>

              <!-- Product list -->
              <div v-if="hasHotspots" class="mt-8">
                <p
                  class="mb-4 text-[10px] font-medium uppercase tracking-[0.3em]"
                  style="color: var(--color-text-muted)"
                >
                  Prendas del look
                </p>
                <div class="space-y-0">
                  <button
                    v-for="hotspot in look.hotspots"
                    :key="hotspot.id"
                    class="flex w-full items-center gap-4 border-t py-4 text-left transition-all duration-200 cursor-pointer"
                    :class="activeHotspot?.id === hotspot.id ? 'bg-[var(--color-bg-subtle)] -mx-4 px-4' : ''"
                    :style="{ borderColor: 'var(--color-border)' }"
                    @click="selectHotspot(hotspot)"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-[10px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">
                        {{ hotspot.brand }}
                      </p>
                      <p class="mt-0.5 text-sm font-medium truncate">{{ hotspot.name }}</p>
                    </div>
                    <div class="shrink-0 text-right">
                      <p class="text-sm font-medium" style="color: var(--color-accent-warm)">
                        {{ formatPrice(hotspot.price, hotspot.currency) }}
                      </p>
                      <a
                        :href="hotspot.productUrl"
                        class="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider transition-opacity hover:opacity-60"
                        style="color: var(--color-text-muted)"
                        @click.stop
                      >
                        Ver <ArrowRight :size="10" />
                      </a>
                    </div>
                  </button>
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
/* Modal transitions */
.modal-enter-active {
  animation: fadeIn 0.3s ease-out;
}
.modal-enter-active > div:first-child {
  animation: fadeIn 0.3s ease-out;
}
.modal-enter-active > div:nth-child(2) {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-leave-active {
  animation: fadeIn 0.2s ease-in reverse;
}

/* Tooltip transitions */
.tooltip-enter-active {
  animation: slideDown 0.2s ease-out;
}
.tooltip-leave-active {
  animation: fadeIn 0.15s ease-in reverse;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
