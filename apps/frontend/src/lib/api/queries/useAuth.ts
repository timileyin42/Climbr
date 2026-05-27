import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { authEndpoints, type LoginPayload, type RegisterPayload } from '@/lib/api/endpoints/auth'
import { useAuthStore, type UserRole } from '@/lib/auth/store'

function handleAuthResponse(data: Awaited<ReturnType<typeof authEndpoints.login>>) {
  useAuthStore.getState().setAuth(
    { id: data.user.id, email: data.user.email, firstName: data.user.first_name,
      lastName: data.user.last_name, role: data.user.role as UserRole, isVerified: data.user.is_verified },
    data.access_token,
  )
}

export function useLogin() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (payload: LoginPayload) => authEndpoints.login(payload),
    onSuccess: (data) => {
      handleAuthResponse(data)
      const next = new URLSearchParams(window.location.search).get('next')
      if (next) { navigate(next); return }
      // Talent users with no bio set go to onboarding first
      if (data.user.role === 'talent' && !(data.user as Record<string, unknown>).profile_complete) {
        navigate('/onboarding')
      } else {
        navigate(dashboardFor(data.user.role))
      }
    },
    onError: () => toast.error('Invalid email or password'),
  })
}

export function useRegister() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authEndpoints.register(payload),
    onSuccess: (data) => {
      handleAuthResponse(data)
      if (!data.user.is_verified) navigate('/verify-email')
      else if (data.user.role === 'talent') navigate('/onboarding')
      else navigate(dashboardFor(data.user.role))
    },
    onError: (err: Error) => toast.error(err.message ?? 'Registration failed'),
  })
}

export function useGoogleSignIn(role?: 'talent' | 'employer' | 'trainer') {
  return useMutation({
    mutationFn: async () => {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      return authEndpoints.firebase({ id_token: idToken, user_type: role })
    },
    onSuccess: (data) => {
      handleAuthResponse(data)
      // Use location.replace to bypass RedirectIfAuthed re-render race on the signup page
      window.location.replace(data.user.role === 'talent' ? '/onboarding' : dashboardFor(data.user.role))
    },
    onError: () => toast.error('Google sign-in failed'),
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  return useMutation({
    mutationFn: async () => { await authEndpoints.logout(); await signOut(auth) },
    onSettled: () => { clearAuth(); navigate('/') },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authEndpoints.forgotPassword(email),
    onSuccess: () => toast.success('Reset link sent — check your inbox'),
    onError: () => toast.error('Something went wrong'),
  })
}

export function useResetPassword() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authEndpoints.resetPassword(token, password),
    onSuccess: () => { toast.success('Password updated'); navigate('/login') },
    onError: () => toast.error('Reset link expired or invalid'),
  })
}

function dashboardFor(role: string) {
  if (role === 'employer') return '/employer/dashboard'
  if (role === 'trainer') return '/trainer/dashboard'
  if (role === 'admin') return '/admin/dashboard'
  return '/dashboard'
}
