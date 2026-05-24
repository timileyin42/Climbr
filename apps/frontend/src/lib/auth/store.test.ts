import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './store'

function reset() {
  useAuthStore.setState({ user: null, accessToken: null, theme: 'light', sidebarOpen: true })
}

describe('useAuthStore', () => {
  beforeEach(reset)

  it('starts with no user', () => {
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it('setAuth stores user and token', () => {
    const user = { id: 1, email: 'a@b.com', firstName: 'Alice', lastName: 'Smith', role: 'talent' as const, isVerified: true }
    useAuthStore.getState().setAuth(user, 'tok-123')
    const s = useAuthStore.getState()
    expect(s.user).toEqual(user)
    expect(s.accessToken).toBe('tok-123')
  })

  it('clearAuth removes user and token', () => {
    const user = { id: 1, email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'talent' as const, isVerified: true }
    useAuthStore.getState().setAuth(user, 'tok')
    useAuthStore.getState().clearAuth()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it('toggleSidebar flips sidebarOpen', () => {
    expect(useAuthStore.getState().sidebarOpen).toBe(true)
    useAuthStore.getState().toggleSidebar()
    expect(useAuthStore.getState().sidebarOpen).toBe(false)
    useAuthStore.getState().toggleSidebar()
    expect(useAuthStore.getState().sidebarOpen).toBe(true)
  })

  it('setTheme updates theme', () => {
    useAuthStore.getState().setTheme('dark')
    expect(useAuthStore.getState().theme).toBe('dark')
    useAuthStore.getState().setTheme('light')
    expect(useAuthStore.getState().theme).toBe('light')
  })
})
