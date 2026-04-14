<script setup lang="ts">
import { articles } from '@/data/mock'
import { ArrowLeft, ArrowRight, Calendar, Clock, Share2 } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const revealed = ref(false)

const article = computed(() => articles.find((a) => a.id === route.params.id))

const relatedArticles = computed(() => {
  if (!article.value) return []
  return articles
    .filter((a) => a.id !== article.value!.id && a.category === article.value!.category)
    .slice(0, 2)
})

const nextArticle = computed(() => {
  if (!article.value) return null
  const idx = articles.findIndex((a) => a.id === article.value!.id)
  return idx < articles.length - 1 ? articles[idx + 1] : null
})

const prevArticle = computed(() => {
  if (!article.value) return null
  const idx = articles.findIndex((a) => a.id === article.value!.id)
  return idx > 0 ? articles[idx - 1] : null
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Generate magazine-style content sections from the article data
const contentSections = computed(() => {
  if (!article.value) return []
  const a = article.value
  return [
    {
      type: 'intro' as const,
      text: a.excerpt,
    },
    {
      type: 'paragraph' as const,
      text: a.content || 'La moda contemporánea está atravesando uno de sus momentos más fascinantes. Las fronteras entre lo formal y lo casual se difuminan, dando paso a una era donde la autenticidad prima sobre las reglas establecidas. Los diseñadores más vanguardistas están explorando nuevas formas de expresión que desafían las convenciones tradicionales.',
    },
    {
      type: 'quote' as const,
      text: '"La moda no es algo que existe solo en los vestidos. La moda está en el cielo, en la calle, la moda tiene que ver con las ideas, con cómo vivimos, con lo que está pasando."',
      author: 'Coco Chanel',
    },
    {
      type: 'paragraph' as const,
      text: 'En este contexto, las marcas independientes están liderando una revolución silenciosa. Su compromiso con la calidad, la sostenibilidad y la narrativa creativa las posiciona como referentes de una nueva generación de consumidores que valoran la historia detrás de cada prenda tanto como su estética.',
    },
    {
      type: 'paragraph' as const,
      text: 'La clave está en entender que el estilo personal no se construye de la noche a la mañana. Es un viaje de autodescubrimiento donde cada elección refleja quiénes somos y hacia dónde vamos. Las tendencias son puntos de referencia, pero nunca dictámenes absolutos.',
    },
  ]
})

onMounted(() => {
  requestAnimationFrame(() => (revealed.value = true))
})

// If no article found, redirect
if (!article.value) {
  router.replace('/articles')
}
</script>

<template>
  <div v-if="article">
    <!-- Hero -->
    <section class="relative h-[75vh] min-h-[500px] overflow-hidden">
      <img
        :src="article.image"
        :alt="article.title"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000"
        :class="revealed ? 'scale-100' : 'scale-110'"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      <!-- Back button -->
      <RouterLink
        to="/articles"
        class="absolute left-6 top-6 z-20 flex items-center gap-2 text-white/70 transition-all duration-300 hover:text-white sm:left-12"
      >
        <ArrowLeft :size="16" />
        <span class="text-xs font-medium uppercase tracking-[0.15em]">Artículos</span>
      </RouterLink>

      <!-- Hero content -->
      <div
        class="relative z-10 flex h-full flex-col justify-end px-6 pb-16 sm:px-12 lg:px-24"
      >
        <div
          class="mx-auto w-full max-w-4xl transition-all duration-1000"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'"
        >
          <span
            class="inline-block border border-white/30 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80"
          >
            {{ article.category }}
          </span>

          <h1
            class="mt-6 text-4xl font-light leading-[1.1] text-white sm:text-5xl lg:text-6xl"
            style="font-family: var(--font-display)"
          >
            {{ article.title }}
          </h1>

          <div class="mt-8 flex flex-wrap items-center gap-6 text-white/60">
            <div class="flex items-center gap-3">
              <img
                :src="article.authorAvatar"
                :alt="article.author"
                class="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
              />
              <div>
                <p class="text-sm font-medium text-white">{{ article.author }}</p>
                <p class="text-[11px]">Redactor</p>
              </div>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <Calendar :size="13" />
              <span>{{ formatDate(article.date) }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <Clock :size="13" />
              <span>{{ article.readTime }} min de lectura</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Article Body -->
    <article class="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <div
        v-for="(section, idx) in contentSections"
        :key="idx"
        class="transition-all duration-700"
        :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
        :style="{ transitionDelay: `${300 + idx * 150}ms` }"
      >
        <!-- Intro (drop cap style) -->
        <div v-if="section.type === 'intro'" class="mb-12">
          <p
            class="text-xl leading-[1.9] font-light sm:text-2xl first-letter:float-left first-letter:mr-3 first-letter:text-7xl first-letter:font-light first-letter:leading-[0.8]"
            style="font-family: var(--font-display); color: var(--color-text); first-letter-font-family: var(--font-heading)"
          >
            {{ section.text }}
          </p>
          <div class="mt-10 mx-auto h-px w-16" style="background-color: var(--color-accent-warm)" />
        </div>

        <!-- Regular paragraph -->
        <div v-else-if="section.type === 'paragraph'" class="mb-10">
          <p class="text-base leading-[2] sm:text-[17px]" style="color: var(--color-text-secondary)">
            {{ section.text }}
          </p>
        </div>

        <!-- Pull quote -->
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
          class="border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] transition-colors hover:border-[var(--color-accent)]"
          :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }"
        >
          {{ article.category }}
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

    <!-- Navigation between articles -->
    <section
      class="border-t px-6 sm:px-12 lg:px-24"
      :style="{ borderColor: 'var(--color-border)' }"
    >
      <div class="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-2">
        <RouterLink
          v-if="prevArticle"
          :to="`/articles/${prevArticle.id}`"
          class="group flex items-center gap-4 border-b py-10 transition-all duration-300 sm:border-b-0 sm:border-r sm:pr-10"
          :style="{ borderColor: 'var(--color-border)' }"
        >
          <ArrowLeft :size="20" class="shrink-0 transition-transform duration-300 group-hover:-translate-x-1" style="color: var(--color-text-muted)" />
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style="color: var(--color-text-muted)">Anterior</p>
            <p class="text-sm font-medium leading-snug transition-opacity group-hover:opacity-70">{{ prevArticle.title }}</p>
          </div>
        </RouterLink>
        <div v-else class="hidden sm:block" />

        <RouterLink
          v-if="nextArticle"
          :to="`/articles/${nextArticle.id}`"
          class="group flex items-center justify-end gap-4 py-10 text-right sm:pl-10"
        >
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style="color: var(--color-text-muted)">Siguiente</p>
            <p class="text-sm font-medium leading-snug transition-opacity group-hover:opacity-70">{{ nextArticle.title }}</p>
          </div>
          <ArrowRight :size="20" class="shrink-0 transition-transform duration-300 group-hover:translate-x-1" style="color: var(--color-text-muted)" />
        </RouterLink>
      </div>
    </section>

    <!-- Related articles -->
    <section
      v-if="relatedArticles.length > 0"
      class="px-6 py-24 sm:px-12 lg:px-24"
      :style="{ backgroundColor: 'var(--color-bg-subtle)' }"
    >
      <div class="mx-auto max-w-5xl">
        <p class="text-[10px] font-semibold uppercase tracking-[0.3em] mb-2" style="color: var(--color-accent-warm)">Sigue leyendo</p>
        <h3 class="text-2xl font-light mb-12" style="font-family: var(--font-display)">Artículos relacionados</h3>

        <div class="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <RouterLink
            v-for="related in relatedArticles"
            :key="related.id"
            :to="`/articles/${related.id}`"
            class="group"
          >
            <div class="relative aspect-[16/10] overflow-hidden">
              <img
                :src="related.image"
                :alt="related.title"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div class="mt-5">
              <span class="text-[10px] font-semibold uppercase tracking-[0.2em]" style="color: var(--color-accent-warm)">{{ related.category }}</span>
              <h4 class="mt-2 text-lg font-medium leading-tight transition-opacity group-hover:opacity-70" style="font-family: var(--font-heading)">{{ related.title }}</h4>
              <div class="mt-3 flex items-center gap-3 text-xs" style="color: var(--color-text-muted)">
                <span>{{ related.author }}</span>
                <span>·</span>
                <Clock :size="11" />
                <span>{{ related.readTime }} min</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
