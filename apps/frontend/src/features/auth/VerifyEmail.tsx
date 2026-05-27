import { useEffect, useRef } from 'react'
import { Navigate, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/auth/store'
import { authEndpoints } from '@/lib/api/endpoints/auth'
import { useLogout } from '@/lib/api/queries/useAuth'

export function Component() {
  const [searchParams] = useSearchParams()
  const token    = searchParams.get('token')
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)
  const logout   = useLogout()
  const fired    = useRef(false)

  const verify = useMutation({
    mutationFn: (t: string) => authEndpoints.verifyEmail(t),
    onSuccess: () => {
      toast.success('Email verified! Redirecting…')
      // Go to onboarding if the user is already in session, otherwise login
      const authed = useAuthStore.getState().user
      const dest = authed?.role === 'talent' ? '/onboarding' : '/login'
      setTimeout(() => navigate(dest, { replace: true }), 2000)
    },
  })

  useEffect(() => {
    if (token && !fired.current) {
      fired.current = true
      verify.mutate(token)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resend = useMutation({
    mutationFn: () => authEndpoints.resendVerification(user?.email ?? ''),
    onSuccess:  () => toast.success('Verification email sent — check your inbox'),
    onError:    () => toast.error('Failed to resend — try again'),
  })

  // ── Token callback mode (public — no auth needed) ──────────────────────
  if (token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[15px] font-[700] mb-10">
            Climbr
          </Link>

          {verify.isPending && (
            <>
              <div className="w-20 h-20 rounded-full bg-[var(--color-brand-cyan-soft)] flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h1 className="text-[24px] font-[700] text-[var(--color-brand-navy)] mb-3">Verifying your email…</h1>
              <p className="text-[14px] text-[var(--color-text-secondary)]">Just a moment</p>
            </>
          )}

          {verify.isSuccess && (
            <>
              <div className="w-20 h-20 rounded-full bg-[#ECFDF5] flex items-center justify-center mx-auto mb-6">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h1 className="text-[24px] font-[700] text-[var(--color-brand-navy)] mb-3">Email Verified!</h1>
              <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
                Your account is active. Setting up your profile…
              </p>
              <Button onClick={() => navigate('/onboarding', { replace: true })}>
                Set up your profile
              </Button>
            </>
          )}

          {verify.isError && (
            <>
              <div className="w-20 h-20 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-6">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h1 className="text-[24px] font-[700] text-[var(--color-brand-navy)] mb-3">Verification Failed</h1>
              <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
                The link may have expired or already been used. Request a new one after logging in.
              </p>
              <Button onClick={() => navigate('/login', { replace: true })}>Back to Login</Button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── No-token mode: "check your inbox" (requires logged-in user) ────────
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-[var(--color-brand-cyan)] px-16">
        <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[15px] font-[700] mb-12">
          Climbr
        </Link>
        <h2 className="text-[40px] font-[700] text-white leading-[1.1] text-center">One more step.</h2>
        <p className="text-white/70 text-[15px] mt-4 text-center max-w-xs">
          Confirm your email to unlock everything Climbr has to offer.
        </p>
      </div>

      {/* Right content */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 md:px-16 py-12">
        <div className="max-w-sm w-full mx-auto text-center">
          <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[15px] font-[700] mb-10 lg:hidden">
            Climbr
          </Link>

          <div className="w-20 h-20 rounded-full bg-[var(--color-brand-cyan-soft)] flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          <h1 className="text-[28px] font-[700] text-[var(--color-brand-navy)] mb-3">Verify your email</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)] mb-2">We sent a verification link to</p>
          <p className="text-[14px] font-[600] text-[var(--color-text-primary)] mb-8">{user.email}</p>
          <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
            Click the link in the email to activate your account. Check spam if you don't see it.
          </p>

          <Button
            className="w-full mb-3"
            onClick={() => resend.mutate()}
            disabled={resend.isPending || resend.isSuccess}
          >
            {resend.isPending ? 'Sending…' : resend.isSuccess ? 'Email sent!' : 'Resend verification email'}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-[var(--color-text-secondary)]"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
