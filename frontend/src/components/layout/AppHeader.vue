<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { LogOut, Menu, Settings, X } from 'lucide-vue-next'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const auth = useAuthStore()
const mobileOpen = ref(false)

const navLinks = [
  { to: '/looks', label: 'Looks' },
  { to: '/articles', label: 'Artículos' },
  { to: '/trends', label: 'Tendencias' },
  { to: '/about', label: 'Nosotros' },
]

function handleLogout() {
  auth.logout()
  mobileOpen.value = false
}

function closeMobile() {
  mobileOpen.value = false
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
    <nav class="flex w-full items-center px-6 py-4 sm:px-10 lg:px-16">
      <!-- Left: Logo -->
      <RouterLink
        to="/"
        class="shrink-0 text-xl font-medium tracking-[0.3em] uppercase transition-opacity duration-200 hover:opacity-60"
        style="font-family: var(--font-heading)"
      >
        LUKRA
      </RouterLink>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Center: Navigation -->
      <div class="hidden items-center gap-10 md:flex">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="relative text-xs font-medium uppercase tracking-[0.2em] transition-opacity duration-200 hover:opacity-60 link-underline"
          style="color: var(--color-text)"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Right: Actions -->
      <div class="shrink-0 flex items-center gap-5">
        <!-- Admin link -->
        <RouterLink
          v-if="auth.isEditor"
          to="/admin"
          class="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-200 hover:opacity-60 cursor-pointer md:flex"
          style="color: var(--color-accent-gold)"
        >
          <Settings :size="14" />
          Panel
        </RouterLink>

        <!-- Separator -->
        <div v-if="auth.isEditor && auth.isAuthenticated" class="hidden h-4 w-px md:block" style="background-color: var(--color-border)" />

        <template v-if="auth.isAuthenticated">
          <RouterLink
            to="/profile"
            class="flex items-center gap-2 transition-opacity duration-200 hover:opacity-60 cursor-pointer"
          >
            <div
              class="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold uppercase"
              :style="{
                backgroundColor: auth.user?.role === 'admin' ? 'var(--color-accent-gold)' : auth.user?.role === 'editor' ? 'var(--color-accent-cool)' : 'var(--color-bg-subtle)',
                color: auth.user?.role !== 'default' ? '#fff' : 'var(--color-text-muted)',
              }"
            >
              {{ (auth.user?.display_name || auth.user?.username || 'U').charAt(0) }}
            </div>
            <span class="hidden text-xs font-medium sm:inline">{{ auth.user?.display_name || auth.user?.username }}</span>
          </RouterLink>

          <button
            @click="handleLogout"
            class="flex items-center gap-1 text-xs transition-opacity duration-200 hover:opacity-60 cursor-pointer"
            style="color: var(--color-text-muted)"
            title="Cerrar sesión"
          >
            <LogOut :size="15" />
          </button>
        </template>

        <template v-else>
          <RouterLink
            to="/login"
            class="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] transition-opacity duration-200 hover:opacity-60 cursor-pointer sm:flex"
            style="color: var(--color-text-secondary)"
          >
            Entrar
          </RouterLink>
          <RouterLink
            to="/register"
            class="hidden px-5 py-2 text-xs font-medium tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer hover:opacity-85 sm:inline-block"
            :style="{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-bg)',
            }"
          >
            Registro
          </RouterLink>
        </template>

        <!-- Mobile menu toggle -->
        <button
          @click="mobileOpen = !mobileOpen"
          class="flex h-9 w-9 items-center justify-center cursor-pointer transition-opacity duration-200 hover:opacity-60 md:hidden"
        >
          <component :is="mobileOpen ? X : Menu" :size="20" />
        </button>
      </div>
    </nav>

    <!-- Mobile menu -->
    <Transition name="mobile-menu">
      <div
        v-if="mobileOpen"
        class="border-t px-6 py-6 md:hidden"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }"
      >
        <div class="flex flex-col gap-4">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm font-medium uppercase tracking-[0.15em] transition-opacity duration-200 hover:opacity-60"
            @click="closeMobile"
          >
            {{ link.label }}
          </RouterLink>

          <RouterLink
            v-if="auth.isEditor"
            to="/admin"
            class="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] transition-opacity duration-200 hover:opacity-60"
            style="color: var(--color-accent-gold)"
            @click="closeMobile"
          >
            <Settings :size="14" />
            Panel Admin
          </RouterLink>

          <div class="my-2 border-t" :style="{ borderColor: 'var(--color-border)' }" />

          <template v-if="!auth.isAuthenticated">
            <RouterLink to="/login" class="text-sm font-medium" @click="closeMobile">Entrar</RouterLink>
            <RouterLink
              to="/register"
              class="inline-block px-5 py-2.5 text-center text-sm font-medium tracking-wider uppercase"
              :style="{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }"
              @click="closeMobile"
            >
              Registro
            </RouterLink>
          </template>
          <template v-else>
            <button @click="handleLogout" class="text-left text-sm cursor-pointer" style="color: var(--color-text-secondary)">
              Cerrar sesión
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.mobile-menu-enter-active {
  animation: slideDown 0.25s ease-out;
}
.mobile-menu-leave-active {
  animation: slideDown 0.2s ease-in reverse;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
