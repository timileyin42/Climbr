import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserCircle, ShieldCheck, Bell, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useTalentProfile, useUpdateTalentProfile } from '@/lib/api/queries/useTalent'
import { useAuthStore } from '@/lib/auth/store'
import { api } from '@/lib/api/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Profile tab ───────────────────────────────────────────────────────────────

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name:  z.string().min(1, 'Required'),
})
type ProfileForm = z.infer<typeof profileSchema>

function ProfileTab() {
  const { data: profile, isLoading, refetch } = useTalentProfile()
  const update   = useUpdateTalentProfile()
  const user     = useAuthStore((s) => s.user)
  const fileRef  = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? { first_name: profile.first_name, last_name: profile.last_name }
      : undefined,
  })

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('profile_image', file)
      await api.post('talent/profile/image/upload', { body: form }).json<unknown>()
      toast.success('Photo updated')
      refetch()
    } catch {
      toast.error('Failed to upload photo — try again')
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) return (
    <div className="space-y-4 max-w-md">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )

  const initials = `${profile?.first_name?.[0] ?? ''}${profile?.last_name?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <div>
      <h2 className="text-[20px] font-[700] text-[var(--color-text-primary)] mb-1">Profile</h2>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">Update your photo and personal details.</p>

      {/* Photo upload */}
      <div className="flex items-center gap-5 mb-6">
        <div className="relative">
          {profile?.profile?.summary !== undefined && (profile as any).profile_image_url ? (
            <img
              src={(profile as any).profile_image_url}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-[var(--color-border)]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[var(--color-brand-cyan)] flex items-center justify-center text-white text-[22px] font-[700] border-2 border-[var(--color-border)]">
              {initials}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-text-primary)] border-2 border-white flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <Camera className="w-3 h-3 text-white" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        {/* Upload drag area — Figma style */}
        <div
          className="flex-1 border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 text-center cursor-pointer hover:border-[var(--color-brand-cyan)] transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Camera className="w-5 h-5 text-[var(--color-text-tertiary)] mx-auto mb-1" />
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            <span className="font-[600] text-[var(--color-text-primary)]">Click to upload</span> or drag and drop
          </p>
          <p className="text-[12px] text-[var(--color-text-tertiary)]">SVG, PNG, JPG or GIF (max. 800×400px)</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((v) => update.mutate(v))}
        className="space-y-4 max-w-md"
      >
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Email</label>
          <Input type="email" value={user?.email ?? ''} readOnly className="opacity-60 cursor-default" />
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1">Email cannot be changed here.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save'}
          </Button>
          <Button type="button" variant="outline" onClick={() => {}}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

// ── Security tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
  return (
    <div>
      <h2 className="text-[20px] font-[700] text-[var(--color-text-primary)] mb-1">Security</h2>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">Manage your password and active sessions.</p>

      <div className="space-y-4 max-w-md">
        <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
          <h3 className="text-[15px] font-[700] text-[var(--color-text-primary)] mb-1">Change password</h3>
          <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">
            We'll send a password reset link to your registered email.
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
    </div>
  )
}

// ── Notifications tab ─────────────────────────────────────────────────────────

type NotifChannel = 'none' | 'in-app' | 'email'

const NOTIF_ROWS = [
  { key: 'job_updates',       label: 'Job Updates',                  desc: 'Get alerts when new jobs match your profile or saved keywords.' },
  { key: 'training_alerts',   label: 'Training Alerts',              desc: 'Be notified when new trainings are posted in categories you\'re interested in.' },
  { key: 'app_status',        label: 'Application Status Updates',   desc: 'Get notified when your job or training application status changes.' },
  { key: 'saved_reminders',   label: 'Saved Job/Training Reminders', desc: 'Reminders before a saved job or training expires or closes.' },
  { key: 'system',            label: 'System Notifications',         desc: 'Important platform changes, terms updates, or security alerts.' },
]

function ChannelToggle({
  value,
  onChange,
}: {
  value: NotifChannel
  onChange: (v: NotifChannel) => void
}) {
  const options: NotifChannel[] = ['none', 'in-app', 'email']
  return (
    <div className="flex items-center gap-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
          <div
            onClick={() => onChange(opt)}
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer',
              value === opt ? 'bg-[var(--color-brand-cyan)]' : 'bg-[var(--color-border)]',
            )}
          >
            <span
              className={cn(
                'w-4 h-4 rounded-full bg-white shadow transition-transform',
                value === opt ? 'translate-x-4' : 'translate-x-0.5',
              )}
            />
          </div>
          <span className="text-[12px] text-[var(--color-text-secondary)] capitalize">{opt === 'in-app' ? 'In-app' : opt === 'none' ? 'None' : 'Email'}</span>
        </label>
      ))}
    </div>
  )
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<string, NotifChannel>>(() =>
    Object.fromEntries(NOTIF_ROWS.map((r) => [r.key, 'in-app'])),
  )

  function set(key: string, value: NotifChannel) {
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <h2 className="text-[20px] font-[700] text-[var(--color-text-primary)] mb-1">Notifications</h2>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">Select when and how you'll be notified.</p>

      <div className="space-y-0 divide-y divide-[var(--color-border)] border-t border-b border-[var(--color-border)] mb-6">
        {NOTIF_ROWS.map(({ key, label, desc }) => (
          <div key={key} className="flex items-start justify-between gap-4 py-5">
            <div className="min-w-0">
              <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{label}</p>
              <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">{desc}</p>
            </div>
            <div className="shrink-0 pt-0.5">
              <ChannelToggle value={prefs[key]} onChange={(v) => set(key, v)} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={() => toast.success('Notification preferences saved')}>Save</Button>
        <Button variant="outline" onClick={() => setPrefs(Object.fromEntries(NOTIF_ROWS.map((r) => [r.key, 'in-app'])))}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'security' | 'notifications'

const NAV_ITEMS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'profile',       label: 'Profile',       icon: UserCircle },
  { key: 'security',      label: 'Security',       icon: ShieldCheck },
  { key: 'notifications', label: 'Notifications',  icon: Bell },
]

export function Component() {
  const [tab, setTab] = useState<Tab>('profile')

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
        <span>Settings</span>
        <span>›</span>
        <span className="text-[var(--color-text-primary)] font-[600] capitalize">{tab}</span>
      </div>

      <div className="flex gap-8 items-start">
        {/* Left sidebar nav — matches Figma */}
        <aside className="shrink-0 w-48">
          <p className="text-[11px] font-[700] text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3 px-3">Menu</p>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-[14px] font-[500] transition-colors text-left',
                  tab === key
                    ? 'bg-white shadow-[var(--shadow-card)] text-[var(--color-text-primary)] font-[600]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <div className="flex-1 bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 min-h-[400px]">
          {tab === 'profile'       && <ProfileTab />}
          {tab === 'security'      && <SecurityTab />}
          {tab === 'notifications' && <NotificationsTab />}
        </div>
      </div>
    </div>
  )
}
