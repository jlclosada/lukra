<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { LogIn, LogOut, User } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const auth = useAuthStore()

function handleLogout() {
  auth.logout()
}
</script>

<template>
  <header
    class="sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300"
    :style="{
      backgroundColor: 'color-mix(in srgb, var(--color-bg) 85%, transparent)',
      borderColor: 'var(--color-border)',
    }"
  >
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <!-- Logo -->
      <RouterLink
        to="/"
        class="text-xl font-medium tracking-[0.3em] uppercase"
        style="font-family: var(--font-heading)"
      >
        LUKRA
      </RouterLink>

      <!-- Navigation -->
      <div class="flex items-center gap-6">
        <template v-if="auth.isAuthenticated">
          <RouterLink
            to="/profile"
            class="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          >
            <User :size="18" />
            <span class="hidden sm:inline">{{ auth.user?.display_name || auth.user?.username }}</span>
          </RouterLink>

          <span
            v-if="auth.user?.role !== 'default'"
            class="rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider"
            :style="{
              backgroundColor: auth.user?.role === 'admin' ? 'var(--color-accent-gold)' : 'var(--color-accent-cool)',
              color: '#fff',
            }"
          >
            {{ auth.user?.role }}
          </span>

          <button
            @click="handleLogout"
            class="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
            style="color: var(--color-text-secondary)"
          >
            <LogOut :size="16" />
            <span class="hidden sm:inline">Salir</span>
          </button>
        </template>

        <template v-else>
          <RouterLink
            to="/login"
            class="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          >
            <LogIn :size="16" />
            Entrar
          </RouterLink>
          <RouterLink
            to="/register"
            class="rounded-none px-5 py-2 text-sm font-medium tracking-wider uppercase transition-all duration-200"
            :style="{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-bg)',
            }"
          >
            Registro
          </RouterLink>
        </template>
      </div>
    </nav>
  </header>
</template>
