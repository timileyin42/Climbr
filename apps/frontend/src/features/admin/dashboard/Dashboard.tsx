import { Users, Briefcase, Layers, DollarSign, UserCheck, Archive } from 'lucide-react'
import { StatCardSkeleton } from '@/components/feedback/Skeleton'
import { useAdminDashboard } from '@/lib/api/queries/useAdmin'

function StatCard({ label, value, icon: Icon, color, bg }: {
  label: string; value: number | string; icon: React.ElementType; color: string; bg: string
}) {
  return (
    <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: bg }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-[28px] font-[800] text-[var(--color-text-primary)]">{value}</p>
      <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">{label}</p>
    </div>
  )
}

export function Component() {
  const { data, isLoading } = useAdminDashboard()

  const stats = data ? [
    { label: 'Total Talents',      value: data.total_talents,          icon: Users,      color: 'var(--color-brand-cyan)',   bg: 'var(--color-brand-cyan-soft)' },
    { label: 'Total Employers',    value: data.total_employers,        icon: UserCheck,  color: 'var(--color-brand-orange)', bg: 'var(--color-brand-orange-soft)' },
    { label: 'Total Trainers',     value: data.total_trainers,         icon: UserCheck,  color: 'var(--color-brand-yellow)', bg: '#FFF8E0' },
    { label: 'Active Jobs',        value: data.total_active_jobs,      icon: Briefcase,  color: 'var(--color-brand-cyan)',   bg: 'var(--color-brand-cyan-soft)' },
    { label: 'Active Trainings',   value: data.total_active_trainings, icon: Layers,     color: 'var(--color-brand-yellow)', bg: '#FFF8E0' },
    { label: 'Archived Jobs',      value: data.total_inactive_jobs,    icon: Archive,    color: 'var(--color-text-secondary)', bg: 'var(--color-bg-tertiary)' },
    { label: 'Archived Trainings', value: data.total_inactive_trainings, icon: Archive,  color: 'var(--color-text-secondary)', bg: 'var(--color-bg-tertiary)' },
    { label: 'Total Revenue',      value: `₦${(data.total_revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'var(--color-status-accepted)', bg: 'var(--color-status-accepted-bg)' },
  ] : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Admin Dashboard</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">Platform overview at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => <StatCardSkeleton key={i} />)
          : stats.map((s) => <StatCard key={s.label} {...s} />)
        }
      </div>

      {data && (
        <div className="bg-[var(--color-brand-navy)] rounded-[var(--radius-xl)] p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Total Users', value: data.total_talents + data.total_employers + data.total_trainers },
            { label: 'Live Listings', value: data.total_active_jobs + data.total_active_trainings },
            { label: 'Archived', value: data.total_inactive_jobs + data.total_inactive_trainings },
            { label: 'Revenue', value: `₦${((data.total_revenue ?? 0) / 1000).toFixed(0)}k` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[28px] font-[800] text-white">{value}</p>
              <p className="text-white/50 text-[13px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
