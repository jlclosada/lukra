<script setup lang="ts">
const brands = [
  'GUCCI', 'PRADA', 'BALENCIAGA', 'LOUIS VUITTON', 'DIOR',
  'SAINT LAURENT', 'VERSACE', 'GIVENCHY', 'VALENTINO', 'FENDI',
  'CHANEL', 'HERMÈS', 'BURBERRY', 'BOTTEGA VENETA', 'LOEWE',
  'COS', 'ACNE STUDIOS', 'THE ROW', 'MAISON MARGIELA', 'RICK OWENS',
]
</script>

<template>
  <section class="overflow-hidden py-10 border-t border-b" :style="{ borderColor: 'var(--color-border)' }">
    <div class="mb-6 text-center">
      <p class="text-[10px] font-semibold uppercase tracking-[0.4em]" style="color: var(--color-text-muted)">
        Marcas tendencia
      </p>
    </div>

    <!-- Marquee container -->
    <div class="relative">
      <!-- Fade edges -->
      <div class="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[var(--color-bg)] to-transparent" />
      <div class="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[var(--color-bg)] to-transparent" />

      <!-- Track 1 -->
      <div class="marquee-track flex whitespace-nowrap">
        <div class="marquee-content flex items-center gap-12 pr-12">
          <span
            v-for="brand in brands"
            :key="brand"
            class="text-2xl font-light tracking-[0.15em] transition-opacity duration-300 hover:opacity-100 cursor-default sm:text-3xl"
            style="font-family: var(--font-display); color: var(--color-text); opacity: 0.15"
          >
            {{ brand }}
          </span>
        </div>
        <div class="marquee-content flex items-center gap-12 pr-12" aria-hidden="true">
          <span
            v-for="brand in brands"
            :key="'dup-' + brand"
            class="text-2xl font-light tracking-[0.15em] transition-opacity duration-300 hover:opacity-100 cursor-default sm:text-3xl"
            style="font-family: var(--font-display); color: var(--color-text); opacity: 0.15"
          >
            {{ brand }}
          </span>
        </div>
      </div>

      <!-- Track 2 (reverse, slightly delayed) -->
      <div class="marquee-track marquee-reverse mt-4 flex whitespace-nowrap">
        <div class="marquee-content flex items-center gap-12 pr-12">
          <span
            v-for="brand in [...brands].reverse()"
            :key="'r-' + brand"
            class="text-lg font-light tracking-[0.2em] transition-opacity duration-300 hover:opacity-100 cursor-default sm:text-xl"
            style="font-family: var(--font-heading); color: var(--color-text); opacity: 0.08"
          >
            {{ brand }}
          </span>
        </div>
        <div class="marquee-content flex items-center gap-12 pr-12" aria-hidden="true">
          <span
            v-for="brand in [...brands].reverse()"
            :key="'r-dup-' + brand"
            class="text-lg font-light tracking-[0.2em] transition-opacity duration-300 hover:opacity-100 cursor-default sm:text-xl"
            style="font-family: var(--font-heading); color: var(--color-text); opacity: 0.08"
          >
            {{ brand }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.marquee-track {
  display: flex;
  width: max-content;
}

.marquee-content {
  animation: marqueeScroll 40s linear infinite;
}

.marquee-reverse .marquee-content {
  animation: marqueeScrollReverse 50s linear infinite;
}

.marquee-track:hover .marquee-content {
  animation-play-state: paused;
}

@keyframes marqueeScroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}

@keyframes marqueeScrollReverse {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
