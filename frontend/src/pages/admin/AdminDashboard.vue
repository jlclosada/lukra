<script setup lang="ts">
import { useArticlesStore } from '@/stores/articles'
import { useLooksStore } from '@/stores/looks'
import { useTrendsStore } from '@/stores/trends'
import { BookOpen, Camera, Eye, Heart, TrendingUp, Users } from 'lucide-vue-next'
import { computed } from 'vue'

const articlesStore = useArticlesStore()
const looksStore = useLooksStore()
const trendsStore = useTrendsStore()
const articles = computed(() => articlesStore.articles)

const stats = computed(() => [
  {
    label: 'Looks',
    value: looksStore.looks.length,
    icon: Camera,
    color: 'var(--color-accent-warm)',
    change: '+3 esta semana',
  },
  {
    label: 'Artículos',
    value: articles.value.length,
    icon: BookOpen,
    color: 'var(--color-accent-cool)',
    change: '+1 esta semana',
  },
  {
    label: 'Tendencias',
    value: trendsStore.trends.length,
    icon: TrendingUp,
    color: 'var(--color-success)',
    change: '+2 esta semana',
  },
  {
    label: 'Usuarios',
    value: 156,
    icon: Users,
    color: 'var(--color-accent-gold)',
    change: '+12 este mes',
  },
])

const recentActivity = [
  { type: 'look', text: 'María García publicó "Minimal Noir"', time: 'Hace 2h', icon: Camera },
  { type: 'article', text: 'Carlos Ruiz editó "El regreso del tailoring"', time: 'Hace 4h', icon: BookOpen },
  { type: 'user', text: 'Nuevo usuario: lucía.fernandez@email.com', time: 'Hace 6h', icon: Users },
  { type: 'trend', text: 'Se añadió "Quiet Luxury" a tendencias', time: 'Hace 1d', icon: TrendingUp },
  { type: 'look', text: 'Pablo Martín publicó "Chrome Future"', time: 'Hace 1d', icon: Camera },
  { type: 'article', text: 'Ana López creó "Guía armario cápsula"', time: 'Hace 2d', icon: BookOpen },
]

const topLooks = computed(() =>
  [...looksStore.looks].sort((a, b) => b.likes - a.likes).slice(0, 5),
)
</script>

<template>
  <div class="p-8 lg:p-12">
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-light" style="font-family: var(--font-display)">Dashboard</h1>
      <p class="mt-2 text-sm" style="color: var(--color-text-secondary)">
        Resumen general de la plataforma Lukra
      </p>
    </div>

    <!-- Stats grid -->
    <div class="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="group rounded-sm border p-6 transition-all duration-300 hover:shadow-md cursor-default"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-medium uppercase tracking-[0.2em]" style="color: var(--color-text-muted)">
              {{ stat.label }}
            </p>
            <p class="mt-2 text-4xl font-light" style="font-family: var(--font-display)">
              {{ stat.value }}
            </p>
            <p class="mt-2 text-xs" style="color: var(--color-success)">{{ stat.change }}</p>
          </div>
          <div
            class="flex h-10 w-10 items-center justify-center rounded-md transition-transform duration-300 group-hover:scale-110"
            :style="{ backgroundColor: `color-mix(in srgb, ${stat.color} 12%, transparent)` }"
          >
            <component :is="stat.icon" :size="18" :style="{ color: stat.color }" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-8 xl:grid-cols-2">
      <!-- Recent activity -->
      <div
        class="rounded-sm border"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
      >
        <div class="border-b px-6 py-4" :style="{ borderColor: 'var(--color-border)' }">
          <h2 class="text-sm font-medium uppercase tracking-[0.15em]">Actividad reciente</h2>
        </div>
        <div class="divide-y" :style="{ '--tw-divide-color': 'var(--color-border)' } as any">
          <div
            v-for="(activity, i) in recentActivity"
            :key="i"
            class="flex items-center gap-4 px-6 py-4 transition-colors duration-200 hover:bg-[var(--color-bg-subtle)]"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
              style="background-color: var(--color-bg-subtle)"
            >
              <component :is="activity.icon" :size="14" style="color: var(--color-text-muted)" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm">{{ activity.text }}</p>
            </div>
            <span class="shrink-0 text-xs" style="color: var(--color-text-muted)">{{ activity.time }}</span>
          </div>
        </div>
      </div>

      <!-- Top looks -->
      <div
        class="rounded-sm border"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
      >
        <div class="border-b px-6 py-4" :style="{ borderColor: 'var(--color-border)' }">
          <h2 class="text-sm font-medium uppercase tracking-[0.15em]">Looks más populares</h2>
        </div>
        <div class="divide-y" :style="{ '--tw-divide-color': 'var(--color-border)' } as any">
          <div
            v-for="(look, i) in topLooks"
            :key="look.id"
            class="flex items-center gap-4 px-6 py-3 transition-colors duration-200 hover:bg-[var(--color-bg-subtle)]"
          >
            <span class="w-5 text-center text-sm font-light" style="color: var(--color-text-muted); font-family: var(--font-display)">
              {{ i + 1 }}
            </span>
            <img
              :src="look.image"
              :alt="look.title"
              class="h-12 w-12 rounded-sm object-cover"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ look.title }}</p>
              <p class="text-xs" style="color: var(--color-text-muted)">{{ look.author }}</p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <Heart :size="13" style="color: var(--color-error)" />
              <span class="text-xs font-medium">{{ look.likes }}</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <Eye :size="13" style="color: var(--color-text-muted)" />
              <span class="text-xs" style="color: var(--color-text-muted)">{{ Math.round(look.likes * 3.2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
