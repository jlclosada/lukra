<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const formError = ref('')
const revealed = ref(false)

onMounted(() => {
  requestAnimationFrame(() => (revealed.value = true))
})

async function handleLogin() {
  formError.value = ''
  try {
    await auth.login({ email: email.value, password: password.value })
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e: any) {
    formError.value = e?.data?.detail || 'Credenciales inválidas. Inténtalo de nuevo.'
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-73px)]">
    <!-- Left: Editorial image -->
    <div
      class="hidden lg:flex lg:w-1/2 items-end p-12 transition-opacity duration-1000"
      :class="revealed ? 'opacity-100' : 'opacity-0'"
      style="
        background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%),
          url('https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80') center/cover no-repeat;
      "
    >
      <div class="text-white max-w-lg">
        <p class="text-5xl leading-tight font-light" style="font-family: var(--font-display)">
          La moda es el lenguaje que se crea en la ropa para interpretar la realidad.
        </p>
        <p class="mt-4 text-sm tracking-wider uppercase opacity-70">— Karl Lagerfeld</p>
      </div>
    </div>

    <!-- Right: Login form -->
    <div class="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
      <div class="w-full max-w-md">
        <!-- Brand -->
        <div
          class="mb-12 text-center transition-all duration-700"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
        >
          <h1
            class="text-4xl font-medium tracking-[0.2em] uppercase"
            style="font-family: var(--font-heading)"
          >
            LUKRA
          </h1>
          <p class="mt-3 text-sm" style="color: var(--color-text-secondary)">
            Bienvenido de nuevo
          </p>
        </div>

        <!-- Error -->
        <Transition name="slide-fade">
          <div
            v-if="formError"
            class="mb-6 flex items-center gap-3 rounded-none border px-4 py-3 text-sm"
            :style="{
              borderColor: 'var(--color-error)',
              color: 'var(--color-error)',
              backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
            }"
          >
            <AlertCircle :size="18" class="shrink-0" />
            {{ formError }}
          </div>
        </Transition>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email -->
          <div
            class="transition-all duration-700"
            :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
            style="transition-delay: 100ms"
          >
            <label
              class="mb-2 block text-xs font-medium uppercase tracking-widest"
              style="color: var(--color-text-secondary)"
            >
              Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="tu@email.com"
              class="login-input w-full border-b-2 bg-transparent px-0 py-3 text-base outline-none transition-all duration-300 placeholder:opacity-40"
              :style="{ borderColor: 'var(--color-border)' }"
            />
          </div>

          <!-- Password -->
          <div
            class="transition-all duration-700"
            :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
            style="transition-delay: 200ms"
          >
            <label
              class="mb-2 block text-xs font-medium uppercase tracking-widest"
              style="color: var(--color-text-secondary)"
            >
              Contraseña
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="login-input w-full border-b-2 bg-transparent px-0 py-3 pr-10 text-base outline-none transition-all duration-300 placeholder:opacity-40"
                :style="{ borderColor: 'var(--color-border)' }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-0 top-1/2 -translate-y-1/2 p-2 opacity-40 transition-all duration-200 hover:opacity-100 hover:scale-110 cursor-pointer"
              >
                <Eye v-if="!showPassword" :size="18" />
                <EyeOff v-else :size="18" />
              </button>
            </div>
          </div>

          <!-- Submit -->
          <div
            class="transition-all duration-700"
            :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
            style="transition-delay: 300ms"
          >
            <button
              type="submit"
              :disabled="auth.loading"
              class="group mt-8 flex w-full items-center justify-center gap-3 py-4 text-sm font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer"
              :style="{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg)',
              }"
            >
              <span v-if="auth.loading">Entrando...</span>
              <template v-else>
                Iniciar sesión
                <ArrowRight :size="16" class="transition-transform duration-300 group-hover:translate-x-1.5" />
              </template>
            </button>
          </div>
        </form>

        <!-- Divider -->
        <div
          class="my-10 flex items-center gap-4 transition-all duration-700"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
          style="transition-delay: 400ms"
        >
          <div class="h-px flex-1" :style="{ backgroundColor: 'var(--color-border)' }"></div>
          <span class="text-xs uppercase tracking-wider" style="color: var(--color-text-muted)">
            ¿Eres nuevo?
          </span>
          <div class="h-px flex-1" :style="{ backgroundColor: 'var(--color-border)' }"></div>
        </div>

        <!-- Register link -->
        <div
          class="transition-all duration-700"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
          style="transition-delay: 500ms"
        >
          <RouterLink
            to="/register"
            class="flex w-full items-center justify-center gap-3 border-2 py-4 text-sm font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] hover:border-[var(--color-accent)] hover:shadow-lg cursor-pointer"
            :style="{
              borderColor: 'var(--color-accent)',
              color: 'var(--color-accent)',
            }"
          >
            Crear cuenta
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-input:focus {
  border-color: var(--color-accent) !important;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}
</style>
