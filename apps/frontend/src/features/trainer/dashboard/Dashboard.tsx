import { Layers, Users, CreditCard, BarChart2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StatCardSkeleton } from '@/components/feedback/Skeleton'
import { useTrainerTrainings, useTrainerCredits } from '@/lib/api/queries/useTrainer'
import { useAuthStore } from '@/lib/auth/store'

export function Component() {
  const user = useAuthStore((s) => s.user)
  const { data: trainingsData, isLoading: loadingTrainings } = useTrainerTrainings()
  const { data: creditsData,   isLoading: loadingCredits   } = useTrainerCredits()

  const loading    = loadingTrainings || loadingCredits
  const trainings  = trainingsData?.trainings ?? []
  const activeCount = trainings.filter((t) => (t as unknown as { status?: string }).status === 'active').length
  const totalApps  = trainings.reduce((sum, t) => sum + (t.applicant_count ?? 0), 0)
  const avgApps    = activeCount > 0 ? Math.round(totalApps / activeCount) : 0
  const credits    = creditsData?.training_credits ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">
          Welcome, {user?.firstName}!
        </h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">
          Manage your training programmes and find your next cohort.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
        ) : (
          [
            { label: 'Active Trainings',     value: activeCount, icon: Layers,     color: 'var(--color-brand-yellow)', bg: '#FFF8E0' },
            { label: 'Total Applicants',     value: totalApps,   icon: Users,      color: 'var(--color-brand-cyan)',   bg: 'var(--color-brand-cyan-soft)' },
            { label: 'Credits Remaining',    value: credits,     icon: CreditCard, color: 'var(--color-brand-orange)', bg: 'var(--color-brand-orange-soft)' },
            { label: 'Avg Applicants / Training', value: avgApps, icon: BarChart2, color: 'var(--color-brand-pink)',   bg: '#FDE8F3' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-[28px] font-[800] text-[var(--color-text-primary)]">{value}</p>
              <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">{label}</p>
            </div>
          ))
        )}
      </div>

      {/* Recent trainings */}
      {trainings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-[700] text-[var(--color-text-primary)]">Recent Trainings</h2>
            <Link to="/trainer/trainings" className="text-[13px] text-[var(--color-brand-cyan)] font-[600] hover:underline">View all</Link>
          </div>
          <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            {trainings.slice(0, 5).map((t, i) => (
              <div key={t.id} className={`flex items-center justify-between px-5 py-4 ${i < Math.min(trainings.length, 5) - 1 ? 'border-b border-[var(--color-border)]' : ''}`}>
                <div>
                  <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{t.title}</p>
                  <p className="text-[12px] text-[var(--color-text-tertiary)]">{t.applicant_count} applicants · {t.category}</p>
                </div>
                <Link to={`/trainer/trainings/${t.id}/applicants`} className="text-[13px] text-[var(--color-brand-cyan)] font-[600] hover:underline">View</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
