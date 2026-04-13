export interface User {
  id: string
  email: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  gender: string | null
  role: 'admin' | 'editor' | 'default'
  website: string | null
  instagram: string | null
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  username: string
  password: string
  display_name?: string
}

export interface ApiError {
  detail: string
}
