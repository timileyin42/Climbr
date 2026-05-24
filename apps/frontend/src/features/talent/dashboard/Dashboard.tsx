import { FileText, Clock, Star, Bookmark, ArrowRight, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { JobCard } from '@/components/cards/JobCard'
import { JobCardSkeleton, StatCardSkeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useTalentDashboard } from '@/lib/api/queries/useTalent'
import { useMyViewers } from '@/lib/api/queries/useMessages'
import { useAuthStore } from '@/lib/auth/store'

const statConfig = [
  { key: 'total_applications',      label: 'Total Applications', icon: FileText, color: 'var(--color-brand-cyan)',   bg: 'var(--color-brand-cyan-soft)' },
  { key: 'applications_in_review',  label: 'In Review',          icon: Clock,    color: 'var(--color-brand-orange)', bg: 'var(--color-brand-orange-soft)' },
  { key: 'shortlisted_applications',label: 'Shortlisted',        icon: Star,     color: 'var(--color-brand-yellow)', bg: '#FFF8E0' },
  { key: 'total_saved_jobs',        label: 'Saved Jobs',         icon: Bookmark, color: 'var(--color-brand-pink)',   bg: '#FDE8F3' },
] as const

function today() {
  return new Date().toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function Component() {
  const user      = useAuthStore((s) => s.user)
  const { data, isLoading } = useTalentDashboard()
  const { data: viewersData } = useMyViewers()

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">{today()}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
          : statConfig.map(({ key, label, icon: Icon, color, bg }) => (
              <div key={key} className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: bg }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-[28px] font-[800] text-[var(--color-text-primary)]">
                  {data?.[key] ?? 0}
                </p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">{label}</p>
              </div>
            ))
        }
      </div>

      {/* Who viewed my profile */}
      {viewersData && viewersData.total_views > 0 && (
        <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--color-brand-cyan-soft)' }}>
                <Eye className="w-4 h-4" style={{ color: 'var(--color-brand-cyan)' }} />
              </div>
              <div>
                <p className="text-[14px] font-[700] text-[var(--color-text-primary)]">Profile Views</p>
                <p className="text-[12px] text-[var(--color-text-tertiary)]">{viewersData.total_views} view{viewersData.total_views !== 1 ? 's' : ''} total</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {viewersData.viewers.slice(0, 6).map((v) => {
              const initials = v.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
              return (
                <div key={v.id} className="flex items-center gap-2 bg-[var(--color-bg-secondary)] rounded-[var(--radius-md)] px-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-brand-orange-soft)] flex items-center justify-center text-[11px] font-[700] text-[var(--color-brand-orange)] shrink-0">
                    {initials || '?'}
                  </div>
                  <div>
                    <p className="text-[13px] font-[600] text-[var(--color-text-primary)] leading-none">{v.name}</p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] capitalize mt-0.5">{v.role}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Profile completion */}
      {!isLoading && data && data.profile_completion < 100 && (
        <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">
              Profile {data.profile_completion}% complete
            </p>
            <Link to="/profile" className="text-[13px] text-[var(--color-brand-cyan)] hover:underline font-[600]">
              Complete profile
            </Link>
          </div>
          <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-brand-cyan)] transition-all duration-500"
              style={{ width: `${data.profile_completion}%` }}
            />
          </div>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-2">
            A complete profile gets 3× more views from employers.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {!isLoading && data && data.quick_actions.length > 0 && (
        <div>
          <h2 className="text-[18px] font-[700] text-[var(--color-text-primary)] mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            {data.quick_actions.map((action) => (
              <Link key={action.route} to={action.route}>
                <Button variant="outline" className="gap-2">
                  {action.label}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-[700] text-[var(--color-text-primary)]">Featured Jobs</h2>
          <Link to="/jobs" className="text-[13px] text-[var(--color-brand-cyan)] hover:underline font-[600]">View all</Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : data?.featured_jobs?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.featured_jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No featured jobs yet"
            description="Check back soon — employers are posting daily."
            action={{ label: 'Browse all jobs', onClick: () => window.location.href = '/jobs' }}
          />
        )}
      </div>
    </div>
  )
}
