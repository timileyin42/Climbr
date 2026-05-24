import ky from 'ky'
import { useAuthStore } from '@/lib/auth/store'

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  timeout: 30_000,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().accessToken
        if (token) request.headers.set('Authorization', `Bearer ${token}`)
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          useAuthStore.getState().clearAuth()
          window.location.href = '/login'
        }
        return response
      },
    ],
  },
})
