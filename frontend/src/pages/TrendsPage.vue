<script setup lang="ts">
import { useTrendsStore } from '@/stores/trends'
import { ArrowUpRight, TrendingUp } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const trendsStore = useTrendsStore()
const trends = trendsStore.publishedTrends

const revealed = ref(false)

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
        <p class="text-xs font-medium uppercase tracking-[0.3em]" style="color: var(--color-text-muted)">Radar</p>
        <h1 class="mt-3 text-5xl font-light tracking-tight sm:text-6xl" style="font-family: var(--font-display)">Tendencias</h1>
        <p class="mt-4 max-w-xl text-base leading-relaxed" style="color: var(--color-text-secondary)">
          Las corrientes que definen la moda de 2026. Analizamos, filtramos y te contamos lo que importa.
        </p>
      </div>
    </section>

    <!-- Trends grid -->
    <section class="px-6 pb-24 sm:px-12 lg:px-24">
      <div class="space-y-0">
        <article
          v-for="(trend, index) in trends"
          :key="trend.id"
          class="group border-t transition-all duration-500"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'"
          :style="{ borderColor: 'var(--color-border)', transitionDelay: `${200 + index * 100}ms` }"
        >
          <RouterLink :to="`/trends/${trend.id}`" class="grid grid-cols-1 items-center gap-6 py-10 lg:grid-cols-12 lg:gap-12">
            <!-- Number -->
            <div class="lg:col-span-1">
              <span
                class="text-5xl font-light lg:text-6xl"
                style="font-family: var(--font-display); color: var(--color-border)"
              >
                {{ String(index + 1).padStart(2, '0') }}
              </span>
            </div>

            <!-- Image -->
            <div class="lg:col-span-3">
              <div class="aspect-[4/3] overflow-hidden">
                <img
                  :src="trend.image"
                  :alt="trend.title"
                  class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>

            <!-- Content -->
            <div class="lg:col-span-6">
              <div class="flex items-center gap-3 mb-3">
                <span class="text-[10px] font-medium uppercase tracking-[0.2em]" style="color: var(--color-accent-warm)">
                  {{ trend.season }}
                </span>
                <div class="flex items-center gap-1.5">
                  <TrendingUp :size="12" style="color: var(--color-success)" />
                  <span class="text-[10px] font-medium" style="color: var(--color-success)">{{ trend.popularity }}%</span>
                </div>
              </div>
              <h2
                class="text-2xl font-medium transition-opacity group-hover:opacity-70 lg:text-3xl"
                style="font-family: var(--font-heading)"
              >
                {{ trend.title }}
              </h2>
              <p class="mt-3 text-sm leading-relaxed" style="color: var(--color-text-secondary)">
                {{ trend.description }}
              </p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="tag in trend.tags"
                  :key="tag"
                  class="border px-3 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors"
                  :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>

            <!-- Popularity bar -->
            <div class="hidden items-center lg:col-span-2 lg:flex lg:flex-col lg:gap-2">
              <div class="h-1.5 w-full overflow-hidden" :style="{ backgroundColor: 'var(--color-bg-subtle)' }">
                <div
                  class="h-full transition-all duration-1000"
                  :class="revealed ? '' : 'w-0!'"
                  :style="{
                    width: revealed ? `${trend.popularity}%` : '0%',
                    backgroundColor: 'var(--color-accent)',
                    transitionDelay: `${600 + index * 150}ms`,
                  }"
                />
              </div>
              <span class="text-xs font-medium" style="color: var(--color-text-muted)">Popularidad</span>
              <ArrowUpRight
                :size="18"
                class="mt-2 opacity-0 transition-all duration-300 group-hover:opacity-60"
                style="color: var(--color-text-secondary)"
              />
            </div>
          </RouterLink>
        </article>

        <!-- Bottom border -->
        <div class="border-t" :style="{ borderColor: 'var(--color-border)' }" />
      </div>
    </section>
  </div>
</template>
