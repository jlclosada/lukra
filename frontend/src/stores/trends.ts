import type { Trend } from '@/data/mock'
import { trends as mockTrends } from '@/data/mock'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'lukra_trends'

export const useTrendsStore = defineStore('trends', () => {
  const trends = ref<Trend[]>([])

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const data = JSON.parse(raw) as Trend[]
        if (Array.isArray(data) && data.length > 0) {
          trends.value = data
          return
        }
      } catch { /* ignore */ }
    }
    trends.value = [...mockTrends]
    persist()
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trends.value))
  }

  function addTrend(trend: Omit<Trend, 'id'> & { id?: string }) {
    const newTrend: Trend = {
      ...trend,
      id: trend.id || String(Date.now()),
    }
    trends.value.unshift(newTrend)
    persist()
    return newTrend
  }

  function updateTrend(id: string, updates: Partial<Trend>) {
    const idx = trends.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      trends.value[idx] = { ...trends.value[idx], ...updates }
      persist()
    }
  }

  function deleteTrend(id: string) {
    trends.value = trends.value.filter(t => t.id !== id)
    persist()
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

  load()

  return {
    trends,
    publishedTrends,
    allTags,
    load,
    addTrend,
    updateTrend,
    deleteTrend,
    getById,
  }
})
