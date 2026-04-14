<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, X } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const username = ref('')
const displayName = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const formError = ref('')
const step = ref<1 | 2>(1)
const revealed = ref(false)

onMounted(() => {
  requestAnimationFrame(() => (revealed.value = true))
})

// Password validation
const hasMinLength = computed(() => password.value.length >= 8)
const hasUppercase = computed(() => /[A-Z]/.test(password.value))
const hasNumber = computed(() => /[0-9]/.test(password.value))
const passwordsMatch = computed(() => password.value === confirmPassword.value && confirmPassword.value.length > 0)
const passwordValid = computed(() => hasMinLength.value && hasUppercase.value && hasNumber.value)

// Username validation
const usernameValid = computed(() => {
  const v = username.value.trim().toLowerCase()
  return v.length >= 3 && v.length <= 30 && /^[a-z0-9_]+$/.test(v)
})

const step1Valid = computed(() => email.value.includes('@') && usernameValid.value)
const step2Valid = computed(() => passwordValid.value && passwordsMatch.value)

function nextStep() {
  if (step1Valid.value) step.value = 2
}

async function handleRegister() {
  formError.value = ''
  if (!step2Valid.value) return

  try {
    await auth.register({
      email: email.value,
      username: username.value.trim().toLowerCase(),
      password: password.value,
      display_name: displayName.value || undefined,
    })
    router.push('/')
  } catch (e: any) {
    formError.value = e?.data?.detail || 'Error al crear la cuenta. Inténtalo de nuevo.'
    if (formError.value.toLowerCase().includes('email') || formError.value.toLowerCase().includes('username')) {
      step.value = 1
    }
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-73px)]">
    <!-- Left: Form -->
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
            Únete a la comunidad
          </p>
        </div>

        <!-- Step indicator -->
        <div
          class="mb-10 flex items-center justify-center gap-3 transition-all duration-700"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
          style="transition-delay: 50ms"
        >
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all"
            :style="{
              backgroundColor: step === 1 ? 'var(--color-accent)' : 'var(--color-bg-subtle)',
              color: step === 1 ? 'var(--color-bg)' : 'var(--color-text-muted)',
            }"
          >
            <Check v-if="step > 1" :size="14" />
            <span v-else>1</span>
          </div>
          <div class="h-px w-12" :style="{ backgroundColor: 'var(--color-border)' }"></div>
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all"
            :style="{
              backgroundColor: step === 2 ? 'var(--color-accent)' : 'var(--color-bg-subtle)',
              color: step === 2 ? 'var(--color-bg)' : 'var(--color-text-muted)',
            }"
          >
            2
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="formError"
          class="mb-6 flex items-center gap-3 border px-4 py-3 text-sm"
          :style="{
            borderColor: 'var(--color-error)',
            color: 'var(--color-error)',
            backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
          }"
        >
          <AlertCircle :size="18" class="shrink-0" />
          {{ formError }}
        </div>

        <!-- Step 1: Account details -->
        <form v-if="step === 1" @submit.prevent="nextStep" class="space-y-6">
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
              class="register-input w-full border-b-2 bg-transparent px-0 py-3 text-base outline-none transition-all duration-300 placeholder:opacity-40"
              :style="{ borderColor: 'var(--color-border)' }"
            />
          </div>

          <div
            class="transition-all duration-700"
            :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
            style="transition-delay: 200ms"
          >
            <label
              class="mb-2 block text-xs font-medium uppercase tracking-widest"
              style="color: var(--color-text-secondary)"
            >
              Nombre de usuario
            </label>
            <input
              v-model="username"
              type="text"
              required
              autocomplete="username"
              placeholder="tu_username"
              class="register-input w-full border-b-2 bg-transparent px-0 py-3 text-base outline-none transition-all duration-300 placeholder:opacity-40"
              :style="{ borderColor: 'var(--color-border)' }"
            />
            <p
              v-if="username && !usernameValid"
              class="mt-1.5 text-xs"
              style="color: var(--color-error)"
            >
              3-30 caracteres. Solo letras minúsculas, números y guiones bajos.
            </p>
          </div>

          <div
            class="transition-all duration-700"
            :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
            style="transition-delay: 300ms"
          >
            <label
              class="mb-2 block text-xs font-medium uppercase tracking-widest"
              style="color: var(--color-text-secondary)"
            >
              Nombre para mostrar
              <span class="normal-case tracking-normal opacity-50">(opcional)</span>
            </label>
            <input
              v-model="displayName"
              type="text"
              autocomplete="name"
              placeholder="Tu Nombre"
              class="register-input w-full border-b-2 bg-transparent px-0 py-3 text-base outline-none transition-all duration-300 placeholder:opacity-40"
              :style="{ borderColor: 'var(--color-border)' }"
            />
          </div>

          <div
            class="transition-all duration-700"
            :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
            style="transition-delay: 400ms"
          >
            <button
              type="submit"
              :disabled="!step1Valid"
              class="group mt-8 flex w-full items-center justify-center gap-3 py-4 text-sm font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer"
              :style="{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg)',
              }"
            >
              Continuar
              <ArrowRight :size="16" class="transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
          </div>
        </form>

        <!-- Step 2: Password -->
        <form v-if="step === 2" @submit.prevent="handleRegister" class="space-y-6">
          <div>
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
                autocomplete="new-password"
                placeholder="••••••••"
                class="register-input w-full border-b-2 bg-transparent px-0 py-3 pr-10 text-base outline-none transition-all duration-300 placeholder:opacity-40"
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

            <!-- Password requirements -->
            <div class="mt-3 space-y-1.5">
              <div class="flex items-center gap-2 text-xs" v-for="rule in [
                { valid: hasMinLength, label: 'Mínimo 8 caracteres' },
                { valid: hasUppercase, label: 'Al menos una mayúscula' },
                { valid: hasNumber, label: 'Al menos un número' },
              ]" :key="rule.label">
                <Check v-if="rule.valid" :size="12" style="color: var(--color-success)" />
                <X v-else :size="12" style="color: var(--color-text-muted)" />
                <span :style="{ color: rule.valid ? 'var(--color-success)' : 'var(--color-text-muted)' }">
                  {{ rule.label }}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label
              class="mb-2 block text-xs font-medium uppercase tracking-widest"
              style="color: var(--color-text-secondary)"
            >
              Confirmar contraseña
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              autocomplete="new-password"
              placeholder="••••••••"
              class="register-input w-full border-b-2 bg-transparent px-0 py-3 text-base outline-none transition-all duration-300 placeholder:opacity-40"
              :style="{ borderColor: 'var(--color-border)' }"
            />
            <p
              v-if="confirmPassword && !passwordsMatch"
              class="mt-1.5 text-xs"
              style="color: var(--color-error)"
            >
              Las contraseñas no coinciden
            </p>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="step = 1"
              class="flex items-center justify-center border-2 px-6 py-4 text-sm font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:bg-[var(--color-bg-subtle)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }"
            >
              Atrás
            </button>
            <button
              type="submit"
              :disabled="!step2Valid || auth.loading"
              class="group flex flex-1 items-center justify-center gap-3 py-4 text-sm font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer"
              :style="{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg)',
              }"
            >
              <span v-if="auth.loading">Creando cuenta...</span>
              <template v-else>
                Crear cuenta
                <ArrowRight :size="16" class="transition-transform duration-300 group-hover:translate-x-1.5" />
              </template>
            </button>
          </div>
        </form>

        <!-- Divider -->
        <div class="my-10 flex items-center gap-4">
          <div class="h-px flex-1" :style="{ backgroundColor: 'var(--color-border)' }"></div>
          <span class="text-xs uppercase tracking-wider" style="color: var(--color-text-muted)">
            ¿Ya tienes cuenta?
          </span>
          <div class="h-px flex-1" :style="{ backgroundColor: 'var(--color-border)' }"></div>
        </div>

        <RouterLink
          to="/login"
          class="flex w-full items-center justify-center gap-3 border-2 py-4 text-sm font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] hover:border-[var(--color-accent)] hover:shadow-lg cursor-pointer"
          :style="{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }"
        >
          Iniciar sesión
        </RouterLink>
      </div>
    </div>

    <!-- Right: Editorial image -->
    <div
      class="hidden lg:flex lg:w-1/2 items-end p-12 transition-opacity duration-1000"
      :class="revealed ? 'opacity-100' : 'opacity-0'"
      style="
        background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%),
          url('https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80') center/cover no-repeat;
      "
    >
      <div class="text-white max-w-lg">
        <p class="text-5xl leading-tight font-light" style="font-family: var(--font-display)">
          La moda no es algo que existe solo en los vestidos. La moda está en el cielo, en la calle.
        </p>
        <p class="mt-4 text-sm tracking-wider uppercase opacity-70">— Coco Chanel</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-input:focus {
  border-color: var(--color-accent) !important;
}
</style>
