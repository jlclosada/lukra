<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { Edit3, Heart, Shield, User } from 'lucide-vue-next'

const auth = useAuthStore()

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  default: 'Usuario',
}

const roleIcon: Record<string, any> = {
  admin: Shield,
  editor: Edit3,
  default: Heart,
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-16">
    <div class="text-center">
      <!-- Avatar placeholder -->
      <div
        class="mx-auto flex h-24 w-24 items-center justify-center rounded-full"
        :style="{ backgroundColor: 'var(--color-bg-subtle)' }"
      >
        <User :size="40" style="color: var(--color-text-muted)" />
      </div>

      <h1
        class="mt-6 text-3xl font-medium"
        style="font-family: var(--font-heading)"
      >
        {{ auth.user?.display_name || auth.user?.username }}
      </h1>

      <p class="mt-1 text-sm" style="color: var(--color-text-muted)">
        @{{ auth.user?.username }}
      </p>

      <!-- Role badge -->
      <div class="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
        :style="{
          backgroundColor: auth.user?.role === 'admin'
            ? 'color-mix(in srgb, var(--color-accent-gold) 15%, transparent)'
            : auth.user?.role === 'editor'
              ? 'color-mix(in srgb, var(--color-accent-cool) 15%, transparent)'
              : 'var(--color-bg-subtle)',
          color: auth.user?.role === 'admin'
            ? 'var(--color-accent-gold)'
            : auth.user?.role === 'editor'
              ? 'var(--color-accent-cool)'
              : 'var(--color-text-secondary)',
        }"
      >
        <component :is="roleIcon[auth.user?.role || 'default']" :size="14" />
        <span class="text-xs font-medium uppercase tracking-wider">
          {{ roleLabel[auth.user?.role || 'default'] }}
        </span>
      </div>

      <p
        v-if="auth.user?.bio"
        class="mx-auto mt-6 max-w-md text-sm leading-relaxed"
        style="color: var(--color-text-secondary)"
      >
        {{ auth.user.bio }}
      </p>
    </div>

    <!-- User info -->
    <div class="mt-12 space-y-4">
      <div
        class="border p-6"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
      >
        <h3
          class="mb-4 text-xs font-medium uppercase tracking-widest"
          style="color: var(--color-text-muted)"
        >
          Información de la cuenta
        </h3>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between">
            <dt style="color: var(--color-text-secondary)">Email</dt>
            <dd>{{ auth.user?.email }}</dd>
          </div>
          <div class="flex justify-between">
            <dt style="color: var(--color-text-secondary)">Miembro desde</dt>
            <dd>{{ auth.user?.created_at ? new Date(auth.user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : '' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt style="color: var(--color-text-secondary)">Email verificado</dt>
            <dd>{{ auth.user?.email_verified ? 'Sí' : 'No' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Admin section -->
      <div
        v-if="auth.isAdmin"
        class="border p-6"
        :style="{ borderColor: 'var(--color-accent-gold)', backgroundColor: 'color-mix(in srgb, var(--color-accent-gold) 5%, var(--color-bg-elevated))' }"
      >
        <h3
          class="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest"
          style="color: var(--color-accent-gold)"
        >
          <Shield :size="14" />
          Panel de Administración
        </h3>
        <p class="text-sm" style="color: var(--color-text-secondary)">
          Tienes acceso completo. Puedes gestionar usuarios, contenido y configuración.
        </p>
      </div>

      <!-- Editor section -->
      <div
        v-else-if="auth.isEditor"
        class="border p-6"
        :style="{ borderColor: 'var(--color-accent-cool)', backgroundColor: 'color-mix(in srgb, var(--color-accent-cool) 5%, var(--color-bg-elevated))' }"
      >
        <h3
          class="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest"
          style="color: var(--color-accent-cool)"
        >
          <Edit3 :size="14" />
          Panel de Editor
        </h3>
        <p class="text-sm" style="color: var(--color-text-secondary)">
          Puedes crear y editar artículos y looks.
        </p>
      </div>
    </div>
  </div>
</template>
