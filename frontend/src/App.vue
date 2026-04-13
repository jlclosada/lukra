<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="min-h-screen" style="background-color: var(--color-bg); color: var(--color-text)">
    <AppHeader />
    <main>
      <RouterView />
    </main>
  </div>
</template>
