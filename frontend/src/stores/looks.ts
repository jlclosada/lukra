import { api } from '@/services/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface ProductHotspot {
  id: string
  x: number
  y: number
  name: string
  brand: string
  price: number
  currency: string
  productUrl: string
  image?: string
}

export interface Look {
  id: string
  title: string
  description?: string | null
  image: string
  author: string
  author_avatar?: string | null
  author_id?: string
  tags: string[]
  likes: number
  season: string
  aspect: 'tall' | 'wide' | 'square'
  hotspots?: ProductHotspot[] | null
  published?: boolean
  created_at?: string
  updated_at?: string
  // Legacy alias
  authorAvatar?: string
}

function normalize(l: Look): Look {
  return {
    ...l,
    authorAvatar: l.author_avatar ?? undefined,
  }
}

interface LookListResponse {
  items: Look[]
  total: number
}

export const useLooksStore = defineStore('looks', () => {
  const looks = ref<Look[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const data = await api<LookListResponse>('/looks/', { params: { per_page: 100 } })
      looks.value = data.items.map(normalize)
    } catch (e) {
      console.error('Failed to load looks:', e)
    } finally {
      loading.value = false
    }
  }

  async function addLook(look: Record<string, unknown>) {
    const data = await api<Look>('/looks/', { method: 'POST', body: look })
    const normalized = normalize(data)
    looks.value.unshift(normalized)
    return normalized
  }

  async function updateLook(id: string, updates: Record<string, unknown>) {
    const data = await api<Look>(`/looks/${id}`, { method: 'PATCH', body: updates })
    const normalized = normalize(data)
    const idx = looks.value.findIndex(l => l.id === id)
    if (idx !== -1) looks.value[idx] = normalized
    return normalized
  }

  async function deleteLook(id: string) {
    await api(`/looks/${id}`, { method: 'DELETE' })
    looks.value = looks.value.filter(l => l.id !== id)
  }

  function getById(id: string) {
    return looks.value.find(l => l.id === id)
  }

  const allTags = computed(() => {
    const tags = new Set<string>()
    looks.value.forEach(l => l.tags.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  })

  return {
    looks,
    loading,
    allTags,
    load,
    addLook,
    updateLook,
    deleteLook,
    getById,
  }
})
