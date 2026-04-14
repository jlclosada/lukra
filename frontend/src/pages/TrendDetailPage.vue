<script setup lang="ts">
import { useTrendsStore } from '@/stores/trends'
import { ArrowLeft, ArrowRight, Hash, Share2, TrendingUp } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const revealed = ref(false)
const trendsStore = useTrendsStore()

const trend = computed(() => trendsStore.getById(route.params.id as string))

const relatedTrends = computed(() => {
  if (!trend.value) return []
  return trendsStore.trends
    .filter((t) => t.id !== trend.value!.id && t.season === trend.value!.season)
    .slice(0, 3)
})

const nextTrend = computed(() => {
  if (!trend.value) return null
  const idx = trendsStore.trends.findIndex((t) => t.id === trend.value!.id)
  return idx < trendsStore.trends.length - 1 ? trendsStore.trends[idx + 1] : null
})

const prevTrend = computed(() => {
  if (!trend.value) return null
  const idx = trendsStore.trends.findIndex((t) => t.id === trend.value!.id)
  return idx > 0 ? trendsStore.trends[idx - 1] : null
})

const contentSections = computed(() => {
  if (!trend.value) return []
  const t = trend.value
  return [
    {
      type: 'intro' as const,
      text: t.description,
    },
    {
      type: 'paragraph' as const,
      text: t.content || 'Esta tendencia representa uno de los movimientos más significativos en la moda contemporánea. Lo que comenzó como una corriente underground ha evolucionado hasta convertirse en una fuerza dominante que está redefiniendo cómo nos vestimos y nos expresamos. Los diseñadores más influyentes están adoptando esta estética, integrándola en sus colecciones de formas innovadoras y sorprendentes.',
    },
    {
      type: 'quote' as const,
      text: '"La moda se desvanece, solo el estilo permanece igual."',
      author: 'Coco Chanel',
    },
    {
      type: 'paragraph' as const,
      text: 'Las marcas independientes han sido las primeras en adoptar esta tendencia, demostrando que la verdadera innovación en la moda no siempre viene de las grandes casas. Su enfoque fresco y sin compromisos ha establecido los códigos visuales que ahora el mainstream está empezando a incorporar.',
    },
    {
      type: 'paragraph' as const,
      text: 'Para incorporar esta tendencia en tu guardarropa, busca prendas clave que reflejen su esencia sin caer en la sobreexposición. La clave está en el equilibrio: combinar piezas statement con básicos de calidad para lograr un look que sea actual pero atemporal.',
    },
  ]
})

onMounted(() => {
  requestAnimationFrame(() => (revealed.value = true))
})

if (!trend.value) {
  router.replace('/trends')
}
</script>

