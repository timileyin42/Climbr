import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Briefcase, GraduationCap, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRegister, useGoogleSignIn } from '@/lib/api/queries/useAuth'
import { RedirectIfAuthed } from '@/lib/auth/guards'
import { cn } from '@/lib/utils'

type Role = 'talent' | 'employer' | 'trainer'

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name:  z.string().min(1, 'Required'),
  email:      z.string().email('Enter a valid email'),
  password:   z.string().min(8, 'At least 8 characters'),
})
type FormValues = z.infer<typeof schema>

const roles: { id: Role; label: string; desc: string; icon: typeof User; accent: string }[] = [
  { id: 'talent',   label: 'Talent',   desc: 'Find jobs and trainings',   icon: User,           accent: 'var(--color-brand-cyan)' },
  { id: 'employer', label: 'Employer', desc: 'Post jobs and hire talent',  icon: Briefcase,       accent: 'var(--color-brand-orange)' },
  { id: 'trainer',  label: 'Trainer',  desc: 'Post trainings and courses', icon: GraduationCap,   accent: 'var(--color-brand-yellow)' },
]

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
  const [searchParams] = useSearchParams()
  const defaultRole = (searchParams.get('role') as Role) ?? 'talent'
  const [step, setStep]   = useState<1 | 2>(1)
  const [role, setRole]   = useState<Role>(defaultRole)
  const [showPw, setShowPw] = useState(false)

  const register   = useRegister()
  const googleSign = useGoogleSignIn(role)

  const { register: reg, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  return (
    <RedirectIfAuthed>
      <div className="min-h-screen bg-white flex">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-[var(--color-brand-navy)] px-16">
          <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-cyan)] text-white text-[15px] font-[700] mb-12">
            Climbr
          </Link>
          <h2 className="text-[40px] font-[700] text-white leading-[1.1] text-center">
            Start your journey.<br />Free forever.
          </h2>
          <p className="text-white/60 text-[15px] mt-4 text-center max-w-xs">
            Swipe right on opportunities. Track every application. Land where you belong.
          </p>
        </div>

        {/* Right form */}
        <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 md:px-16 py-12">
          <div className="max-w-sm w-full mx-auto">
            <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[15px] font-[700] mb-10 lg:hidden">
              Climbr
            </Link>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className={cn('h-1.5 rounded-full transition-all', s === step ? 'w-8 bg-[var(--color-brand-cyan)]' : s < step ? 'w-4 bg-[var(--color-brand-cyan)]/40' : 'w-4 bg-[var(--color-border)]')} />
              ))}
            </div>

            {step === 1 && (
              <>
                <h1 className="text-[28px] font-[700] text-[var(--color-brand-navy)] mb-2">Create an account</h1>
                <p className="text-[14px] text-[var(--color-text-secondary)] mb-8">
                  Already have one?{' '}
                  <Link to="/login" className="text-[var(--color-brand-cyan)] font-[600] hover:underline">Log in</Link>
                </p>

                <p className="text-[13px] font-[600] text-[var(--color-text-primary)] mb-3">I am a…</p>
                <div className="space-y-2 mb-8">
                  {roles.map(({ id, label, desc, icon: Icon, accent }) => (
                    <button key={id} type="button" onClick={() => setRole(id)}
                      className={cn('w-full flex items-center gap-4 px-4 py-3 rounded-[var(--radius-md)] border-2 transition-all text-left',
                        role === id ? 'border-[var(--color-brand-cyan)] bg-[var(--color-brand-cyan-soft)]' : 'border-[var(--color-border)] hover:border-[var(--color-brand-cyan)]/40'
                      )}>
                      <div className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                        style={{ background: `${accent}18`, color: accent }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{label}</p>
                        <p className="text-[12px] text-[var(--color-text-secondary)]">{desc}</p>
                      </div>
                      {role === id && <div className="ml-auto w-4 h-4 rounded-full bg-[var(--color-brand-cyan)] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>}
                    </button>
                  ))}
                </div>

                <Button className="w-full mb-4" onClick={() => setStep(2)}>Continue</Button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-[var(--color-border)]" />
                  <span className="text-[12px] text-[var(--color-text-tertiary)]">or</span>
                  <div className="flex-1 h-px bg-[var(--color-border)]" />
                </div>

                <Button type="button" variant="outline" className="w-full gap-3"
                  onClick={() => googleSign.mutate()} disabled={googleSign.isPending}>
                  <GoogleIcon />
                  {googleSign.isPending ? 'Connecting…' : 'Continue with Google'}
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <button type="button" onClick={() => setStep(1)}
                  className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 flex items-center gap-1">
                  ← Back
                </button>
                <h1 className="text-[28px] font-[700] text-[var(--color-brand-navy)] mb-8">Your details</h1>

                <form onSubmit={handleSubmit((v) => register.mutate({ ...v, role }))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">First name</label>
                      <Input placeholder="Ada" {...reg('first_name')} />
                      {errors.first_name && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.first_name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Last name</label>
                      <Input placeholder="Obi" {...reg('last_name')} />
                      {errors.last_name && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.last_name.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Email</label>
                    <Input type="email" placeholder="you@example.com" {...reg('email')} />
                    {errors.email && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Password</label>
                    <div className="relative">
                      <Input type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" className="pr-10" {...reg('password')} />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.password.message}</p>}
                  </div>

                  <Button type="submit" className="w-full mt-2" disabled={register.isPending}>
                    {register.isPending ? 'Creating account…' : 'Create account'}
                  </Button>

                  <p className="text-[12px] text-[var(--color-text-tertiary)] text-center">
                    By creating an account you agree to our{' '}
                    <Link to="/terms" className="underline">Terms</Link> and{' '}
                    <Link to="/privacy" className="underline">Privacy Policy</Link>.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </RedirectIfAuthed>
  )
}
