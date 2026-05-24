import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'talent' | 'employer' | 'trainer' | 'admin'

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isVerified: boolean
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      theme: 'light',
      sidebarOpen: true,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        set({ theme })
      },
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: 'climbr-auth',
      partialize: (s) => ({ theme: s.theme }),
    }
  )
)
