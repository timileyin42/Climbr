import { useState } from 'react'
import { Plus, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useAdmins, useCreateAdmin } from '@/lib/api/queries/useAdmin'
import { cn } from '@/lib/utils'

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name:  z.string().min(1, 'Required'),
  email:      z.string().email('Invalid email'),
  password:   z.string().min(8, 'Min 8 characters'),
})
type Form = z.infer<typeof schema>

function CreateModal({ onClose }: { onClose: () => void }) {
  const create = useCreateAdmin()
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-[var(--radius-xl)] p-6 w-full max-w-sm shadow-[var(--shadow-active)]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[18px] font-[700] text-[var(--color-text-primary)] mb-5">Create Admin</h2>
        <form onSubmit={handleSubmit((v) => create.mutate(v, { onSuccess: onClose }))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-[600] text-[var(--color-text-primary)] mb-1">First name</label>
              <Input {...register('first_name')} />
              {errors.first_name && <p className="text-[11px] text-[var(--color-brand-pink)] mt-0.5">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-[600] text-[var(--color-text-primary)] mb-1">Last name</label>
              <Input {...register('last_name')} />
              {errors.last_name && <p className="text-[11px] text-[var(--color-brand-pink)] mt-0.5">{errors.last_name.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-[600] text-[var(--color-text-primary)] mb-1">Email</label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-[11px] text-[var(--color-brand-pink)] mt-0.5">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-[600] text-[var(--color-text-primary)] mb-1">Password</label>
            <Input type="password" {...register('password')} />
            {errors.password && <p className="text-[11px] text-[var(--color-brand-pink)] mt-0.5">{errors.password.message}</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" style={{ background: 'var(--color-brand-cyan)' }} disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create Admin'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Component() {
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading } = useAdmins()
  const admins = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Admin Users</h1>
        <Button style={{ background: 'var(--color-brand-cyan)' }} onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" />New Admin
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16 rounded-[var(--radius-lg)]" />)}</div>
      ) : admins.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No admins found" description="Create your first admin user above." />
      ) : (
        <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                {['Name', 'Email', 'Created'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((a, i) => (
                <tr key={a.id} className={cn('hover:bg-[var(--color-bg-secondary)] transition-colors', i < admins.length - 1 && 'border-b border-[var(--color-border)]')}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-brand-cyan-soft)] flex items-center justify-center text-[12px] font-[700] text-[var(--color-brand-cyan)] shrink-0">
                        {a.first_name[0]}{a.last_name[0]}
                      </div>
                      <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{a.first_name} {a.last_name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[var(--color-text-secondary)]">{a.email}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--color-text-tertiary)]">
                    {new Date(a.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
