import { Briefcase, Users, CreditCard, BarChart2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCardSkeleton } from '@/components/feedback/Skeleton'
import { useEmployerJobs, useEmployerCredits } from '@/lib/api/queries/useEmployer'
import { useAuthStore } from '@/lib/auth/store'

export function Component() {
  const user                                        = useAuthStore((s) => s.user)
  const { data: jobsData, isLoading: loadingJobs }  = useEmployerJobs()
  const { data: creditsData, isLoading: loadingCreds } = useEmployerCredits()

  const loading    = loadingJobs || loadingCreds
  const jobs       = jobsData?.jobs ?? []
  const activeJobs = jobs.filter((j) => (j as unknown as { status?: string }).status === 'active').length
  const totalApps  = jobs.reduce((sum, j) => sum + (j.applicant_count ?? 0), 0)
  const avgApps    = activeJobs > 0 ? Math.round(totalApps / activeJobs) : 0
  const credits    = creditsData?.job_credits ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">
          Welcome, {user?.firstName}!
        </h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">
          Manage your job listings and find your next hire.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
        ) : (
          [
            { label: 'Active Jobs',          value: activeJobs, icon: Briefcase, color: 'var(--color-brand-orange)', bg: 'var(--color-brand-orange-soft)' },
            { label: 'Total Applicants',     value: totalApps,  icon: Users,     color: 'var(--color-brand-cyan)',   bg: 'var(--color-brand-cyan-soft)' },
            { label: 'Credits Remaining',    value: credits,    icon: CreditCard,color: 'var(--color-brand-yellow)', bg: '#FFF8E0' },
            { label: 'Avg Applicants / Job', value: avgApps,    icon: BarChart2, color: 'var(--color-brand-pink)',   bg: '#FDE8F3' },
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

      {/* Recent listings */}
      {jobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-[700] text-[var(--color-text-primary)]">Recent Listings</h2>
            <Link to="/employer/jobs" className="text-[13px] text-[var(--color-brand-cyan)] font-[600] hover:underline">View all</Link>
          </div>
          <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            {jobs.slice(0, 5).map((job, i) => (
              <div key={job.id} className={`flex items-center justify-between px-5 py-4 ${i < Math.min(jobs.length, 5) - 1 ? 'border-b border-[var(--color-border)]' : ''}`}>
                <div>
                  <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{job.title}</p>
                  <p className="text-[12px] text-[var(--color-text-tertiary)]">{job.applicant_count} applicants · {job.location}</p>
                </div>
                <Link to={`/employer/jobs/${job.id}`} className="text-[13px] text-[var(--color-brand-cyan)] font-[600] hover:underline">View</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
