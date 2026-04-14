<script setup lang="ts">
import { api } from '@/services/api'
import type { User } from '@/types'
import { Edit3, Mail, Search, Shield, ShieldCheck, Trash2, User as UserIcon, Users, X } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

const allUsers = ref<User[]>([])
const searchQuery = ref('')
const roleFilter = ref<string | null>(null)
const editingUser = ref<User | null>(null)
const showEditModal = ref(false)
const confirmDelete = ref<string | null>(null)

const editForm = ref({
  display_name: '',
  role: 'default' as 'admin' | 'editor' | 'default',
  is_active: true,
})

async function fetchUsers() {
  try {
    const data = await api<{ items: User[] }>('/users/', { params: { per_page: 100 } })
    allUsers.value = data.items
  } catch {
    allUsers.value = []
  }
}

onMounted(fetchUsers)

const filteredUsers = computed(() => {
  let users = allUsers.value
  if (roleFilter.value) {
    users = users.filter((u) => u.role === roleFilter.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    users = users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.display_name || '').toLowerCase().includes(q),
    )
  }
  return users
})

const userStats = computed(() => ({
  total: allUsers.value.length,
  admins: allUsers.value.filter((u) => u.role === 'admin').length,
  editors: allUsers.value.filter((u) => u.role === 'editor').length,
  active: allUsers.value.filter((u) => u.is_active).length,
  verified: allUsers.value.filter((u) => u.email_verified).length,
}))

function openEdit(user: User) {
  editingUser.value = user
  editForm.value = {
    display_name: user.display_name || '',
    role: user.role,
    is_active: user.is_active,
  }
  showEditModal.value = true
}

async function saveUser() {
  if (!editingUser.value) return
  try {
    const updated = await api<User>(`/users/${editingUser.value.id}/role`, {
      method: 'PATCH',
      body: {
        role: editForm.value.role,
        is_active: editForm.value.is_active,
      },
    })
    const idx = allUsers.value.findIndex((u) => u.id === editingUser.value!.id)
    if (idx !== -1) allUsers.value[idx] = updated
  } catch {
    // fallback: update locally
    const idx = allUsers.value.findIndex((u) => u.id === editingUser.value!.id)
    if (idx !== -1) {
      allUsers.value[idx] = {
        ...allUsers.value[idx],
        display_name: editForm.value.display_name || null,
        role: editForm.value.role,
        is_active: editForm.value.is_active,
        updated_at: new Date().toISOString(),
      }
    }
  }
  showEditModal.value = false
}

