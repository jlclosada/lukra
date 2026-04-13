<script setup lang="ts">
import { articles } from '@/data/mock'
import { ArrowUpRight, Clock } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

const revealed = ref(false)
const activeCategory = ref<string | null>(null)

const categories = computed(() => {
  const cats = new Set<string>()
  articles.forEach((a) => cats.add(a.category))
  return Array.from(cats)
})

const filteredArticles = computed(() => {
  if (!activeCategory.value) return articles
  return articles.filter((a) => a.category === activeCategory.value)
})

const featured = computed(() => filteredArticles.value.find((a) => a.featured) || filteredArticles.value[0])
const rest = computed(() => filteredArticles.value.filter((a) => a.id !== featured.value?.id))

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(() => {
  requestAnimationFrame(() => (revealed.value = true))
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
        <p class="text-xs font-medium uppercase tracking-[0.3em]" style="color: var(--color-text-muted)">Editorial</p>
        <h1 class="mt-3 text-5xl font-light tracking-tight sm:text-6xl" style="font-family: var(--font-display)">Artículos</h1>
        <p class="mt-4 max-w-xl text-base leading-relaxed" style="color: var(--color-text-secondary)">
          Reflexiones, guías y análisis sobre moda, estilo y cultura visual.
        </p>
      </div>
    </section>

    <!-- Category filter -->
    <section class="px-6 pb-10 sm:px-12 lg:px-24">
      <div
        class="flex flex-wrap items-center gap-6 border-b pb-4 transition-all duration-700 delay-200"
        :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
        :style="{ borderColor: 'var(--color-border)' }"
      >
        <button
          @click="activeCategory = null"
          class="text-xs font-medium uppercase tracking-[0.15em] transition-opacity"
          :style="{ color: !activeCategory ? 'var(--color-text)' : 'var(--color-text-muted)', opacity: !activeCategory ? 1 : 0.6 }"
        >
          Todos
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = activeCategory === cat ? null : cat"
          class="text-xs font-medium uppercase tracking-[0.15em] transition-opacity"
          :style="{ color: activeCategory === cat ? 'var(--color-text)' : 'var(--color-text-muted)', opacity: activeCategory === cat ? 1 : 0.6 }"
        >
          {{ cat }}
        </button>
      </div>
    </section>

    <!-- Featured article -->
    <section v-if="featured" class="px-6 pb-16 sm:px-12 lg:px-24">
      <div
        class="group cursor-pointer transition-all duration-700 delay-300"
        :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'"
      >
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div class="lg:col-span-3">
            <div class="relative aspect-[16/10] overflow-hidden">
              <img
                :src="featured.image"
                :alt="featured.title"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
          </div>
          <div class="flex flex-col justify-center lg:col-span-2">
            <span
              class="mb-4 text-[10px] font-medium uppercase tracking-[0.2em]"
              style="color: var(--color-accent-warm)"
            >
              {{ featured.category }}
            </span>
            <h2
              class="text-3xl font-light leading-tight transition-opacity group-hover:opacity-70 lg:text-4xl"
              style="font-family: var(--font-display)"
            >
              {{ featured.title }}
            </h2>
            <p class="mt-4 text-sm leading-relaxed" style="color: var(--color-text-secondary)">
              {{ featured.excerpt }}
            </p>
            <div class="mt-6 flex items-center gap-4">
              <img :src="featured.authorAvatar" :alt="featured.author" class="h-8 w-8 rounded-full object-cover" />
              <div>
                <p class="text-sm font-medium">{{ featured.author }}</p>
                <div class="flex items-center gap-2 text-xs" style="color: var(--color-text-muted)">
                  <span>{{ formatDate(featured.date) }}</span>
                  <span>·</span>
                  <Clock :size="11" />
                  <span>{{ featured.readTime }} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Article grid -->
    <section class="px-6 pb-24 sm:px-12 lg:px-24">
      <div class="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(article, index) in rest"
          :key="article.id"
          class="group cursor-pointer transition-all duration-500"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'"
          :style="{ transitionDelay: `${400 + index * 80}ms` }"
        >
          <div class="relative aspect-[3/2] overflow-hidden">
            <img
              :src="article.image"
              :alt="article.title"
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
            <ArrowUpRight
              :size="20"
              class="absolute right-4 top-4 text-white opacity-0 transition-all duration-300 group-hover:opacity-80"
            />
          </div>

          <div class="mt-4">
            <span
              class="text-[10px] font-medium uppercase tracking-[0.2em]"
              style="color: var(--color-accent-warm)"
            >
              {{ article.category }}
            </span>
            <h3
              class="mt-2 text-xl font-medium leading-tight transition-opacity group-hover:opacity-70"
              style="font-family: var(--font-heading)"
            >
              {{ article.title }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed" style="color: var(--color-text-secondary)">
              {{ article.excerpt }}
            </p>
            <div class="mt-4 flex items-center gap-3">
              <img :src="article.authorAvatar" :alt="article.author" class="h-6 w-6 rounded-full object-cover" />
              <span class="text-xs font-medium">{{ article.author }}</span>
              <span class="text-xs" style="color: var(--color-text-muted)">·</span>
              <span class="text-xs" style="color: var(--color-text-muted)">{{ article.readTime }} min</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
