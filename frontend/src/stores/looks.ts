import type { Look } from '@/data/mock'
import { looks as mockLooks } from '@/data/mock'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'lukra_looks'

export const useLooksStore = defineStore('looks', () => {
  const looks = ref<Look[]>([])

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const data = JSON.parse(raw) as Look[]
        if (Array.isArray(data) && data.length > 0) {
          looks.value = data
          return
        }
      } catch { /* ignore */ }
    }
    looks.value = [...mockLooks]
    persist()
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(looks.value))
  }

  function addLook(look: Omit<Look, 'id'> & { id?: string }) {
    const newLook: Look = {
      ...look,
      id: look.id || String(Date.now()),
    }
    looks.value.unshift(newLook)
    persist()
    return newLook
  }

  function updateLook(id: string, updates: Partial<Look>) {
    const idx = looks.value.findIndex(l => l.id === id)
    if (idx !== -1) {
      looks.value[idx] = { ...looks.value[idx], ...updates }
      persist()
    }
  }

  function deleteLook(id: string) {
    looks.value = looks.value.filter(l => l.id !== id)
    persist()
  }

  function getById(id: string) {
    return looks.value.find(l => l.id === id)
  }

  const allTags = computed(() => {
    const tags = new Set<string>()
    looks.value.forEach(l => l.tags.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  })

  load()

  return {
    looks,
    allTags,
    load,
    addLook,
    updateLook,
    deleteLook,
    getById,
  }
})