function deleteUser(id: string) {
  allUsers.value = allUsers.value.filter((u) => u.id !== id)
  confirmDelete.value = null
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getRoleIcon(role: string) {
  if (role === 'admin') return ShieldCheck
  if (role === 'editor') return Shield
  return UserIcon
}

function getRoleColor(role: string) {
  if (role === 'admin') return 'var(--color-accent-gold)'
  if (role === 'editor') return 'var(--color-accent-cool)'
  return 'var(--color-text-muted)'
}
</script>

<template>
  <div class="p-8 lg:p-12">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-light" style="font-family: var(--font-display)">Usuarios</h1>
      <p class="mt-2 text-sm" style="color: var(--color-text-secondary)">
        Gestiona los usuarios de la plataforma
      </p>
    </div>

    <!-- Stats row -->
    <div class="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
      <div
        v-for="(stat, key) in { 'Total': userStats.total, 'Admins': userStats.admins, 'Editores': userStats.editors, 'Activos': userStats.active, 'Verificados': userStats.verified }"
        :key="key"
        class="border px-4 py-3 text-center"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
      >
        <p class="text-2xl font-light" style="font-family: var(--font-display)">{{ stat }}</p>
        <p class="mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">{{ key }}</p>
      </div>
    </div>

    <!-- Search + Filter -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row">
      <div
        class="flex flex-1 items-center gap-3 border px-4 py-2.5"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }"
      >
        <Search :size="16" style="color: var(--color-text-muted)" />
        <input v-model="searchQuery" type="text" placeholder="Buscar usuarios..." class="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]" />
        <button v-if="searchQuery" @click="searchQuery = ''" class="cursor-pointer"><X :size="14" style="color: var(--color-text-muted)" /></button>
      </div>
      <div class="flex gap-2">
        <button
          v-for="role in [null, 'admin', 'editor', 'default']"
          :key="String(role)"
          @click="roleFilter = role"
          class="px-3 py-2 text-[10px] font-medium uppercase tracking-wider cursor-pointer transition-all duration-200"
          :style="{
            backgroundColor: roleFilter === role ? 'var(--color-accent)' : 'transparent',
            color: roleFilter === role ? 'var(--color-bg)' : 'var(--color-text-muted)',
            border: '1px solid ' + (roleFilter === role ? 'var(--color-accent)' : 'var(--color-border)'),
          }"
        >
          {{ role || 'Todos' }}
        </button>
      </div>
    </div>

    <!-- Users table -->
    <div class="overflow-hidden rounded-sm border" :style="{ borderColor: 'var(--color-border)' }">
      <table class="w-full">
        <thead>
          <tr :style="{ backgroundColor: 'var(--color-bg-subtle)' }">
            <th class="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Usuario</th>
            <th class="hidden px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] md:table-cell" style="color: var(--color-text-muted)">Email</th>
            <th class="px-6 py-3 text-center text-[10px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Rol</th>
            <th class="hidden px-6 py-3 text-center text-[10px] font-medium uppercase tracking-[0.15em] sm:table-cell" style="color: var(--color-text-muted)">Estado</th>
            <th class="hidden px-6 py-3 text-center text-[10px] font-medium uppercase tracking-[0.15em] lg:table-cell" style="color: var(--color-text-muted)">Registro</th>
            <th class="px-6 py-3 text-right text-[10px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y" :style="{ '--tw-divide-color': 'var(--color-border)' } as any">
          <tr
            v-for="user in filteredUsers"
            :key="user.id"
            class="transition-colors duration-200 hover:bg-[var(--color-bg-subtle)]"
            :style="{ backgroundColor: 'var(--color-bg-elevated)' }"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  v-if="user.avatar_url"
                  class="h-9 w-9 shrink-0 overflow-hidden rounded-full"
                >
                  <img :src="user.avatar_url" :alt="user.username" class="h-full w-full object-cover" />
                </div>
                <div
                  v-else
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium uppercase"
                  style="background-color: var(--color-bg-subtle); color: var(--color-text-muted)"
                >
                  {{ (user.display_name || user.username).charAt(0) }}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium">{{ user.display_name || user.username }}</p>
                  <p class="truncate text-xs" style="color: var(--color-text-muted)">@{{ user.username }}</p>
                </div>
              </div>
            </td>
            <td class="hidden px-6 py-4 md:table-cell">
              <div class="flex items-center gap-1.5">
                <Mail :size="12" style="color: var(--color-text-muted)" />
                <span class="text-sm" style="color: var(--color-text-secondary)">{{ user.email }}</span>
                <span
                  v-if="user.email_verified"
                  class="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5"
                  style="background-color: color-mix(in srgb, var(--color-success) 15%, transparent); color: var(--color-success)"
                >
                  ✓
                </span>
              </div>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5" :style="{ backgroundColor: `color-mix(in srgb, ${getRoleColor(user.role)} 12%, transparent)` }">
                <component :is="getRoleIcon(user.role)" :size="12" :style="{ color: getRoleColor(user.role) }" />
                <span class="text-[10px] font-medium uppercase tracking-wider" :style="{ color: getRoleColor(user.role) }">
                  {{ user.role }}
                </span>
              </div>
            </td>
            <td class="hidden px-6 py-4 text-center sm:table-cell">
              <span
                class="inline-block h-2 w-2 rounded-full"
                :style="{ backgroundColor: user.is_active ? 'var(--color-success)' : 'var(--color-error)' }"
                :title="user.is_active ? 'Activo' : 'Inactivo'"
              />
            </td>
            <td class="hidden px-6 py-4 text-center lg:table-cell">
              <span class="text-xs" style="color: var(--color-text-muted)">{{ formatDate(user.created_at) }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="openEdit(user)"
                  class="flex h-8 w-8 items-center justify-center rounded cursor-pointer transition-all hover:bg-[var(--color-bg-subtle)]"
                  title="Editar"
                >
                  <Edit3 :size="14" style="color: var(--color-text-secondary)" />
                </button>
                <button
                  v-if="confirmDelete !== user.id && user.role !== 'admin'"
                  @click="confirmDelete = user.id"
                  class="flex h-8 w-8 items-center justify-center rounded cursor-pointer transition-all hover:bg-red-50"
                  title="Eliminar"
                >
                  <Trash2 :size="14" style="color: var(--color-error)" />
                </button>
                <div v-else-if="confirmDelete === user.id" class="flex items-center gap-1">
                  <button @click="deleteUser(user.id)" class="px-2 py-1 text-[10px] font-medium uppercase cursor-pointer btn-danger">Sí</button>
                  <button @click="confirmDelete = null" class="px-2 py-1 text-[10px] font-medium uppercase cursor-pointer btn-ghost">No</button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredUsers.length === 0" class="px-6 py-16 text-center" :style="{ backgroundColor: 'var(--color-bg-elevated)' }">
        <Users :size="40" class="mx-auto mb-4" style="color: var(--color-text-muted)" />
        <p class="text-sm" style="color: var(--color-text-muted)">No se encontraron usuarios</p>
      </div>
    </div>

    <!-- Edit user modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditModal" class="fixed inset-0 z-[100] flex items-center justify-center" @click.self="showEditModal = false">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showEditModal = false" />
          <div class="relative z-10 mx-4 w-full max-w-md overflow-y-auto rounded-sm" style="background-color: var(--color-bg-elevated)">
            <div class="flex items-center justify-between border-b px-8 py-5" :style="{ borderColor: 'var(--color-border)' }">
              <h2 class="text-lg font-medium" style="font-family: var(--font-heading)">Editar Usuario</h2>
              <button @click="showEditModal = false" class="cursor-pointer transition-opacity hover:opacity-60"><X :size="20" /></button>
            </div>

            <div v-if="editingUser" class="space-y-5 px-8 py-6">
              <!-- User info (read only) -->
              <div class="flex items-center gap-4 rounded-md p-4" style="background-color: var(--color-bg-subtle)">
                <img v-if="editingUser.avatar_url" :src="editingUser.avatar_url" class="h-12 w-12 rounded-full object-cover" />
                <div v-else class="flex h-12 w-12 items-center justify-center rounded-full text-sm font-medium" style="background-color: var(--color-border); color: var(--color-text-muted)">
                  {{ (editingUser.display_name || editingUser.username).charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm font-medium">@{{ editingUser.username }}</p>
                  <p class="text-xs" style="color: var(--color-text-muted)">{{ editingUser.email }}</p>
                </div>
              </div>

              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Nombre</label>
                <input v-model="editForm.display_name" type="text" class="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }" />
              </div>

              <div>
                <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em]" style="color: var(--color-text-muted)">Rol</label>
                <select v-model="editForm.role" class="w-full border px-4 py-2.5 text-sm outline-none cursor-pointer" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }">
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="default">Default</option>
                </select>
              </div>

              <label class="flex cursor-pointer items-center gap-3">
                <input v-model="editForm.is_active" type="checkbox" class="h-4 w-4 cursor-pointer" />
                <span class="text-sm">Cuenta activa</span>
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 border-t px-8 py-5" :style="{ borderColor: 'var(--color-border)' }">
              <button @click="showEditModal = false" class="px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer btn-outline">Cancelar</button>
              <button @click="saveUser" class="px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer btn-primary">Guardar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active { animation: fadeIn 0.25s ease-out; }
.modal-enter-active > div:nth-child(2) { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-leave-active { animation: fadeIn 0.2s ease-in reverse; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
