import { ofetch } from 'ofetch'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = ofetch.create({
  baseURL: `${baseURL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  onRequest({ options }) {
    const token = localStorage.getItem('access_token')
    if (token) {
      const headers = new Headers(options.headers)
      headers.set('Authorization', `Bearer ${token}`)
      options.headers = headers
    }
  },
  async onResponseError({ response }) {
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const data = await ofetch(`${baseURL}/api/v1/auth/refresh`, {
            method: 'POST',
            body: { refresh_token: refreshToken },
          })
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          // Note: automatic retry not done here — the store handles re-fetch
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
  },
})
