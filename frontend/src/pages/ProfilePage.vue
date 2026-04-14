<script setup lang="ts">
import { useArticlesStore } from '@/stores/articles'
import { useAuthStore } from '@/stores/auth'
import { useLooksStore } from '@/stores/looks'
import { useTrendsStore } from '@/stores/trends'
import { useUserActivityStore } from '@/stores/userActivity'
import {
    Bookmark,
    Camera,
    Edit3,
    Heart,
    MessageCircle,
    Shield,
    User,
    X,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const auth = useAuthStore()
const activity = useUserActivityStore()
const articlesStore = useArticlesStore()

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  default: 'Usuario',
}

const roleIcon: Record<string, any> = {
  admin: Shield,
  editor: Edit3,
  default: Heart,
}

// ── Tabs ──
const activeTab = ref<'saved' | 'likes' | 'comments' | 'settings'>('saved')

// ── Avatar upload ──
const avatarPreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerAvatarUpload() {
  fileInput.value?.click()
}

function handleAvatarFile(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    avatarPreview.value = reader.result as string
    localStorage.setItem('lukra_avatar', avatarPreview.value)
  }
  reader.readAsDataURL(file)
}

// Load saved avatar
const savedAvatar = localStorage.getItem('lukra_avatar')
if (savedAvatar) avatarPreview.value = savedAvatar

const displayAvatar = computed(() => avatarPreview.value || auth.user?.avatar_url)

// ── Edit profile ──
const editing = ref(false)
const editForm = ref({
  display_name: '',
  bio: '',
  website: '',
  instagram: '',
})

function startEdit() {
  editForm.value = {
    display_name: auth.user?.display_name || '',
    bio: auth.user?.bio || '',
    website: auth.user?.website || '',
    instagram: auth.user?.instagram || '',
  }
  editing.value = true
}

function saveEdit() {
  // In a full app this would call the API
  editing.value = false
}

// ── Saved items resolution ──
const looksStore = useLooksStore()
const trendsStore = useTrendsStore()

const savedLookItems = computed(() =>
  activity.savedLooks
    .map(s => looksStore.looks.find(l => l.id === s.id))
    .filter(Boolean)
)

const savedArticleItems = computed(() =>
  activity.savedArticles
    .map(s => articlesStore.getById(s.id))
    .filter(Boolean)
)

const savedTrendItems = computed(() =>
  activity.savedTrends
    .map(s => trendsStore.getById(s.id))
    .filter(Boolean)
)

// ── Liked items ──
const likedLooks = computed(() =>
  activity.likes
    .filter(l => l.targetType === 'look')
    .map(l => looksStore.looks.find(look => look.id === l.targetId))
    .filter(Boolean)
)

