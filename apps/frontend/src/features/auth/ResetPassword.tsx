import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useResetPassword } from '@/lib/api/queries/useAuth'
import { RedirectIfAuthed } from '@/lib/auth/guards'

const schema = z.object({
  password:        z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine((v) => v.password === v.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type FormValues = z.infer<typeof schema>

export function Component() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [showPw, setShowPw]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const reset = useResetPassword()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-sm px-6">
          <h1 className="text-[24px] font-[700] text-[var(--color-brand-navy)] mb-3">Invalid link</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
            This reset link is missing or expired. Request a new one.
          </p>
          <Link to="/forgot-password">
            <Button className="w-full">Request new link</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <RedirectIfAuthed>
      <div className="min-h-screen bg-white flex">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-[var(--color-brand-navy)] px-16">
          <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-cyan)] text-white text-[15px] font-[700] mb-12">
            Climbr
          </Link>
          <h2 className="text-[40px] font-[700] text-white leading-[1.1] text-center">
            Choose a new<br />password.
          </h2>
          <p className="text-white/60 text-[15px] mt-4 text-center max-w-xs">
            Pick something strong. You won't need to do this again for a while.
          </p>
        </div>

        {/* Right form */}
        <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 md:px-16 py-12">
          <div className="max-w-sm w-full mx-auto">
            <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[15px] font-[700] mb-10 lg:hidden">
              Climbr
            </Link>

            <h1 className="text-[28px] font-[700] text-[var(--color-brand-navy)] mb-8">Set new password</h1>

            <form onSubmit={handleSubmit((v) => reset.mutate({ token, password: v.password }))} className="space-y-4">
              <div>
                <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">New password</label>
                <div className="relative">
                  <Input type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" className="pr-10" {...register('password')} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Confirm password</label>
                <div className="relative">
                  <Input type={showConfirm ? 'text' : 'password'} placeholder="Repeat password" className="pr-10" {...register('confirmPassword')} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full mt-2" disabled={reset.isPending}>
                {reset.isPending ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </RedirectIfAuthed>
  )
}
