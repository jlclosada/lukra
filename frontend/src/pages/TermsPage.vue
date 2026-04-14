<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
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
        Términos de Uso
      </h1>
      <p class="mt-4 text-sm" style="color: var(--color-text-muted)">Última actualización: abril 2026</p>

      <div class="mt-12 space-y-8 text-sm leading-relaxed" style="color: var(--color-text-secondary)">
        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">1. Aceptación de los términos</h2>
          <p>Al acceder y utilizar Lukra, usted acepta estos Términos de Uso en su totalidad. Si no está de acuerdo con alguna de las condiciones, le rogamos que no utilice la plataforma.</p>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">2. Descripción del servicio</h2>
          <p>Lukra es una plataforma de moda y tendencias que ofrece contenido editorial, galería de looks, análisis de tendencias y herramientas de comunidad. El servicio está disponible para usuarios registrados y visitantes, con funcionalidades diferenciadas.</p>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">3. Registro y cuenta</h2>
          <ul class="ml-6 list-disc space-y-1">
            <li>Debe proporcionar información veraz y actualizada al registrarse.</li>
            <li>Es responsable de mantener la confidencialidad de su contraseña.</li>
            <li>Debe notificarnos inmediatamente cualquier uso no autorizado de su cuenta.</li>
            <li>Nos reservamos el derecho de suspender o eliminar cuentas que incumplan estos términos.</li>
          </ul>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">4. Contenido del usuario</h2>
          <p>Al publicar contenido en Lukra (comentarios, looks, etc.):</p>
          <ul class="ml-6 mt-2 list-disc space-y-1">
            <li>Garantiza que tiene los derechos necesarios para compartir dicho contenido.</li>
            <li>Nos otorga una licencia no exclusiva para mostrar, distribuir y promover su contenido dentro de la plataforma.</li>
            <li>Es responsable de que su contenido no infrinja derechos de terceros ni sea ilícito, ofensivo o inapropiado.</li>
          </ul>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">5. Propiedad intelectual</h2>
          <p>Todo el contenido editorial, diseño, código fuente y marca de Lukra están protegidos por derechos de propiedad intelectual. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.</p>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">6. Uso aceptable</h2>
          <p>Se prohíbe:</p>
          <ul class="ml-6 mt-2 list-disc space-y-1">
            <li>Utilizar la plataforma para fines ilegales o no autorizados.</li>
            <li>Intentar acceder a áreas restringidas del sistema.</li>
            <li>Enviar spam, contenido malicioso o realizar scraping automatizado.</li>
            <li>Suplantar la identidad de otros usuarios o entidades.</li>
            <li>Publicar contenido que incite al odio, la violencia o la discriminación.</li>
          </ul>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">7. Limitación de responsabilidad</h2>
          <p>Lukra se proporciona "tal cual". No garantizamos que el servicio sea ininterrumpido, seguro o libre de errores. En la máxima medida permitida por la ley, no seremos responsables de daños indirectos, incidentales o consecuentes derivados del uso de la plataforma.</p>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">8. Modificaciones</h2>
          <p>Nos reservamos el derecho de modificar estos Términos de Uso en cualquier momento. Las modificaciones entrarán en vigor desde su publicación. El uso continuado de la plataforma implica la aceptación de los términos actualizados.</p>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">9. Ley aplicable</h2>
          <p>Estos términos se rigen por la legislación española. Cualquier controversia se someterá a los tribunales de Madrid, España.</p>
        </section>
      </div>
    </div>
  </main>
</template>
