<script setup lang="ts">
import { useArticlesStore } from '@/stores/articles'
import { useAuthStore } from '@/stores/auth'
import { useUserActivityStore } from '@/stores/userActivity'
import { ArrowLeft, ArrowRight, Bookmark, Calendar, Clock, Heart, MessageCircle, Send, Share2, Trash2 } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const revealed = ref(false)
const auth = useAuthStore()
const activity = useUserActivityStore()
const articlesStore = useArticlesStore()
const commentText = ref('')

const articles = computed(() => articlesStore.publishedArticles)
const article = computed(() => articlesStore.getById(route.params.id as string))

const relatedArticles = computed(() => {
  if (!article.value) return []
  return articles.value
    .filter((a) => a.id !== article.value!.id && a.category === article.value!.category)
    .slice(0, 2)
})

const nextArticle = computed(() => {
  if (!article.value) return null
  const idx = articles.value.findIndex((a) => a.id === article.value!.id)
  return idx < articles.value.length - 1 ? articles.value[idx + 1] : null
})

const prevArticle = computed(() => {
  if (!article.value) return null
  const idx = articles.value.findIndex((a) => a.id === article.value!.id)
  return idx > 0 ? articles.value[idx - 1] : null
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(() => {
  requestAnimationFrame(() => (revealed.value = true))
})

const articleComments = computed(() =>
  article.value
    ? activity.comments.filter(c => c.targetType === 'article' && c.targetId === article.value!.id)
    : []
)

function submitComment() {
  if (!commentText.value.trim() || !article.value) return
  activity.addComment(article.value.id, 'article', commentText.value.trim())
  commentText.value = ''
}

// If no article found, redirect
if (!article.value) {
  router.replace('/articles')
}
</script>

<template>
  <div v-if="article">
    <!-- Hero -->
    <section class="relative h-[75vh] min-h-[500px] overflow-hidden">
      <img
        :src="article.image"
        :alt="article.title"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000"
        :class="revealed ? 'scale-100' : 'scale-110'"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      <!-- Back button -->
      <RouterLink
        to="/articles"
        class="absolute left-6 top-6 z-20 flex items-center gap-2 text-white/70 transition-all duration-300 hover:text-white sm:left-12"
      >
        <ArrowLeft :size="16" />
        <span class="text-xs font-medium uppercase tracking-[0.15em]">Artículos</span>
      </RouterLink>

      <!-- Hero content -->
      <div
        class="relative z-10 flex h-full flex-col justify-end px-6 pb-16 sm:px-12 lg:px-24"
      >
        <div
          class="mx-auto w-full max-w-4xl transition-all duration-1000"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'"
        >
          <span
            class="inline-block border border-white/30 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80"
          >
            {{ article.category }}
          </span>

          <h1
            class="mt-6 text-4xl font-light leading-[1.1] text-white sm:text-5xl lg:text-6xl"
            style="font-family: var(--font-display)"
          >
            {{ article.title }}
          </h1>

          <div class="mt-8 flex flex-wrap items-center gap-6 text-white/60">
            <div class="flex items-center gap-3">
              <img
                :src="article.authorAvatar"
                :alt="article.author"
                class="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
              />
              <div>
                <p class="text-sm font-medium text-white">{{ article.author }}</p>
                <p class="text-[11px]">Redactor</p>
              </div>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <Calendar :size="13" />
              <span>{{ formatDate(article.date) }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <Clock :size="13" />
              <span>{{ article.readTime }} min de lectura</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Article Body -->
    <article class="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <!-- Intro / Excerpt -->
      <div
        class="mb-12 transition-all duration-700"
        :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
        :style="{ transitionDelay: '300ms' }"
      >
        <p
          class="text-xl leading-[1.9] font-light sm:text-2xl first-letter:float-left first-letter:mr-3 first-letter:text-7xl first-letter:font-light first-letter:leading-[0.8]"
          style="font-family: var(--font-display); color: var(--color-text)"
        >
          {{ article.excerpt }}
        </p>
        <div class="mt-10 mx-auto h-px w-16" style="background-color: var(--color-accent-warm)" />
      </div>

      <!-- Rich content from editor -->
      <div
        v-if="article.content"
        class="article-prose transition-all duration-700"
        :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
        :style="{ transitionDelay: '450ms' }"
        v-html="article.content"
      />

      <!-- Tags -->
      <div class="mt-16 flex flex-wrap items-center gap-3 border-t pt-8" :style="{ borderColor: 'var(--color-border)' }">
        <span class="text-[10px] font-semibold uppercase tracking-[0.2em] mr-2" style="color: var(--color-text-muted)">Tags</span>
        <span
          class="border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] transition-colors hover:border-[var(--color-accent)]"
          :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }"
        >
          {{ article.category }}
        </span>
      </div>

      <!-- Share & Actions -->
      <div v-if="auth.isAuthenticated" class="mt-8 flex items-center gap-4">
        <span class="text-[10px] font-semibold uppercase tracking-[0.2em]" style="color: var(--color-text-muted)">Acciones</span>
        <button
          @click="activity.toggleLike(article.id, 'article')"
          class="flex h-10 w-10 items-center justify-center border transition-all duration-200 cursor-pointer"
          :style="{ borderColor: activity.isLiked(article.id, 'article') ? 'var(--color-error)' : 'var(--color-border)' }"
        >
          <Heart :size="15" :fill="activity.isLiked(article.id, 'article') ? 'var(--color-error)' : 'none'" :style="{ color: activity.isLiked(article.id, 'article') ? 'var(--color-error)' : 'var(--color-text-secondary)' }" />
        </button>
        <button
          @click="activity.toggleSave(article.id, 'article')"
          class="flex h-10 w-10 items-center justify-center border transition-all duration-200 cursor-pointer"
          :style="{ borderColor: activity.isSaved(article.id, 'article') ? 'var(--color-accent-warm)' : 'var(--color-border)' }"
        >
          <Bookmark :size="15" :fill="activity.isSaved(article.id, 'article') ? 'var(--color-accent-warm)' : 'none'" :style="{ color: activity.isSaved(article.id, 'article') ? 'var(--color-accent-warm)' : 'var(--color-text-secondary)' }" />
        </button>
        <button
          class="flex h-10 w-10 items-center justify-center border transition-all duration-200 cursor-pointer"
          :style="{ borderColor: 'var(--color-border)' }"
        >
          <Share2 :size="15" style="color: var(--color-text-secondary)" />
        </button>
      </div>

      <!-- Comments Section -->
      <div v-if="auth.isAuthenticated" class="mt-16 border-t pt-10" :style="{ borderColor: 'var(--color-border)' }">
        <div class="flex items-center gap-2 mb-8">
          <MessageCircle :size="18" style="color: var(--color-text-muted)" />
          <h3 class="text-lg font-medium" style="font-family: var(--font-heading)">
            Comentarios
            <span class="ml-1 text-sm font-normal" style="color: var(--color-text-muted)">({{ articleComments.length }})</span>
          </h3>
        </div>

        <!-- Comment form -->
        <div v-if="auth.isAuthenticated" class="mb-8">
          <div class="flex gap-3">
            <div class="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-medium" style="background-color: var(--color-accent); color: var(--color-bg)">
              {{ auth.user?.display_name?.charAt(0)?.toUpperCase() || auth.user?.email?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <div class="flex-1">
              <textarea
                v-model="commentText"
                rows="3"
                placeholder="Escribe un comentario..."
                class="w-full border px-4 py-3 text-sm bg-transparent outline-none resize-none focus:border-[var(--color-accent)] transition-colors"
                :style="{ borderColor: 'var(--color-border)' }"
              />
              <div class="mt-2 flex justify-end">
                <button
                  @click="submitComment"
                  :disabled="!commentText.trim()"
                  class="inline-flex items-center gap-2 px-5 py-2 text-[11px] font-medium uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  :style="{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }"
                >
                  <Send :size="12" />
                  Comentar
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="mb-8 text-center py-6 border" :style="{ borderColor: 'var(--color-border)' }">
          <p class="text-sm" style="color: var(--color-text-muted)">
            <RouterLink to="/login" class="underline hover:opacity-70" style="color: var(--color-accent)">Inicia sesión</RouterLink>
            para dejar un comentario
          </p>
        </div>

        <!-- Comments list -->
        <div class="space-y-6">
          <div
            v-for="comment in articleComments"
            :key="comment.id"
            class="flex gap-3"
          >
            <div class="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[10px] font-medium" style="background-color: var(--color-bg-subtle); color: var(--color-text-muted)">
              U
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ auth.user?.display_name || 'Tú' }}</span>
                <span class="text-[10px]" style="color: var(--color-text-muted)">
                  {{ new Date(comment.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) }}
                </span>
              </div>
              <p class="mt-1 text-sm leading-relaxed" style="color: var(--color-text-secondary)">{{ comment.text }}</p>
              <button
                @click="activity.removeComment(comment.id)"
                class="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-wider transition-opacity hover:opacity-100 opacity-40 cursor-pointer"
                style="color: var(--color-error)"
              >
                <Trash2 :size="10" /> Eliminar
              </button>
            </div>
          </div>
          <p v-if="articleComments.length === 0" class="text-sm text-center py-6" style="color: var(--color-text-muted)">
            Sé el primero en comentar este artículo
          </p>
        </div>
      </div>
    </article>

    <!-- Navigation between articles -->
    <section
      class="border-t px-6 sm:px-12 lg:px-24"
      :style="{ borderColor: 'var(--color-border)' }"
    >
      <div class="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-2">
        <RouterLink
          v-if="prevArticle"
          :to="`/articles/${prevArticle.id}`"
          class="group flex items-center gap-4 border-b py-10 transition-all duration-300 sm:border-b-0 sm:border-r sm:pr-10"
          :style="{ borderColor: 'var(--color-border)' }"
        >
          <ArrowLeft :size="20" class="shrink-0 transition-transform duration-300 group-hover:-translate-x-1" style="color: var(--color-text-muted)" />
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style="color: var(--color-text-muted)">Anterior</p>
            <p class="text-sm font-medium leading-snug transition-opacity group-hover:opacity-70">{{ prevArticle.title }}</p>
          </div>
        </RouterLink>
        <div v-else class="hidden sm:block" />

        <RouterLink
          v-if="nextArticle"
          :to="`/articles/${nextArticle.id}`"
          class="group flex items-center justify-end gap-4 py-10 text-right sm:pl-10"
        >
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style="color: var(--color-text-muted)">Siguiente</p>
            <p class="text-sm font-medium leading-snug transition-opacity group-hover:opacity-70">{{ nextArticle.title }}</p>
          </div>
          <ArrowRight :size="20" class="shrink-0 transition-transform duration-300 group-hover:translate-x-1" style="color: var(--color-text-muted)" />
        </RouterLink>
      </div>
    </section>

    <!-- Related articles -->
    <section
      v-if="relatedArticles.length > 0"
      class="px-6 py-24 sm:px-12 lg:px-24"
      :style="{ backgroundColor: 'var(--color-bg-subtle)' }"
    >
      <div class="mx-auto max-w-5xl">
        <p class="text-[10px] font-semibold uppercase tracking-[0.3em] mb-2" style="color: var(--color-accent-warm)">Sigue leyendo</p>
        <h3 class="text-2xl font-light mb-12" style="font-family: var(--font-display)">Artículos relacionados</h3>

        <div class="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <RouterLink
            v-for="related in relatedArticles"
            :key="related.id"
            :to="`/articles/${related.id}`"
            class="group"
          >
            <div class="relative aspect-[16/10] overflow-hidden">
              <img
                :src="related.image"
                :alt="related.title"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div class="mt-5">
              <span class="text-[10px] font-semibold uppercase tracking-[0.2em]" style="color: var(--color-accent-warm)">{{ related.category }}</span>
              <h4 class="mt-2 text-lg font-medium leading-tight transition-opacity group-hover:opacity-70" style="font-family: var(--font-heading)">{{ related.title }}</h4>
              <div class="mt-3 flex items-center gap-3 text-xs" style="color: var(--color-text-muted)">
                <span>{{ related.author }}</span>
                <span>·</span>
                <Clock :size="11" />
                <span>{{ related.readTime }} min</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.article-prose {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 2;
  color: var(--color-text-secondary);
}

.article-prose :deep(p) {
  margin-bottom: 1.5rem;
}

.article-prose :deep(h1) {
  font-family: var(--font-heading);
  font-size: 2.25rem;
  font-weight: 300;
  margin: 2.5rem 0 1rem;
  line-height: 1.2;
  color: var(--color-text);
}

.article-prose :deep(h2) {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 400;
  margin: 2rem 0 0.75rem;
  line-height: 1.3;
  color: var(--color-text);
}

.article-prose :deep(h3) {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 500;
  margin: 1.5rem 0 0.5rem;
  line-height: 1.4;
  color: var(--color-text);
}

.article-prose :deep(blockquote) {
  border-left: 3px solid var(--color-accent-warm);
  padding-left: 1.25rem;
  margin: 2rem 0;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.15rem;
  color: var(--color-text);
}

.article-prose :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 2px;
  margin: 2rem 0;
}

.article-prose :deep(a) {
  color: var(--color-accent-warm);
  text-decoration: underline;
  transition: opacity 0.2s;
}

.article-prose :deep(a:hover) {
  opacity: 0.7;
}

.article-prose :deep(ul),
.article-prose :deep(ol) {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.article-prose :deep(li) {
  margin-bottom: 0.5rem;
}

.article-prose :deep(strong) {
  font-weight: 600;
  color: var(--color-text);
}

.article-prose :deep(em) {
  font-style: italic;
}

.article-prose :deep(mark) {
  background-color: #fef08a;
  padding: 0 3px;
  border-radius: 2px;
}

.article-prose :deep(code) {
  background-color: var(--color-bg-subtle);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

.article-prose :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 2.5rem 0;
}
</style>
