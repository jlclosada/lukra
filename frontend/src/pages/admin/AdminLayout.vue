<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import {
    BarChart3,
    BookOpen,
    Camera,
    ChevronLeft,
    Home,
    LayoutDashboard,
    LogOut,
    Settings,
    ShoppingBag,
    TrendingUp,
    Users
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const collapsed = ref(false)

const navItems = computed(() => {
  const items = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/looks', label: 'Looks', icon: Camera, exact: false },
    { to: '/admin/articles', label: 'Artículos', icon: BookOpen, exact: false },
    { to: '/admin/trends', label: 'Tendencias', icon: TrendingUp, exact: false },
    { to: '/admin/brands', label: 'Marcas', icon: ShoppingBag, exact: false },
  ]
  if (auth.isAdmin) {
    items.push({ to: '/admin/users', label: 'Usuarios', icon: Users, exact: false })
    items.push({ to: '/admin/settings', label: 'Configuración', icon: Settings, exact: false })
  }
  return items
})

function isActive(item: { to: string; exact: boolean }) {
  if (item.exact) return route.path === item.to
  return route.path.startsWith(item.to)
}

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="flex h-screen overflow-hidden" style="background-color: var(--color-bg)">
    <!-- Sidebar -->
    <aside
      class="flex shrink-0 flex-col border-r transition-all duration-300"
      :class="collapsed ? 'w-[72px]' : 'w-[260px]'"
      :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center justify-between border-b px-5" :style="{ borderColor: 'var(--color-border)' }">
        <RouterLink
          to="/admin"
          class="flex items-center gap-3 transition-opacity duration-200 hover:opacity-70"
        >
          <BarChart3 :size="20" style="color: var(--color-accent-gold)" />
          <span
            v-if="!collapsed"
            class="text-sm font-medium uppercase tracking-[0.2em]"
            style="font-family: var(--font-heading)"
          >
            Lukra
          </span>
        </RouterLink>
        <button
          @click="collapsed = !collapsed"
          class="flex h-7 w-7 items-center justify-center rounded transition-all duration-200 cursor-pointer hover:bg-[var(--color-bg-subtle)]"
        >
          <ChevronLeft
            :size="16"
            class="transition-transform duration-300"
            :class="collapsed ? 'rotate-180' : ''"
            style="color: var(--color-text-muted)"
          />
        </button>
      </div>

      <!-- Nav items -->
      <nav class="flex-1 space-y-1 px-3 py-4">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer"
          :class="collapsed ? 'justify-center' : ''"
          :style="{
            backgroundColor: isActive(item) ? 'var(--color-bg-subtle)' : 'transparent',
            color: isActive(item) ? 'var(--color-text)' : 'var(--color-text-secondary)',
          }"
          :title="collapsed ? item.label : undefined"
        >
          <component
            :is="item.icon"
            :size="18"
            :style="{ color: isActive(item) ? 'var(--color-accent-warm)' : 'var(--color-text-muted)' }"
          />
          <span v-if="!collapsed">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- Bottom section -->
      <div class="border-t px-3 py-4" :style="{ borderColor: 'var(--color-border)' }">
        <RouterLink
          to="/"
          class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200 cursor-pointer hover:bg-[var(--color-bg-subtle)]"
          :class="collapsed ? 'justify-center' : ''"
          style="color: var(--color-text-secondary)"
        >
          <Home :size="18" style="color: var(--color-text-muted)" />
          <span v-if="!collapsed">Volver al sitio</span>
        </RouterLink>
        <button
          @click="handleLogout"
          class="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200 cursor-pointer hover:bg-[var(--color-bg-subtle)]"
          :class="collapsed ? 'justify-center' : ''"
          style="color: var(--color-text-secondary)"
        >
          <LogOut :size="18" style="color: var(--color-text-muted)" />
          <span v-if="!collapsed">Cerrar sesión</span>
        </button>

        <!-- User info -->
        <div
          v-if="!collapsed"
          class="mt-3 rounded-md px-3 py-3"
          style="background-color: var(--color-bg-subtle)"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-xs font-medium uppercase"
              :style="{
                backgroundColor: auth.user?.role === 'admin' ? 'var(--color-accent-gold)' : 'var(--color-accent-cool)',
                color: '#fff',
              }"
            >
              <img v-if="auth.user?.avatar_url" :src="auth.user.avatar_url" class="h-full w-full object-cover" />
              <span v-else>{{ (auth.user?.display_name || auth.user?.username || 'U').charAt(0) }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ auth.user?.display_name || auth.user?.username }}</p>
              <p class="truncate text-[11px]" style="color: var(--color-text-muted)">{{ auth.user?.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>