const likedArticles = computed(() =>
  activity.likes
    .filter(l => l.targetType === 'article')
    .map(l => articlesStore.getById(l.targetId))
    .filter(Boolean)
)

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-16">
    <!-- ═══ Profile Header ═══ -->
    <div class="flex flex-col items-center sm:flex-row sm:items-start sm:gap-8">
      <!-- Avatar -->
      <div class="relative group">
        <div
          class="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full"
          :style="{ backgroundColor: 'var(--color-bg-subtle)' }"
        >
          <img v-if="displayAvatar" :src="displayAvatar" class="h-full w-full object-cover" />
          <User v-else :size="48" style="color: var(--color-text-muted)" />
        </div>
        <button
          @click="triggerAvatarUpload"
          class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 cursor-pointer"
        >
          <Camera :size="20" class="text-white" />
        </button>
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleAvatarFile" />
      </div>

      <!-- Info -->
      <div class="mt-6 flex-1 text-center sm:mt-0 sm:text-left">
        <div class="flex items-center justify-center gap-3 sm:justify-start">
          <h1 class="text-3xl font-medium" style="font-family: var(--font-heading)">
            {{ auth.user?.display_name || auth.user?.username }}
          </h1>
          <div
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
            :style="{
              backgroundColor: auth.user?.role === 'admin'
                ? 'color-mix(in srgb, var(--color-accent-gold) 15%, transparent)'
                : auth.user?.role === 'editor'
                  ? 'color-mix(in srgb, var(--color-accent-cool) 15%, transparent)'
                  : 'var(--color-bg-subtle)',
              color: auth.user?.role === 'admin'
                ? 'var(--color-accent-gold)'
                : auth.user?.role === 'editor'
                  ? 'var(--color-accent-cool)'
                  : 'var(--color-text-secondary)',
            }"
          >
            <component :is="roleIcon[auth.user?.role || 'default']" :size="12" />
            <span class="text-[10px] font-medium uppercase tracking-wider">
              {{ roleLabel[auth.user?.role || 'default'] }}
            </span>
          </div>
        </div>

        <p class="mt-1 text-sm" style="color: var(--color-text-muted)">@{{ auth.user?.username }}</p>

        <p
          v-if="auth.user?.bio"
          class="mt-3 max-w-md text-sm leading-relaxed"
          style="color: var(--color-text-secondary)"
        >
          {{ auth.user.bio }}
        </p>

        <div class="mt-4 flex items-center justify-center gap-6 text-xs sm:justify-start" style="color: var(--color-text-muted)">
          <span><strong style="color: var(--color-text)">{{ activity.savedItems.length }}</strong> guardados</span>
          <span><strong style="color: var(--color-text)">{{ activity.likes.length }}</strong> likes</span>
          <span><strong style="color: var(--color-text)">{{ activity.comments.length }}</strong> comentarios</span>
        </div>

        <button
          @click="startEdit"
          class="mt-4 inline-flex items-center gap-2 border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-200 cursor-pointer hover:opacity-70"
          :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }"
        >
          <Edit3 :size="12" />
          Editar perfil
        </button>
      </div>
    </div>

    <!-- ═══ Edit Modal ═══ -->
    <Teleport to="body">
      <Transition>
        <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="editing = false">
          <div class="w-full max-w-md space-y-5 p-6" :style="{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium" style="font-family: var(--font-heading)">Editar perfil</h3>
              <button @click="editing = false" class="cursor-pointer"><X :size="18" style="color: var(--color-text-muted)" /></button>
            </div>
            <div>
              <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Nombre</label>
              <input v-model="editForm.display_name" class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)' }" />
            </div>
            <div>
              <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Bio</label>
              <textarea v-model="editForm.bio" rows="3" class="w-full border px-3 py-2 text-sm bg-transparent outline-none resize-none focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)' }" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Website</label>
                <input v-model="editForm.website" class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)' }" />
              </div>
              <div>
                <label class="mb-1.5 block text-[10px] font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Instagram</label>
                <input v-model="editForm.instagram" class="w-full border px-3 py-2 text-sm bg-transparent outline-none focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)' }" />
              </div>
            </div>
            <button
              @click="saveEdit"
              class="w-full py-2.5 text-xs font-medium uppercase tracking-wider transition-all duration-200 cursor-pointer"
              :style="{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ═══ Tabs ═══ -->
    <div class="mt-12 flex gap-1 border-b" :style="{ borderColor: 'var(--color-border)' }">
      <button
        v-for="tab in ([
          { id: 'saved', label: 'Guardados', icon: Bookmark },
          { id: 'likes', label: 'Me gusta', icon: Heart },
          { id: 'comments', label: 'Comentarios', icon: MessageCircle },
          { id: 'settings', label: 'Cuenta', icon: User },
        ] as const)"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex items-center gap-2 px-4 py-3 text-xs font-medium uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer"
        :style="{
          borderColor: activeTab === tab.id ? 'var(--color-accent)' : 'transparent',
          color: activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-muted)',
        }"
      >
        <component :is="tab.icon" :size="14" />
        {{ tab.label }}
      </button>
    </div>

    <!-- ═══ Saved Items ═══ -->
    <div v-if="activeTab === 'saved'" class="mt-8">
      <div v-if="activity.savedItems.length === 0" class="py-16 text-center">
        <Bookmark :size="40" class="mx-auto mb-4" style="color: var(--color-text-muted)" />
        <p class="text-sm" style="color: var(--color-text-secondary)">Aún no has guardado nada</p>
        <p class="mt-1 text-xs" style="color: var(--color-text-muted)">Guarda looks, artículos y tendencias para verlos aquí</p>
      </div>

      <!-- Saved Looks -->
      <div v-if="savedLookItems.length > 0" class="mb-10">
        <h3 class="mb-4 text-xs font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Looks guardados</h3>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <RouterLink
            v-for="look in savedLookItems"
            :key="look!.id"
            :to="`/looks/${look!.id}`"
            class="group relative overflow-hidden"
          >
            <div class="aspect-[3/4] overflow-hidden">
              <img :src="look!.image" :alt="look!.title" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <p class="mt-2 text-xs font-medium truncate">{{ look!.title }}</p>
          </RouterLink>
        </div>
      </div>

      <!-- Saved Articles -->
      <div v-if="savedArticleItems.length > 0" class="mb-10">
        <h3 class="mb-4 text-xs font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Artículos guardados</h3>
        <div class="space-y-3">
          <RouterLink
            v-for="article in savedArticleItems"
            :key="article!.id"
            :to="`/articles/${article!.id}`"
            class="group flex gap-4 border p-3 transition-all duration-200 hover:bg-[var(--color-bg-subtle)]"
            :style="{ borderColor: 'var(--color-border)' }"
          >
            <img :src="article!.image" :alt="article!.title" class="h-16 w-16 object-cover shrink-0" />
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">{{ article!.title }}</p>
              <p class="mt-1 text-xs" style="color: var(--color-text-muted)">{{ article!.author }} · {{ article!.readTime }} min</p>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Saved Trends -->
      <div v-if="savedTrendItems.length > 0">
        <h3 class="mb-4 text-xs font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Tendencias guardadas</h3>
        <div class="space-y-3">
          <RouterLink
            v-for="trend in savedTrendItems"
            :key="trend!.id"
            :to="`/trends/${trend!.id}`"
            class="group flex gap-4 border p-3 transition-all duration-200 hover:bg-[var(--color-bg-subtle)]"
            :style="{ borderColor: 'var(--color-border)' }"
          >
            <img :src="trend!.image" :alt="trend!.title" class="h-16 w-16 object-cover shrink-0" />
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">{{ trend!.title }}</p>
              <p class="mt-1 text-xs" style="color: var(--color-text-muted)">{{ trend!.season }} · {{ trend!.popularity }}%</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- ═══ Likes ═══ -->
    <div v-if="activeTab === 'likes'" class="mt-8">
      <div v-if="activity.likes.length === 0" class="py-16 text-center">
        <Heart :size="40" class="mx-auto mb-4" style="color: var(--color-text-muted)" />
        <p class="text-sm" style="color: var(--color-text-secondary)">Sin likes todavía</p>
      </div>

      <div v-if="likedLooks.length > 0" class="mb-10">
        <h3 class="mb-4 text-xs font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Looks</h3>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <RouterLink
            v-for="look in likedLooks"
            :key="look!.id"
            :to="`/looks/${look!.id}`"
            class="group relative overflow-hidden"
          >
            <div class="aspect-[3/4] overflow-hidden">
              <img :src="look!.image" :alt="look!.title" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <p class="mt-2 text-xs font-medium truncate">{{ look!.title }}</p>
          </RouterLink>
        </div>
      </div>

      <div v-if="likedArticles.length > 0">
        <h3 class="mb-4 text-xs font-medium uppercase tracking-wider" style="color: var(--color-text-muted)">Artículos</h3>
        <div class="space-y-3">
          <RouterLink
            v-for="article in likedArticles"
            :key="article!.id"
            :to="`/articles/${article!.id}`"
            class="group flex gap-4 border p-3 transition-all duration-200 hover:bg-[var(--color-bg-subtle)]"
            :style="{ borderColor: 'var(--color-border)' }"
          >
            <img :src="article!.image" :alt="article!.title" class="h-16 w-16 object-cover shrink-0" />
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">{{ article!.title }}</p>
              <p class="mt-1 text-xs" style="color: var(--color-text-muted)">{{ article!.author }}</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- ═══ Comments ═══ -->
    <div v-if="activeTab === 'comments'" class="mt-8">
      <div v-if="activity.comments.length === 0" class="py-16 text-center">
        <MessageCircle :size="40" class="mx-auto mb-4" style="color: var(--color-text-muted)" />
        <p class="text-sm" style="color: var(--color-text-secondary)">No has hecho comentarios aún</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="comment in activity.comments"
          :key="comment.id"
          class="flex items-start justify-between border p-4"
          :style="{ borderColor: 'var(--color-border)' }"
        >
          <div>
            <p class="text-sm">{{ comment.text }}</p>
            <p class="mt-1 text-[10px] uppercase tracking-wider" style="color: var(--color-text-muted)">
              {{ comment.targetType }} · {{ formatDate(comment.createdAt) }}
            </p>
          </div>
          <button @click="activity.removeComment(comment.id)" class="shrink-0 ml-3 cursor-pointer">
            <X :size="14" style="color: var(--color-text-muted)" />
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ Account Settings ═══ -->
    <div v-if="activeTab === 'settings'" class="mt-8 space-y-4">
      <div
        class="border p-6"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
      >
        <h3 class="mb-4 text-xs font-medium uppercase tracking-widest" style="color: var(--color-text-muted)">
          Información de la cuenta
        </h3>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between">
            <dt style="color: var(--color-text-secondary)">Email</dt>
            <dd>{{ auth.user?.email }}</dd>
          </div>
          <div class="flex justify-between">
            <dt style="color: var(--color-text-secondary)">Miembro desde</dt>
            <dd>{{ auth.user?.created_at ? formatDate(auth.user.created_at) : '' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt style="color: var(--color-text-secondary)">Email verificado</dt>
            <dd>{{ auth.user?.email_verified ? 'Sí' : 'No' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Admin section -->
      <RouterLink
        v-if="auth.isAdmin"
        to="/admin"
        class="flex items-center gap-3 border p-6 transition-all duration-200 hover:bg-[var(--color-bg-subtle)]"
        :style="{ borderColor: 'var(--color-accent-gold)', backgroundColor: 'color-mix(in srgb, var(--color-accent-gold) 5%, var(--color-bg-elevated))' }"
      >
        <Shield :size="18" style="color: var(--color-accent-gold)" />
        <div>
          <h3 class="text-sm font-medium" style="color: var(--color-accent-gold)">Panel de Administración</h3>
          <p class="mt-0.5 text-xs" style="color: var(--color-text-secondary)">Gestionar usuarios, contenido y configuración</p>
        </div>
      </RouterLink>

      <RouterLink
        v-else-if="auth.isEditor"
        to="/admin"
        class="flex items-center gap-3 border p-6 transition-all duration-200 hover:bg-[var(--color-bg-subtle)]"
        :style="{ borderColor: 'var(--color-accent-cool)', backgroundColor: 'color-mix(in srgb, var(--color-accent-cool) 5%, var(--color-bg-elevated))' }"
      >
        <Edit3 :size="18" style="color: var(--color-accent-cool)" />
        <div>
          <h3 class="text-sm font-medium" style="color: var(--color-accent-cool)">Panel de Editor</h3>
          <p class="mt-0.5 text-xs" style="color: var(--color-text-secondary)">Crear y editar artículos y looks</p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
