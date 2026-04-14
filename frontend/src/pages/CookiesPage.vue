<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const cookiePrefs = ref({
  necessary: true,
  analytics: false,
  marketing: false,
})

const prefsSaved = ref(false)

function savePreferences() {
  localStorage.setItem('lukra_cookies', JSON.stringify(cookiePrefs.value))
  prefsSaved.value = true
  setTimeout(() => (prefsSaved.value = false), 3000)
}
</script>

<template>
  <main class="min-h-screen" style="background-color: var(--color-bg); color: var(--color-text)">
    <div class="mx-auto max-w-3xl px-6 py-20">
      <RouterLink
        to="/"
        class="mb-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider transition-opacity hover:opacity-60"
        style="color: var(--color-text-muted)"
      >
        <ArrowLeft :size="14" />
        Volver al inicio
      </RouterLink>

      <h1 class="text-4xl font-light tracking-tight sm:text-5xl" style="font-family: var(--font-heading)">
        Política de Cookies
      </h1>
      <p class="mt-4 text-sm" style="color: var(--color-text-muted)">Última actualización: abril 2026</p>

      <div class="mt-12 space-y-8 text-sm leading-relaxed" style="color: var(--color-text-secondary)">
        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">¿Qué son las cookies?</h2>
          <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Nos permiten recordar sus preferencias, mejorar su experiencia de navegación y analizar el uso de la plataforma.</p>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">Tipos de cookies que utilizamos</h2>

          <div class="mt-4 space-y-4">
            <div
              class="border p-5"
              :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium" style="color: var(--color-text)">Cookies necesarias</h3>
                  <p class="mt-1 text-xs" style="color: var(--color-text-muted)">Esenciales para el funcionamiento de la plataforma</p>
                </div>
                <div
                  class="relative h-6 w-11 rounded-full opacity-50"
                  style="background-color: var(--color-accent)"
                >
                  <span class="absolute top-0.5 left-[22px] h-5 w-5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              <p class="mt-3 text-xs">Incluyen cookies de sesión, autenticación (JWT token) y configuración del sitio. Sin estas cookies, la plataforma no puede funcionar correctamente. No se pueden desactivar.</p>
            </div>

            <div
              class="border p-5"
              :style="{ borderColor: 'var(--color-border)' }"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium" style="color: var(--color-text)">Cookies analíticas</h3>
                  <p class="mt-1 text-xs" style="color: var(--color-text-muted)">Nos ayudan a entender cómo usa la plataforma</p>
                </div>
                <button
                  @click="cookiePrefs.analytics = !cookiePrefs.analytics"
                  class="relative h-6 w-11 rounded-full transition-all duration-200 cursor-pointer"
                  :style="{ backgroundColor: cookiePrefs.analytics ? 'var(--color-accent)' : 'var(--color-border)' }"
                >
                  <span
                    class="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-200 shadow-sm"
                    :class="cookiePrefs.analytics ? 'left-[22px]' : 'left-0.5'"
                  />
                </button>
              </div>
              <p class="mt-3 text-xs">Recopilan información sobre páginas visitadas, tiempo de permanencia y patrones de navegación. Estos datos son anónimos y se utilizan únicamente para mejorar la plataforma.</p>
            </div>

            <div
              class="border p-5"
              :style="{ borderColor: 'var(--color-border)' }"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium" style="color: var(--color-text)">Cookies de marketing</h3>
                  <p class="mt-1 text-xs" style="color: var(--color-text-muted)">Permiten personalizar el contenido mostrado</p>
                </div>
                <button
                  @click="cookiePrefs.marketing = !cookiePrefs.marketing"
                  class="relative h-6 w-11 rounded-full transition-all duration-200 cursor-pointer"
                  :style="{ backgroundColor: cookiePrefs.marketing ? 'var(--color-accent)' : 'var(--color-border)' }"
                >
                  <span
                    class="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-200 shadow-sm"
                    :class="cookiePrefs.marketing ? 'left-[22px]' : 'left-0.5'"
                  />
                </button>
              </div>
              <p class="mt-3 text-xs">Se utilizan para mostrar contenido y recomendaciones relevantes según sus intereses. Pueden ser compartidas con terceros para publicidad personalizada.</p>
            </div>
          </div>
        </section>

        <div class="pt-4">
          <button
            @click="savePreferences"
            class="inline-flex items-center gap-2 px-6 py-3 text-xs font-medium uppercase tracking-wider transition-all duration-200 cursor-pointer"
            :style="{
              backgroundColor: prefsSaved ? 'var(--color-success)' : 'var(--color-accent)',
              color: 'var(--color-bg)',
            }"
          >
            {{ prefsSaved ? '✓ Preferencias guardadas' : 'Guardar preferencias' }}
          </button>
        </div>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">Cómo gestionar las cookies</h2>
          <p>Además de las opciones anteriores, puede gestionar las cookies desde la configuración de su navegador. Tenga en cuenta que deshabilitar ciertas cookies puede afectar al funcionamiento de la plataforma.</p>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">Contacto</h2>
          <p>Si tiene preguntas sobre nuestra política de cookies, escríbanos a <a href="mailto:hello@lukra.style" class="underline transition-opacity hover:opacity-70" style="color: var(--color-accent-warm)">hello@lukra.style</a>.</p>
        </section>
      </div>
    </div>
  </main>
</template>
