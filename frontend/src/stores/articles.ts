import { api } from '@/services/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface Article {
  id: string
  title: string
  excerpt: string
  content?: string | null
  image: string
  author: string
  author_avatar?: string | null
  author_id?: string
  category: string
  read_time: number
  featured: boolean
  published: boolean
  created_at: string
  updated_at: string
  // Legacy aliases used in templates
  authorAvatar?: string
  readTime?: number
  date?: string
}

function normalize(a: Article): Article {
  return {
    ...a,
    authorAvatar: a.author_avatar ?? undefined,
    readTime: a.read_time,
    date: a.created_at,
  }
}

interface ArticleListResponse {
  items: Article[]
  total: number
}

export const useArticlesStore = defineStore('articles', () => {
  const articles = ref<Article[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const data = await api<ArticleListResponse>('/articles/', { params: { per_page: 100 } })
      articles.value = data.items.map(normalize)
    } catch (e) {
      console.error('Failed to load articles:', e)
    } finally {
      loading.value = false
    }
  }

  async function addArticle(article: Record<string, unknown>) {
    const data = await api<Article>('/articles/', { method: 'POST', body: article })
    const normalized = normalize(data)
    articles.value.unshift(normalized)
    return normalized
  }

  async function updateArticle(id: string, updates: Record<string, unknown>) {
    const data = await api<Article>(`/articles/${id}`, { method: 'PATCH', body: updates })
    const normalized = normalize(data)
    const idx = articles.value.findIndex(a => a.id === id)
    if (idx !== -1) articles.value[idx] = normalized
    return normalized
  }

  async function deleteArticle(id: string) {
    await api(`/articles/${id}`, { method: 'DELETE' })
    articles.value = articles.value.filter(a => a.id !== id)
  }

  function getById(id: string) {
    return articles.value.find(a => a.id === id)
  }

  const publishedArticles = computed(() =>
    articles.value.filter(a => a.published !== false),
  )

  return {
    articles,
    loading,
    publishedArticles,
    load,
    addArticle,
    updateArticle,
    deleteArticle,
    getById,
  }
})