<template>
  <div v-if="trend">
    <!-- Hero -->
    <section class="relative h-[75vh] min-h-[500px] overflow-hidden">
      <img
        :src="trend.image"
        :alt="trend.title"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000"
        :class="revealed ? 'scale-100' : 'scale-110'"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      <!-- Back button -->
      <RouterLink
        to="/trends"
        class="absolute left-6 top-6 z-20 flex items-center gap-2 text-white/70 transition-all duration-300 hover:text-white sm:left-12"
      >
        <ArrowLeft :size="16" />
        <span class="text-xs font-medium uppercase tracking-[0.15em]">Tendencias</span>
      </RouterLink>

      <!-- Hero content -->
      <div class="relative z-10 flex h-full flex-col justify-end px-6 pb-16 sm:px-12 lg:px-24">
        <div
          class="mx-auto w-full max-w-4xl transition-all duration-1000"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'"
        >
          <span
            class="inline-block border border-white/30 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80"
          >
            {{ trend.season }}
          </span>

          <h1
            class="mt-6 text-4xl font-light leading-[1.1] text-white sm:text-5xl lg:text-6xl"
            style="font-family: var(--font-display)"
          >
            {{ trend.title }}
          </h1>

          <div class="mt-8 flex flex-wrap items-center gap-6 text-white/60">
            <div class="flex items-center gap-2 text-xs">
              <TrendingUp :size="14" class="text-green-400" />
              <span class="text-green-400 font-medium">{{ trend.popularity }}% popularidad</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <Hash :size="13" />
              <span>{{ trend.tags.join(', ') }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trend body -->
    <article class="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <!-- Popularity bar -->
      <div
        class="mb-12 border p-6 transition-all duration-700"
        :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
        :style="{ borderColor: 'var(--color-border)' }"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-[10px] font-semibold uppercase tracking-[0.2em]" style="color: var(--color-text-muted)">Índice de popularidad</span>
          <span class="text-2xl font-light" style="font-family: var(--font-display); color: var(--color-accent)">{{ trend.popularity }}%</span>
        </div>
        <div class="h-2 w-full overflow-hidden" :style="{ backgroundColor: 'var(--color-bg-subtle)' }">
          <div
            class="h-full transition-all duration-1000"
            :style="{
              width: revealed ? `${trend.popularity}%` : '0%',
              backgroundColor: 'var(--color-accent)',
              transitionDelay: '500ms',
            }"
          />
        </div>
      </div>

      <div
        v-for="(section, idx) in contentSections"
        :key="idx"
        class="transition-all duration-700"
        :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
        :style="{ transitionDelay: `${300 + idx * 150}ms` }"
      >
        <div v-if="section.type === 'intro'" class="mb-12">
          <p
            class="text-xl leading-[1.9] font-light sm:text-2xl first-letter:float-left first-letter:mr-3 first-letter:text-7xl first-letter:font-light first-letter:leading-[0.8]"
            style="font-family: var(--font-display); color: var(--color-text)"
          >
            {{ section.text }}
          </p>
          <div class="mt-10 mx-auto h-px w-16" style="background-color: var(--color-accent-warm)" />
        </div>

        <div v-else-if="section.type === 'paragraph'" class="mb-10">
          <p class="text-base leading-[2] sm:text-[17px]" style="color: var(--color-text-secondary)">
            {{ section.text }}
          </p>
        </div>

        <div v-else-if="section.type === 'quote'" class="my-16 py-10 border-t border-b" :style="{ borderColor: 'var(--color-border)' }">
          <blockquote class="text-center">
            <p
              class="text-2xl font-light italic leading-relaxed sm:text-3xl"
              style="font-family: var(--font-display); color: var(--color-text)"
            >
              {{ section.text }}
            </p>
            <cite
              v-if="'author' in section && section.author"
              class="mt-6 block text-[11px] font-semibold uppercase tracking-[0.3em] not-italic"
              style="color: var(--color-accent-warm)"
            >
              — {{ section.author }}
            </cite>
          </blockquote>
        </div>
      </div>

      <!-- Tags -->
      <div class="mt-16 flex flex-wrap items-center gap-3 border-t pt-8" :style="{ borderColor: 'var(--color-border)' }">
        <span class="text-[10px] font-semibold uppercase tracking-[0.2em] mr-2" style="color: var(--color-text-muted)">Tags</span>
        <span
          v-for="tag in trend.tags"
          :key="tag"
          class="border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] transition-colors hover:border-[var(--color-accent)]"
          :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- Share -->
      <div class="mt-8 flex items-center gap-4">
        <span class="text-[10px] font-semibold uppercase tracking-[0.2em]" style="color: var(--color-text-muted)">Compartir</span>
        <button
          class="flex h-10 w-10 items-center justify-center border transition-all duration-200 hover:border-[var(--color-accent)] cursor-pointer"
          :style="{ borderColor: 'var(--color-border)' }"
        >
          <Share2 :size="15" style="color: var(--color-text-secondary)" />
        </button>
      </div>
    </article>

    <!-- Navigation between trends -->
    <section class="border-t px-6 sm:px-12 lg:px-24" :style="{ borderColor: 'var(--color-border)' }">
      <div class="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-2">
        <RouterLink
          v-if="prevTrend"
          :to="`/trends/${prevTrend.id}`"
          class="group flex items-center gap-4 border-b py-10 transition-all duration-300 sm:border-b-0 sm:border-r sm:pr-10"
          :style="{ borderColor: 'var(--color-border)' }"
        >
          <ArrowLeft :size="20" class="shrink-0 transition-transform duration-300 group-hover:-translate-x-1" style="color: var(--color-text-muted)" />
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style="color: var(--color-text-muted)">Anterior</p>
            <p class="text-sm font-medium leading-snug transition-opacity group-hover:opacity-70">{{ prevTrend.title }}</p>
          </div>
        </RouterLink>
        <div v-else class="hidden sm:block" />

        <RouterLink
          v-if="nextTrend"
          :to="`/trends/${nextTrend.id}`"
          class="group flex items-center justify-end gap-4 py-10 text-right sm:pl-10"
        >
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style="color: var(--color-text-muted)">Siguiente</p>
            <p class="text-sm font-medium leading-snug transition-opacity group-hover:opacity-70">{{ nextTrend.title }}</p>
          </div>
          <ArrowRight :size="20" class="shrink-0 transition-transform duration-300 group-hover:translate-x-1" style="color: var(--color-text-muted)" />
        </RouterLink>
      </div>
    </section>

    <!-- Related Trends -->
    <section v-if="relatedTrends.length > 0" class="px-6 py-16 sm:px-12 lg:px-24" :style="{ backgroundColor: 'var(--color-bg-subtle)' }">
      <div class="mx-auto max-w-5xl">
        <h2 class="mb-10 text-center text-2xl font-light" style="font-family: var(--font-display)">
          Tendencias relacionadas
        </h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <RouterLink
            v-for="related in relatedTrends"
            :key="related.id"
            :to="`/trends/${related.id}`"
            class="group"
          >
            <div class="aspect-[4/3] overflow-hidden">
              <img :src="related.image" :alt="related.title" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            </div>
            <div class="mt-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-[10px] font-semibold uppercase tracking-[0.2em]" style="color: var(--color-accent-warm)">{{ related.season }}</span>
                <TrendingUp :size="12" class="text-green-500" />
                <span class="text-[10px] font-medium text-green-500">{{ related.popularity }}%</span>
              </div>
              <h3 class="text-base font-medium transition-opacity group-hover:opacity-70" style="font-family: var(--font-heading)">
                {{ related.title }}
              </h3>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
