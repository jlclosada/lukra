<script setup lang="ts">
import { ArrowRight, Eye, Heart, Leaf, Sparkles } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const revealed = ref(false)

const values = [
  {
    icon: Eye,
    title: 'Visión',
    description:
      'Creemos que la moda es un lenguaje universal. Lukra nace para democratizar la inspiración, acercando las pasarelas y el street style a todos.',
  },
  {
    icon: Heart,
    title: 'Pasión',
    description:
      'Cada look, cada artículo y cada tendencia está curada con dedicación. Nuestro equipo editorial vive y respira moda contemporánea.',
  },
  {
    icon: Sparkles,
    title: 'Innovación',
    description:
      'Combinamos tecnología y diseño para ofrecer una experiencia digital que refleje la elegancia y la sofisticación del mundo de la moda.',
  },
  {
    icon: Leaf,
    title: 'Sostenibilidad',
    description:
      'Promovemos una moda consciente. Destacamos marcas y prácticas sostenibles porque el futuro de la moda debe ser responsable.',
  },
]

const team = [
  {
    name: 'Sofía Martínez',
    role: 'Directora Creativa',
    avatar: 'https://i.pravatar.cc/300?img=1',
    quote: 'La moda no es solo ropa, es la armadura con la que enfrentas el mundo.',
  },
  {
    name: 'Carlos Vega',
    role: 'Editor Jefe',
    avatar: 'https://i.pravatar.cc/300?img=3',
    quote: 'Cada tendencia cuenta una historia. Nosotros la narramos.',
  },
  {
    name: 'Lucía Chen',
    role: 'Directora de Tendencias',
    avatar: 'https://i.pravatar.cc/300?img=5',
    quote: 'El estilo es instinto, pero se puede educar el ojo.',
  },
  {
    name: 'Andrés Ruiz',
    role: 'Director de Tecnología',
    avatar: 'https://i.pravatar.cc/300?img=8',
    quote: 'La tecnología al servicio de la belleza y la creatividad.',
  },
]

const milestones = [
  { year: '2024', text: 'Nace la idea de Lukra' },
  { year: '2025', text: 'Lanzamiento de la plataforma beta' },
  { year: '2025', text: 'Primeras colaboraciones con marcas independientes' },
  { year: '2026', text: 'Expansión internacional y comunidad global' },
]

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 },
  )

  document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
  revealed.value = true
})
</script>

