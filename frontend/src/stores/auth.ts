import { api } from '@/services/api'
import { authService } from '@/services/auth.service'
import type { LoginPayload, RegisterPayload, User } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isEditor = computed(() => user.value?.role === 'editor' || user.value?.role === 'admin')
  const userRole = computed(() => user.value?.role ?? 'default')

  function _saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  }

  function _clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      const tokens = await authService.login(payload)
      _saveTokens(tokens.access_token, tokens.refresh_token)
      const me = await authService.getMe()
      user.value = me
    } catch (e: any) {
      error.value = e?.data?.detail || e?.message || 'Error al iniciar sesión'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = null
    try {
      const tokens = await authService.register(payload)
      _saveTokens(tokens.access_token, tokens.refresh_token)
      const me = await authService.getMe()
      user.value = me
    } catch (e: any) {
      error.value = e?.data?.detail || e?.message || 'Error al registrarse'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    try {
      const me = await authService.getMe()
      user.value = me
    } catch {
      _clearTokens()
      user.value = null
    }
  }

  async function updateProfile(data: Partial<Pick<User, 'display_name' | 'bio' | 'avatar_url' | 'gender' | 'website' | 'instagram'>>) {
    const updated = await api<User>('/users/me', { method: 'PATCH', body: data })
    user.value = updated
    return updated
  }

  function logout() {
    _clearTokens()
    user.value = null
    error.value = null
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isEditor,
    userRole,
    login,
    register,
    fetchUser,
    updateProfile,
    logout,
  }
})
