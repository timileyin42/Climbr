import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLogin, useGoogleSignIn } from '@/lib/api/queries/useAuth'
import { RedirectIfAuthed } from '@/lib/auth/guards'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormValues = z.infer<typeof schema>

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export function Component() {
  const [showPw, setShowPw] = useState(false)
  const login       = useLogin()
  const googleLogin = useGoogleSignIn()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  return (
    <RedirectIfAuthed>
      <div className="min-h-screen bg-white flex">
        {/* Left cyan panel (desktop) */}
        <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-[var(--color-brand-cyan)] px-16">
          <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[15px] font-[700] mb-12">
            Climbr
          </Link>
          <h2 className="text-[40px] font-[700] text-white leading-[1.1] text-center">
            Welcome back.<br />Your next step is waiting.
          </h2>
          <p className="text-white/70 text-[15px] mt-4 text-center max-w-xs">
            Log in to continue swiping, tracking, and growing.
          </p>
        </div>

        {/* Right form panel */}
        <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 md:px-16 py-12">
          <div className="max-w-sm w-full mx-auto">
            {/* Mobile logo */}
            <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[15px] font-[700] mb-10 lg:hidden">
              Climbr
            </Link>

            <h1 className="text-[28px] font-[700] text-[var(--color-brand-navy)] mb-2">Log in</h1>
            <p className="text-[14px] text-[var(--color-text-secondary)] mb-8">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[var(--color-brand-cyan)] font-[600] hover:underline">Sign up</Link>
            </p>

            {/* Google button */}
            <Button
              type="button"
              variant="outline"
              className="w-full mb-6 gap-3"
              onClick={() => googleLogin.mutate()}
              disabled={googleLogin.isPending}
            >
              <GoogleIcon />
              {googleLogin.isPending ? 'Connecting…' : 'Continue with Google'}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <span className="text-[12px] text-[var(--color-text-tertiary)]">or</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>

            <form onSubmit={handleSubmit((v) => login.mutate(v))} className="space-y-4">
              <div>
                <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Email</label>
                <Input type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Password</label>
                <div className="relative">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pr-10"
                    {...register('password')}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-[13px] text-[var(--color-brand-cyan)] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? 'Logging in…' : 'Log in'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </RedirectIfAuthed>
  )
}
