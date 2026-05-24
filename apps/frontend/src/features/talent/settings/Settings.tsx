import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useTalentProfile, useUpdateTalentProfile } from '@/lib/api/queries/useTalent'
import { cn } from '@/lib/utils'

// ── Profile tab ───────────────────────────────────────────────────────────────

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name:  z.string().min(1, 'Required'),
  phone:      z.string().optional(),
})
type ProfileForm = z.infer<typeof profileSchema>

function ProfileTab() {
  const { data: profile, isLoading } = useTalentProfile()
  const update = useUpdateTalentProfile()

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile ? { first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone ?? '' } : undefined,
  })

  if (isLoading) return (
    <div className="space-y-4 max-w-sm">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )

  return (
    <form onSubmit={handleSubmit((v) => update.mutate(v))} className="space-y-4 max-w-sm">
      <div>
        <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">First name</label>
        <Input {...register('first_name')} />
        {errors.first_name && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.first_name.message}</p>}
      </div>
      <div>
        <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Last name</label>
        <Input {...register('last_name')} />
        {errors.last_name && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.last_name.message}</p>}
      </div>
      <div>
        <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Phone</label>
        <Input type="tel" placeholder="+234 800 000 0000" {...register('phone')} />
      </div>
      <Button type="submit" disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save changes'}</Button>
    </form>
  )
}

// ── Security tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
  return (
    <div className="space-y-6 max-w-sm">
      <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
        <h3 className="text-[15px] font-[700] text-[var(--color-text-primary)] mb-1">Change password</h3>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">
          We'll send a reset link to your email address.
        </p>
        <Link to="/forgot-password">
          <Button variant="outline">Send reset link</Button>
        </Link>
      </div>

      <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
        <h3 className="text-[15px] font-[700] text-[var(--color-text-primary)] mb-1">Active sessions</h3>
        <div className="mt-3 p-3 bg-[var(--color-bg-secondary)] rounded-[var(--radius-md)] flex items-center justify-between">
          <div>
            <p className="text-[13px] font-[600] text-[var(--color-text-primary)]">Current device</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)]">Web browser · Active now</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>
    </div>
  )
}

// ── Notifications tab ─────────────────────────────────────────────────────────

const notifRows = ['Job Updates', 'Application Status', 'Training Alerts', 'Saved Job Reminders']
const notifCols = ['Email', 'Push', 'SMS']

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
        on ? 'bg-[var(--color-brand-cyan)]' : 'bg-[var(--color-border)]'
      )}
    >
      <span className={cn('w-4 h-4 rounded-full bg-white shadow transition-transform', on ? 'translate-x-4' : 'translate-x-0.5')} />
    </button>
  )
}

function NotificationsTab() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    notifRows.forEach((r) => notifCols.forEach((c) => { init[`${r}::${c}`] = c === 'Email' }))
    return init
  })

  function toggle(key: string) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[360px]">
        <thead>
          <tr>
            <th className="text-left text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase pb-3 pr-6">Notification</th>
            {notifCols.map((c) => <th key={c} className="text-center text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase pb-3 px-4">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {notifRows.map((row) => (
            <tr key={row} className="border-t border-[var(--color-border)]">
              <td className="py-4 pr-6 text-[14px] font-[500] text-[var(--color-text-primary)]">{row}</td>
              {notifCols.map((col) => (
                <td key={col} className="py-4 px-4 text-center">
                  <Toggle on={toggles[`${row}::${col}`]} onChange={() => toggle(`${row}::${col}`)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'security' | 'notifications'
const tabs: { key: Tab; label: string }[] = [
  { key: 'profile',       label: 'Profile' },
  { key: 'security',      label: 'Security' },
  { key: 'notifications', label: 'Notifications' },
]

export function Component() {
  const [tab, setTab] = useState<Tab>('profile')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Settings</h1>
      </div>

      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'px-5 py-3 text-[14px] font-[600] border-b-2 -mb-px transition-all',
              tab === key
                ? 'border-[var(--color-brand-cyan)] text-[var(--color-brand-cyan)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
        {tab === 'profile'       && <ProfileTab />}
        {tab === 'security'      && <SecurityTab />}
        {tab === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  )
}