<template>
  <main class="min-h-screen" style="background-color: var(--color-bg); color: var(--color-text)">
    <!-- Hero -->
    <section class="relative h-[70vh] min-h-[500px] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600&q=80"
        alt="Lukra — About"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-black/50" />
      <div class="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <p
          class="mb-4 text-xs font-medium uppercase tracking-[0.4em] opacity-0"
          :class="{ 'animate-fade-in-up': revealed }"
        >
          Nuestra Historia
        </p>
        <h1
          class="max-w-3xl text-4xl font-light leading-tight opacity-0 sm:text-5xl lg:text-6xl"
          style="font-family: var(--font-heading)"
          :class="{ 'animate-fade-in-up-delay': revealed }"
        >
          Donde la moda <br /><span class="italic">cobra vida</span>
        </h1>
        <p
          class="mt-6 max-w-xl text-base leading-relaxed text-white/70 opacity-0 sm:text-lg"
          :class="{ 'animate-fade-in-up-delay-2': revealed }"
        >
          Lukra es más que una plataforma. Es un espacio donde la inspiración,
          la creatividad y la innovación convergen para redefinir cómo experimentamos la moda.
        </p>
      </div>
    </section>

    <!-- Mission -->
    <section class="mx-auto max-w-4xl px-6 py-24 text-center" data-reveal>
      <p
        class="mb-3 text-xs font-medium uppercase tracking-[0.3em]"
        style="color: var(--color-accent-warm)"
      >
        Nuestra Misión
      </p>
      <h2
        class="mb-8 text-3xl font-light sm:text-4xl"
        style="font-family: var(--font-heading)"
      >
        Inspirar a través de la curación
      </h2>
      <p
        class="mx-auto max-w-2xl text-lg leading-relaxed"
        style="color: var(--color-text-secondary)"
      >
        En Lukra, curamos las mejores tendencias, looks editoriales y artículos sobre moda
        para que cada persona encuentre su propia voz en el vestir. Creemos que el estilo
        personal es una forma de arte, y nuestra misión es hacerlo accesible para todos.
      </p>
    </section>

    <!-- Values -->
    <section
      class="py-24"
      style="background-color: var(--color-bg-subtle)"
    >
      <div class="mx-auto max-w-6xl px-6">
        <div class="mb-16 text-center" data-reveal>
          <p
            class="mb-3 text-xs font-medium uppercase tracking-[0.3em]"
            style="color: var(--color-accent-warm)"
          >
            Lo que nos define
          </p>
          <h2
            class="text-3xl font-light sm:text-4xl"
            style="font-family: var(--font-heading)"
          >
            Nuestros Valores
          </h2>
        </div>

        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(value, idx) in values"
            :key="value.title"
            class="group text-center"
            data-reveal
            :style="{ transitionDelay: `${idx * 100}ms` }"
          >
            <div
              class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-500 group-hover:scale-110"
              style="border: 1px solid var(--color-border)"
            >
              <component
                :is="value.icon"
                :size="24"
                style="color: var(--color-accent-warm)"
              />
            </div>
            <h3
              class="mb-3 text-lg font-medium uppercase tracking-wider"
              style="font-family: var(--font-heading)"
            >
              {{ value.title }}
            </h3>
            <p
              class="text-sm leading-relaxed"
              style="color: var(--color-text-secondary)"
            >
              {{ value.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Editorial Quote -->
    <section class="py-20 px-6 text-center" data-reveal>
      <blockquote class="mx-auto max-w-3xl">
        <p
          class="text-2xl font-light italic leading-relaxed sm:text-3xl lg:text-4xl"
          style="font-family: var(--font-display); color: var(--color-text)"
        >
          "La moda se desvanece, solo el estilo permanece igual."
        </p>
        <cite
          class="mt-6 block text-xs font-medium uppercase tracking-[0.3em] not-italic"
          style="color: var(--color-text-muted)"
        >
          — Coco Chanel
        </cite>
      </blockquote>
    </section>

    <!-- Timeline -->
    <section
      class="py-24"
      style="background-color: var(--color-bg-subtle)"
    >
      <div class="mx-auto max-w-3xl px-6">
        <div class="mb-16 text-center" data-reveal>
          <p
            class="mb-3 text-xs font-medium uppercase tracking-[0.3em]"
            style="color: var(--color-accent-warm)"
          >
            Nuestro Camino
          </p>
          <h2
            class="text-3xl font-light sm:text-4xl"
            style="font-family: var(--font-heading)"
          >
            La Historia de Lukra
          </h2>
        </div>

        <div class="relative">
          <!-- Vertical line -->
          <div
            class="absolute left-6 top-0 h-full w-px sm:left-1/2"
            style="background-color: var(--color-border)"
          />

          <div
            v-for="(milestone, idx) in milestones"
            :key="idx"
            class="relative mb-12 pl-16 sm:pl-0"
            :class="idx % 2 === 0 ? 'sm:pr-[calc(50%+2rem)] sm:text-right' : 'sm:pl-[calc(50%+2rem)]'"
            data-reveal
            :style="{ transitionDelay: `${idx * 150}ms` }"
          >
            <!-- Dot -->
            <div
              class="absolute left-4 top-1 h-5 w-5 rounded-full border-2 sm:left-1/2 sm:-translate-x-1/2"
              style="
                border-color: var(--color-accent-warm);
                background-color: var(--color-bg);
              "
            />
            <p
              class="text-xs font-bold uppercase tracking-[0.3em]"
              style="color: var(--color-accent-warm)"
            >
              {{ milestone.year }}
            </p>
            <p
              class="mt-1 text-base"
              style="color: var(--color-text-secondary)"
            >
              {{ milestone.text }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="py-24">
      <div class="mx-auto max-w-6xl px-6">
        <div class="mb-16 text-center" data-reveal>
          <p
            class="mb-3 text-xs font-medium uppercase tracking-[0.3em]"
            style="color: var(--color-accent-warm)"
          >
            Las personas detrás
          </p>
          <h2
            class="text-3xl font-light sm:text-4xl"
            style="font-family: var(--font-heading)"
          >
            Nuestro Equipo
          </h2>
        </div>

        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(member, idx) in team"
            :key="member.name"
            class="group text-center"
            data-reveal
            :style="{ transitionDelay: `${idx * 100}ms` }"
          >
            <div class="relative mx-auto mb-6 h-40 w-40 overflow-hidden rounded-full">
              <img
                :src="member.avatar"
                :alt="member.name"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <h3
              class="text-base font-medium"
              style="font-family: var(--font-heading)"
            >
              {{ member.name }}
            </h3>
            <p
              class="mt-1 text-xs font-medium uppercase tracking-[0.2em]"
              style="color: var(--color-accent-warm)"
            >
              {{ member.role }}
            </p>
            <p
              class="mt-3 text-sm italic leading-relaxed"
              style="color: var(--color-text-secondary); font-family: var(--font-display)"
            >
              "{{ member.quote }}"
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section
      class="py-24 text-center"
      style="background-color: var(--color-accent); color: var(--color-bg)"
      data-reveal
    >
      <div class="mx-auto max-w-2xl px-6">
        <h2
          class="mb-4 text-3xl font-light sm:text-4xl"
          style="font-family: var(--font-heading)"
        >
          Únete a la comunidad
        </h2>
        <p class="mb-8 text-base leading-relaxed opacity-70">
          Descubre las últimas tendencias, inspírate con looks únicos y forma parte
          de una comunidad que celebra el estilo en todas sus formas.
        </p>
        <RouterLink
          to="/register"
          class="inline-flex items-center gap-2 px-8 py-3 text-sm font-medium uppercase tracking-wider transition-all duration-300 hover:gap-4"
          style="
            background-color: var(--color-bg);
            color: var(--color-accent);
          "
        >
          Crear cuenta
          <ArrowRight :size="16" />
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* About page animations */
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}
.animate-fade-in-up-delay {
  animation: fadeInUp 0.8s ease-out 0.2s forwards;
}
.animate-fade-in-up-delay-2 {
  animation: fadeInUp 0.8s ease-out 0.4s forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scroll reveal */
[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

[data-reveal].revealed {
  opacity: 1;
  transform: translateY(0);
}
</style>
