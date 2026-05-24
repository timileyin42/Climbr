import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForgotPassword } from '@/lib/api/queries/useAuth'
import { RedirectIfAuthed } from '@/lib/auth/guards'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormValues = z.infer<typeof schema>

export function Component() {
  const forgot = useForgotPassword()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  return (
    <RedirectIfAuthed>
      <div className="min-h-screen bg-white flex">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-[var(--color-brand-cyan)] px-16">
          <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[15px] font-[700] mb-12">
            Climbr
          </Link>
          <h2 className="text-[40px] font-[700] text-white leading-[1.1] text-center">
            Forgot your<br />password?
          </h2>
          <p className="text-white/70 text-[15px] mt-4 text-center max-w-xs">
            No worries — enter your email and we'll send a reset link within seconds.
          </p>
        </div>

        {/* Right form */}
        <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 md:px-16 py-12">
          <div className="max-w-sm w-full mx-auto">
            <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[15px] font-[700] mb-10 lg:hidden">
              Climbr
            </Link>

            {forgot.isSuccess ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[var(--color-brand-cyan-soft)] flex items-center justify-center mx-auto mb-6">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h1 className="text-[24px] font-[700] text-[var(--color-brand-navy)] mb-3">Check your inbox</h1>
                <p className="text-[14px] text-[var(--color-text-secondary)] mb-8 max-w-xs mx-auto">
                  We sent a password reset link to your email. It expires in 15 minutes.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">Back to log in</Button>
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-[28px] font-[700] text-[var(--color-brand-navy)] mb-2">Reset password</h1>
                <p className="text-[14px] text-[var(--color-text-secondary)] mb-8">
                  Remember it?{' '}
                  <Link to="/login" className="text-[var(--color-brand-cyan)] font-[600] hover:underline">Log in</Link>
                </p>

                <form onSubmit={handleSubmit((v) => forgot.mutate(v.email))} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Email</label>
                    <Input type="email" placeholder="you@example.com" {...register('email')} />
                    {errors.email && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.email.message}</p>}
                  </div>

                  <Button type="submit" className="w-full mt-2" disabled={forgot.isPending}>
                    {forgot.isPending ? 'Sending…' : 'Send reset link'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </RedirectIfAuthed>
  )
}
