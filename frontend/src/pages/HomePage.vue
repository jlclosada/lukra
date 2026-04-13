<script setup lang="ts">
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 py-24 text-center">
    <h1
      class="text-6xl sm:text-7xl lg:text-8xl font-light tracking-tight leading-none"
      style="font-family: var(--font-display)"
    >
      La moda habla.
    </h1>
    <p
      class="mx-auto mt-6 max-w-xl text-lg"
      style="color: var(--color-text-secondary)"
    >
      Artículos, looks, tendencias y una comunidad que vive la moda.
      Para hombres y mujeres que saben lo que quieren.
    </p>
    <div class="mt-12 flex items-center justify-center gap-4">
      <RouterLink
        to="/register"
        class="px-8 py-4 text-sm font-medium uppercase tracking-[0.15em] transition-all hover:opacity-85"
        :style="{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }"
      >
        Únete
      </RouterLink>
      <RouterLink
        to="/login"
        class="border-2 px-8 py-4 text-sm font-medium uppercase tracking-[0.15em] transition-all hover:opacity-70"
        :style="{ borderColor: 'var(--color-accent)' }"
      >
        Entrar
      </RouterLink>
    </div>
  </div>
</template>
