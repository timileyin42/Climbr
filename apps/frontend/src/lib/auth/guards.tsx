import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, type UserRole } from './store'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  return <>{children}</>
}

export function RequireRole({ role, children }: { role: UserRole | UserRole[]; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const roles = Array.isArray(role) ? role : [role]
  if (!user || !roles.includes(user.role)) return <Navigate to="/403" replace />
  return <>{children}</>
}

export function RequireVerified({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (!user.isVerified) return <Navigate to="/verify-email" replace />
  return <>{children}</>
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (user) return <Navigate to={dashboardFor(user.role)} replace />
  return <>{children}</>
}

function dashboardFor(role: UserRole) {
  if (role === 'employer') return '/employer/dashboard'
  if (role === 'trainer') return '/trainer/dashboard'
  if (role === 'admin') return '/admin/dashboard'
  return '/dashboard'
}
