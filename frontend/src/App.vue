<script setup lang="ts">
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background-color: var(--color-bg); color: var(--color-text)">
    <AppHeader />
    <main class="flex-1">
      <RouterView />
    </main>
    <AppFooter v-if="!isAdminRoute" />
  </div>
</template>
