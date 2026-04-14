<script setup lang="ts">
import { ArrowRight, Instagram, Mail, MapPin, Twitter } from 'lucide-vue-next'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const email = ref('')
const subscribed = ref(false)

function subscribe() {
  if (email.value.includes('@')) {
    subscribed.value = true
    email.value = ''
    setTimeout(() => (subscribed.value = false), 4000)
  }
}

const year = new Date().getFullYear()
</script>

<template>
  <footer style="background-color: var(--color-accent); color: var(--color-bg)">
    <!-- Top section -->
    <div class="border-b border-white/10 px-6 py-16 sm:px-12 lg:px-24">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Brand -->
        <div class="lg:col-span-1">
          <RouterLink to="/" class="text-3xl font-light tracking-tight" style="font-family: var(--font-display)">
            Lukra
          </RouterLink>
          <p class="mt-4 text-sm leading-relaxed opacity-50">
            La plataforma donde la moda se vive, se comparte y se reinventa. Inspiración editorial para el mundo real.
          </p>
          <div class="mt-6 flex items-center gap-4">
            <a href="#" class="flex h-9 w-9 items-center justify-center border border-white/20 transition-all duration-300 hover:bg-white hover:text-black">
              <Instagram :size="15" />
            </a>
            <a href="#" class="flex h-9 w-9 items-center justify-center border border-white/20 transition-all duration-300 hover:bg-white hover:text-black">
              <Twitter :size="15" />
            </a>
            <a href="#" class="flex h-9 w-9 items-center justify-center border border-white/20 transition-all duration-300 hover:bg-white hover:text-black">
              <Mail :size="15" />
            </a>
          </div>
        </div>

        <!-- Navigation -->
        <div>
          <p class="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] opacity-40">Explorar</p>
          <nav class="space-y-3">
            <RouterLink to="/looks" class="block text-sm opacity-60 transition-opacity hover:opacity-100">Looks</RouterLink>
            <RouterLink to="/articles" class="block text-sm opacity-60 transition-opacity hover:opacity-100">Artículos</RouterLink>
            <RouterLink to="/trends" class="block text-sm opacity-60 transition-opacity hover:opacity-100">Tendencias</RouterLink>
            <RouterLink to="/about" class="block text-sm opacity-60 transition-opacity hover:opacity-100">Sobre Lukra</RouterLink>
          </nav>
        </div>

        <!-- Info -->
        <div>
          <p class="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] opacity-40">Información</p>
          <nav class="space-y-3">
            <a href="#" class="block text-sm opacity-60 transition-opacity hover:opacity-100">Política de privacidad</a>
            <a href="#" class="block text-sm opacity-60 transition-opacity hover:opacity-100">Términos de uso</a>
            <a href="#" class="block text-sm opacity-60 transition-opacity hover:opacity-100">Cookies</a>
            <a href="#" class="block text-sm opacity-60 transition-opacity hover:opacity-100">Contacto</a>
          </nav>
        </div>

        <!-- Newsletter -->
        <div>
          <p class="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] opacity-40">Newsletter</p>
          <p class="mb-4 text-sm leading-relaxed opacity-50">
            Recibe las últimas tendencias y artículos en tu correo.
          </p>

          <Transition mode="out-in">
            <div v-if="!subscribed" class="flex">
              <input
                v-model="email"
                type="email"
                placeholder="tu@email.com"
                class="flex-1 border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/50 transition-colors"
                @keydown.enter="subscribe"
              />
              <button
                @click="subscribe"
                class="flex items-center justify-center border border-white/20 border-l-0 px-4 transition-all duration-300 hover:bg-white hover:text-black cursor-pointer"
              >
                <ArrowRight :size="16" />
              </button>
            </div>
            <div v-else class="flex items-center gap-2 py-2.5 text-sm">
              <span class="text-green-300">✓</span>
              <span class="opacity-70">¡Suscrito correctamente!</span>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="px-6 py-6 sm:px-12 lg:px-24">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p class="text-[11px] opacity-30">
          © {{ year }} Lukra. Todos los derechos reservados.
        </p>
        <div class="flex items-center gap-2 text-[11px] opacity-30">
          <MapPin :size="11" />
          <span>Madrid, España</span>
        </div>
      </div>
    </div>
  </footer>
</template>
