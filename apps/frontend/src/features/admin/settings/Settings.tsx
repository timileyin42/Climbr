import { useAuthStore } from '@/lib/auth/store'

export function Component() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Admin Settings</h1>

      <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4">
        <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)]">Account</h2>
        <div className="space-y-3">
          {[
            { label: 'Email', value: user?.email ?? '—' },
            { label: 'Name',  value: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || '—' },
            { label: 'Role',  value: 'Administrator' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
              <span className="text-[13px] font-[600] text-[var(--color-text-secondary)]">{label}</span>
              <span className="text-[14px] text-[var(--color-text-primary)]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
        <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)] mb-2">Session</h2>
        <div className="p-3 bg-[var(--color-bg-secondary)] rounded-[var(--radius-md)] flex items-center justify-between">
          <div>
            <p className="text-[13px] font-[600] text-[var(--color-text-primary)]">Current device</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)]">Admin portal · Active now</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>
    </div>
  )
}
