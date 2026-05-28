import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Briefcase, MapPin, Users, Calendar, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useEmployerJobs } from '@/lib/api/queries/useEmployer'
import { cn } from '@/lib/utils'

const STATUS_TABS = [
  { value: 'all',      label: 'All Jobs'  },
  { value: 'active',   label: 'Active'    },
  { value: 'archived', label: 'Archived'  },
]

const JOB_TYPE_STYLES: Record<string, string> = {
  full_time:   'bg-orange-100 text-orange-600',
  part_time:   'bg-yellow-100 text-yellow-700',
  contract:    'bg-purple-100 text-purple-600',
  internship:  'bg-rose-100 text-rose-500',
  remote:      'bg-cyan-100 text-cyan-700',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

function timeUntilExpiry(iso: string) {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
  if (days < 0)  return { label: 'Expired', urgent: true }
  if (days === 0) return { label: 'Expires today', urgent: true }
  if (days <= 3) return { label: `${days}d left`, urgent: true }
  if (days <= 7) return { label: `${days}d left`, urgent: false }
  return { label: `${days}d left`, urgent: false }
}

export function Component() {
  const [statusFilter, setStatusFilter] = useState('all')
  const { data, isLoading } = useEmployerJobs(statusFilter === 'all' ? undefined : statusFilter)
  const jobs = data?.jobs ?? []

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">My Jobs</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">
            {data?.total ?? 0} listing{(data?.total ?? 0) !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          to="/employer/jobs/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-[700] text-white hover:opacity-90 transition-opacity shrink-0"
          style={{ background: 'var(--color-brand-orange)' }}
        >
          <Plus className="w-4 h-4" />
          Post Job
        </Link>
      </div>

      {/* ── Status tabs ─────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setStatusFilter(t.value)}
            className={cn(
              'px-5 py-3 text-[14px] font-[600] border-b-2 -mb-px transition-all',
              statusFilter === t.value
                ? 'border-[var(--color-brand-orange)] text-[var(--color-brand-orange)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-[100px] rounded-2xl" />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="Post your first job listing to start receiving applications."
          action={{ label: 'Post a Job', onClick: () => { window.location.href = '/employer/jobs/new' } }}
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const typeStyle = JOB_TYPE_STYLES[(job as unknown as { job_type?: string }).job_type ?? ''] ?? 'bg-orange-100 text-orange-600'
            const status    = (job as unknown as { status?: string }).status ?? 'active'
            const expiry    = (job as unknown as { expiry_date?: string }).expiry_date
            const expInfo   = expiry ? timeUntilExpiry(expiry) : null

            return (
              <div
                key={job.id}
                className="group bg-white border border-[#E4EBF0] rounded-2xl p-5 hover:border-[#CBD5E1] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200"
              >
                <div className="flex items-start gap-4">

                  {/* Color strip */}
                  <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: status === 'active' ? 'var(--color-brand-orange)' : '#CBD5E1' }} />

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-[700] text-[var(--color-text-primary)] line-clamp-1">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-[700] capitalize', typeStyle)}>
                            {((job as unknown as { job_type?: string }).job_type ?? 'full-time').replace('_', '-')}
                          </span>
                          <span className={cn(
                            'px-2.5 py-0.5 rounded-full text-[11px] font-[700] capitalize',
                            status === 'active' ? 'bg-green-100 text-green-700' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]'
                          )}>
                            {status}
                          </span>
                          {expInfo && (
                            <span className={cn('text-[11px] font-[600]', expInfo.urgent ? 'text-rose-500' : 'text-[var(--color-text-tertiary)]')}>
                              {expInfo.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/employer/jobs/${job.id}/applicants`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-[700] text-white transition-opacity hover:opacity-90"
                          style={{ background: 'var(--color-brand-orange)' }}
                        >
                          <Users className="w-3.5 h-3.5" />
                          {job.applicant_count}
                        </Link>
                        <Link
                          to={`/employer/jobs/${job.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[12px] font-[600] text-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)] transition-colors"
                        >
                          Edit <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-4 text-[12px] text-[var(--color-text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />Posted {formatDate(job.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />{job.industry ?? 'General'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
