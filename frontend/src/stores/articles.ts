import type { Article } from '@/data/mock'
import { articles as mockArticles } from '@/data/mock'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'lukra_articles'

export const useArticlesStore = defineStore('articles', () => {
  const articles = ref<Article[]>([])

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const data = JSON.parse(raw) as Article[]
        if (Array.isArray(data) && data.length > 0) {
          articles.value = data
          return
        }
      } catch { /* ignore */ }
    }
    // First load — seed from mock data
    articles.value = [...mockArticles]
    persist()
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles.value))
  }

  function addArticle(article: Omit<Article, 'id'> & { id?: string }) {
    const newArticle: Article = {
      ...article,
      id: article.id || String(Date.now()),
    }
    articles.value.unshift(newArticle)
    persist()
    return newArticle
  }

  function updateArticle(id: string, updates: Partial<Article>) {
    const idx = articles.value.findIndex(a => a.id === id)
    if (idx !== -1) {
      articles.value[idx] = { ...articles.value[idx], ...updates }
      persist()
    }
  }

  function deleteArticle(id: string) {
    articles.value = articles.value.filter(a => a.id !== id)
    persist()
  }

  function getById(id: string) {
    return articles.value.find(a => a.id === id)
  }

  const publishedArticles = computed(() =>
    articles.value.filter(a => a.published !== false),
  )

  // Initialize on creation
  load()

  return {
    articles,
    publishedArticles,
    load,
    addArticle,
    updateArticle,
    deleteArticle,
    getById,
  }
})
