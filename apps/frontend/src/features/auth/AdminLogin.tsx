import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/lib/api/endpoints/admin'
import { useAuthStore } from '@/lib/auth/store'

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
})
type Form = z.infer<typeof schema>

export function Component() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  async function onSubmit({ email, password }: Form) {
    setError('')
    setLoading(true)
    try {
      const res = await adminApi.login(email, password)
      setAuth(
        { id: 0, email, firstName: 'Admin', lastName: '', role: 'admin', isVerified: true },
        res.access_token
      )
      navigate('/admin/dashboard', { replace: true })
    } catch {
      setError('Invalid credentials or insufficient privileges.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-brand-navy)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[var(--radius-lg)] mb-4"
               style={{ background: 'var(--color-brand-cyan)' }}>
            <span className="text-[22px] font-[900] text-white">C</span>
          </div>
          <h1 className="text-[24px] font-[700] text-white">Admin Portal</h1>
          <p className="text-white/50 text-[13px] mt-1">Climbr internal access only</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[var(--radius-xl)] p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[13px] font-[600] text-white/70 mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="admin@climbr.io"
                {...register('email')}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[var(--color-brand-cyan)]"
              />
              {errors.email && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-[600] text-white/70 mb-1.5">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[var(--color-brand-cyan)]"
              />
              {errors.password && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-[var(--color-brand-pink)]/10 border border-[var(--color-brand-pink)]/20 rounded-[var(--radius-md)] px-4 py-3">
                <p className="text-[13px] text-[var(--color-brand-pink)]">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              style={{ background: 'var(--color-brand-cyan)' }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
