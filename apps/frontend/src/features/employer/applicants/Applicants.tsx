import { Link } from 'react-router-dom'
import { Users, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useEmployerJobs } from '@/lib/api/queries/useEmployer'

export function Component() {
  const { data, isLoading } = useEmployerJobs()
  const jobs = (data?.jobs ?? []).filter((j) => (j.applicant_count ?? 0) > 0 || true)

  const totalApplicants = jobs.reduce((s, j) => s + (j.applicant_count ?? 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Applicants</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">
          {totalApplicants} total application{totalApplicants !== 1 ? 's' : ''} across {jobs.length} listing{jobs.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 rounded-[var(--radius-lg)]" />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No listings yet"
          description="Post a job to start receiving applications."
          action={{ label: 'Post a Job', onClick: () => { window.location.href = '/employer/jobs/new' } }}
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const count = job.applicant_count ?? 0
            return (
              <div key={job.id} className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-brand-orange-soft)] flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-[var(--color-brand-orange)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-[700] text-[var(--color-text-primary)] truncate">{job.title}</p>
                    <p className="text-[12px] text-[var(--color-text-tertiary)]">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[22px] font-[800] text-[var(--color-text-primary)] leading-none">{count}</p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)]">applicant{count !== 1 ? 's' : ''}</p>
                  </div>
                  <Badge variant={(job as unknown as { status?: string }).status === 'active' ? 'accepted' : 'chip'}>
                    {(job as unknown as { status?: string }).status ?? 'active'}
                  </Badge>
                  <Link to={`/employer/jobs/${job.id}/applicants`}>
                    <Button size="sm" disabled={count === 0}>
                      {count > 0 ? 'View' : 'None yet'}
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
