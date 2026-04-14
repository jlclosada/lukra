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
        Política de Privacidad
      </h1>
      <p class="mt-4 text-sm" style="color: var(--color-text-muted)">Última actualización: abril 2026</p>

      <div class="prose-legal mt-12 space-y-8 text-sm leading-relaxed" style="color: var(--color-text-secondary)">
        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">1. Responsable del tratamiento</h2>
          <p>El responsable del tratamiento de sus datos personales es <strong style="color: var(--color-text)">Lukra</strong>, con domicilio en Madrid, España. Puede contactar con nosotros a través de <a href="mailto:hello@lukra.style" class="underline transition-opacity hover:opacity-70" style="color: var(--color-accent-warm)">hello@lukra.style</a>.</p>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">2. Datos que recopilamos</h2>
          <p>Recopilamos los siguientes datos personales:</p>
          <ul class="ml-6 mt-2 list-disc space-y-1">
            <li>Datos de registro: nombre de usuario, dirección de correo electrónico y contraseña cifrada.</li>
            <li>Datos de perfil: nombre para mostrar, biografía, avatar, género, sitio web e Instagram (opcionales).</li>
            <li>Datos de uso: páginas visitadas, interacciones con el contenido, looks guardados, likes y comentarios.</li>
            <li>Datos técnicos: dirección IP, tipo de navegador, sistema operativo y datos de cookies.</li>
          </ul>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">3. Finalidad del tratamiento</h2>
          <p>Sus datos se utilizan para:</p>
          <ul class="ml-6 mt-2 list-disc space-y-1">
            <li>Gestionar su cuenta y proporcionar acceso a la plataforma.</li>
            <li>Personalizar su experiencia y mostrar contenido relevante.</li>
            <li>Enviar comunicaciones relacionadas con el servicio y el newsletter (con su consentimiento).</li>
            <li>Mejorar la seguridad y el funcionamiento de la plataforma.</li>
            <li>Cumplir con obligaciones legales.</li>
          </ul>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">4. Base legal</h2>
          <p>El tratamiento de sus datos se basa en:</p>
          <ul class="ml-6 mt-2 list-disc space-y-1">
            <li>La ejecución del contrato de servicio al crear una cuenta.</li>
            <li>Su consentimiento para el envío de comunicaciones comerciales.</li>
            <li>El interés legítimo para mejorar nuestros servicios y garantizar la seguridad.</li>
          </ul>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">5. Conservación de datos</h2>
          <p>Sus datos personales se conservarán mientras mantenga su cuenta activa. Puede solicitar la eliminación de su cuenta y datos asociados en cualquier momento contactando con nosotros.</p>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">6. Sus derechos</h2>
          <p>De acuerdo con el RGPD, tiene derecho a:</p>
          <ul class="ml-6 mt-2 list-disc space-y-1">
            <li>Acceder a sus datos personales.</li>
            <li>Rectificar datos inexactos o incompletos.</li>
            <li>Solicitar la supresión de sus datos.</li>
            <li>Limitar u oponerse al tratamiento.</li>
            <li>Portabilidad de los datos.</li>
            <li>Retirar su consentimiento en cualquier momento.</li>
          </ul>
          <p class="mt-2">Para ejercer estos derechos, contacte con <a href="mailto:hello@lukra.style" class="underline transition-opacity hover:opacity-70" style="color: var(--color-accent-warm)">hello@lukra.style</a>.</p>
        </section>

        <section>
          <h2 class="mb-3 text-lg font-medium" style="color: var(--color-text); font-family: var(--font-heading)">7. Seguridad</h2>
          <p>Implementamos medidas técnicas y organizativas adecuadas para proteger sus datos, incluyendo cifrado de contraseñas, conexiones HTTPS y control de acceso por roles.</p>
        </section>
      </div>
    </div>
  </main>
</template>
