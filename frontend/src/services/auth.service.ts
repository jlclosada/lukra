import type { LoginPayload, RegisterPayload, TokenResponse, User } from '@/types'
import { api } from './api'

export const authService = {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    return api('/auth/login', { method: 'POST', body: payload })
  },

  async register(payload: RegisterPayload): Promise<TokenResponse> {
    return api('/auth/register', { method: 'POST', body: payload })
  },

  async refresh(refreshToken: string): Promise<TokenResponse> {
    return api('/auth/refresh', { method: 'POST', body: { refresh_token: refreshToken } })
  },

  async getMe(): Promise<User> {
    return api('/auth/me')
  },
}
