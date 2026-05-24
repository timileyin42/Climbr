import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { RequireAuth } from '@/lib/auth/guards'
import { useAuthStore } from '@/lib/auth/store'
import { authEndpoints } from '@/lib/api/endpoints/auth'
import { useLogout } from '@/lib/api/queries/useAuth'

export function Component() {
  const user   = useAuthStore((s) => s.user)
  const logout = useLogout()

  const resend = useMutation({
    mutationFn: () => authEndpoints.resendVerification(user?.email ?? ''),
    onSuccess:  () => toast.success('Verification email sent — check your inbox'),
    onError:    () => toast.error('Failed to resend — try again'),
  })

  return (
    <RequireAuth>
      <div className="min-h-screen bg-white flex">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-[var(--color-brand-cyan)] px-16">
          <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[15px] font-[700] mb-12">
            Climbr
          </Link>
          <h2 className="text-[40px] font-[700] text-white leading-[1.1] text-center">
            One more step.
          </h2>
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

            {/* Envelope icon */}
            <div className="w-20 h-20 rounded-full bg-[var(--color-brand-cyan-soft)] flex items-center justify-center mx-auto mb-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>

            <h1 className="text-[28px] font-[700] text-[var(--color-brand-navy)] mb-3">Verify your email</h1>
            <p className="text-[14px] text-[var(--color-text-secondary)] mb-2">
              We sent a verification link to
            </p>
            <p className="text-[14px] font-[600] text-[var(--color-text-primary)] mb-8">{user?.email}</p>

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
    </RequireAuth>
  )
}
