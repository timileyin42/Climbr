import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useEmployerJobs } from '@/lib/api/queries/useEmployer'
import { cn } from '@/lib/utils'

const statusFilters = ['all', 'active', 'archived']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function Component() {
  const [statusFilter, setStatusFilter] = useState('all')
  const { data, isLoading } = useEmployerJobs(statusFilter === 'all' ? undefined : statusFilter)
  const jobs = data?.jobs ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">My Jobs</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">{data?.total ?? 0} listings total</p>
        </div>
        <Link to="/employer/jobs/new"><Button className="gap-2"><Plus className="w-4 h-4" />Post Job</Button></Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-1">
        {statusFilters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatusFilter(f)}
            className={cn(
              'px-4 py-2 rounded-full text-[13px] font-[600] capitalize transition-all',
              statusFilter === f
                ? 'bg-[var(--color-brand-orange)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16 rounded-[var(--radius-lg)]" />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="Post your first job listing to start receiving applications."
          action={{ label: 'Post a Job', onClick: () => window.location.href = '/employer/jobs/new' }}
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[14px] font-[700] text-[var(--color-text-primary)]">{job.title}</p>
                  <Badge variant={(job as unknown as { status?: string }).status === 'active' ? 'accepted' : 'chip'}>
                    {(job as unknown as { status?: string }).status ?? 'active'}
                  </Badge>
                </div>
                <p className="text-[12px] text-[var(--color-text-tertiary)] mb-3">{job.applicant_count} applicants · {job.location}</p>
                <div className="flex gap-2">
                  <Link to={`/employer/jobs/${job.id}`}><Button size="sm" variant="outline">View</Button></Link>
                  <Link to={`/employer/jobs/${job.id}/applicants`}><Button size="sm">Applicants</Button></Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  {['Title', 'Status', 'Applicants', 'Posted', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => (
                  <tr key={job.id} className={cn('hover:bg-[var(--color-bg-secondary)] transition-colors', i < jobs.length - 1 && 'border-b border-[var(--color-border)]')}>
                    <td className="px-5 py-4">
                      <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{job.title}</p>
                      <p className="text-[12px] text-[var(--color-text-tertiary)]">{job.location}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={(job as unknown as { status?: string }).status === 'active' ? 'accepted' : 'chip'}>
                        {(job as unknown as { status?: string }).status ?? 'active'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-[14px] text-[var(--color-text-secondary)]">{job.applicant_count}</td>
                    <td className="px-5 py-4 text-[13px] text-[var(--color-text-tertiary)]">{formatDate(job.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Link to={`/employer/jobs/${job.id}`}><Button size="sm" variant="outline">Edit</Button></Link>
                        <Link to={`/employer/jobs/${job.id}/applicants`}><Button size="sm">Applicants</Button></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
