import { api } from '@/services/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface Trend {
  id: string
  title: string
  description: string
  content?: string | null
  image: string
  author: string
  author_avatar?: string | null
  author_id?: string
  tags: string[]
  season: string
  popularity: number
  published?: boolean
  created_at?: string
  updated_at?: string
  // Legacy alias
  authorAvatar?: string
}

function normalize(t: Trend): Trend {
  return {
    ...t,
    authorAvatar: t.author_avatar ?? undefined,
  }
}

interface TrendListResponse {
  items: Trend[]
  total: number
}

export const useTrendsStore = defineStore('trends', () => {
  const trends = ref<Trend[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const data = await api<TrendListResponse>('/trends/', { params: { per_page: 100 } })
      trends.value = data.items.map(normalize)
    } catch (e) {
      console.error('Failed to load trends:', e)
    } finally {
      loading.value = false
    }
  }

  async function addTrend(trend: Record<string, unknown>) {
    const data = await api<Trend>('/trends/', { method: 'POST', body: trend })
    const normalized = normalize(data)
    trends.value.unshift(normalized)
    return normalized
  }

  async function updateTrend(id: string, updates: Record<string, unknown>) {
    const data = await api<Trend>(`/trends/${id}`, { method: 'PATCH', body: updates })
    const normalized = normalize(data)
    const idx = trends.value.findIndex(t => t.id === id)
    if (idx !== -1) trends.value[idx] = normalized
    return normalized
  }

  async function deleteTrend(id: string) {
    await api(`/trends/${id}`, { method: 'DELETE' })
    trends.value = trends.value.filter(t => t.id !== id)
  }

  function getById(id: string) {
    return trends.value.find(t => t.id === id)
  }

  const publishedTrends = computed(() =>
    trends.value.filter(t => t.published !== false),
  )

  const allTags = computed(() => {
    const tags = new Set<string>()
    trends.value.forEach(t => t.tags.forEach(tag => tags.add(tag)))
    return Array.from(tags).sort()
  })

  return {
    trends,
    loading,
    publishedTrends,
    allTags,
    load,
    addTrend,
    updateTrend,
    deleteTrend,
    getById,
  }
})
