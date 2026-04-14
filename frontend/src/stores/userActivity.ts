import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface SavedItem {
  id: string
  type: 'look' | 'article' | 'trend'
  savedAt: string
}

export interface UserComment {
  id: string
  targetType: 'look' | 'article' | 'trend'
  targetId: string
  text: string
  createdAt: string
}

export interface UserLike {
  id: string
  targetType: 'look' | 'article' | 'trend'
  targetId: string
  likedAt: string
}

export const useUserActivityStore = defineStore('userActivity', () => {
  const savedItems = ref<SavedItem[]>([])
  const comments = ref<UserComment[]>([])
  const likes = ref<UserLike[]>([])

  function load() {
    const raw = localStorage.getItem('lukra_user_activity')
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (data.savedItems) savedItems.value = data.savedItems
      if (data.comments) comments.value = data.comments
      if (data.likes) likes.value = data.likes
    } catch { /* ignore */ }
  }

  function persist() {
    localStorage.setItem('lukra_user_activity', JSON.stringify({
      savedItems: savedItems.value,
      comments: comments.value,
      likes: likes.value,
    }))
  }

  function toggleSave(id: string, type: SavedItem['type']) {
    const idx = savedItems.value.findIndex(s => s.id === id && s.type === type)
    if (idx !== -1) {
      savedItems.value.splice(idx, 1)
    } else {
      savedItems.value.push({ id, type, savedAt: new Date().toISOString() })
    }
    persist()
  }

  function isSaved(id: string, type: SavedItem['type']) {
    return savedItems.value.some(s => s.id === id && s.type === type)
  }

  function toggleLike(id: string, type: UserLike['targetType']) {
    const idx = likes.value.findIndex(l => l.targetId === id && l.targetType === type)
    if (idx !== -1) {
      likes.value.splice(idx, 1)
    } else {
      likes.value.push({ id: String(Date.now()), targetType: type, targetId: id, likedAt: new Date().toISOString() })
    }
    persist()
  }

  function isLiked(id: string, type: UserLike['targetType']) {
    return likes.value.some(l => l.targetId === id && l.targetType === type)
  }

  function addComment(targetId: string, targetType: UserComment['targetType'], text: string) {
    comments.value.push({
      id: String(Date.now()),
      targetType,
      targetId,
      text,
      createdAt: new Date().toISOString(),
    })
    persist()
  }

  function removeComment(id: string) {
    const idx = comments.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      comments.value.splice(idx, 1)
      persist()
    }
  }

  const savedLooks = computed(() => savedItems.value.filter(s => s.type === 'look'))
  const savedArticles = computed(() => savedItems.value.filter(s => s.type === 'article'))
  const savedTrends = computed(() => savedItems.value.filter(s => s.type === 'trend'))

  load()

  return {
    savedItems,
    comments,
    likes,
    toggleSave,
    isSaved,
    toggleLike,
    isLiked,
    addComment,
    removeComment,
    savedLooks,
    savedArticles,
    savedTrends,
  }
})
