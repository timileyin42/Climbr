import { useState } from 'react'
import { EyeOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Briefcase } from 'lucide-react'
import { useAdminJobs, useAdminTrainings, useAdminJobAction, useAdminTrainingAction } from '@/lib/api/queries/useAdmin'
import type { Job, Training } from '@/lib/api/endpoints/jobs'
import { cn } from '@/lib/utils'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

function JobsTab() {
  const [statusFilter, setStatusFilter] = useState('')
  const { data: jobs, isLoading } = useAdminJobs(statusFilter ? { status: statusFilter } : undefined)
  const action = useAdminJobAction()
  const rows = jobs ?? []

  function act(id: number, a: 'unpublish' | 'delete') {
    if (window.confirm(a === 'delete' ? 'Delete this job permanently?' : 'Unpublish this listing?'))
      action.mutate({ id, action: a })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border-2 border-[var(--color-border)] rounded-[var(--radius-md)] text-[14px] text-[var(--color-text-primary)] bg-white outline-none focus:border-[var(--color-brand-cyan)]">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs found" description="Try a different filter." />
      ) : (
        <div className="overflow-x-auto bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)]">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                {['Title', 'Employer', 'Status', 'Applicants', 'Posted', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((j: Job, i) => (
                <tr key={j.id} className={cn('hover:bg-[var(--color-bg-secondary)] transition-colors', i < rows.length - 1 && 'border-b border-[var(--color-border)]')}>
                  <td className="px-5 py-4">
                    <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{j.title}</p>
                    <p className="text-[12px] text-[var(--color-text-tertiary)]">{j.location}</p>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[var(--color-text-secondary)]">{j.employer_name}</td>
                  <td className="px-5 py-4">
                    <Badge variant={(j as unknown as { status?: string }).status === 'active' ? 'accepted' : 'chip'}>
                      {(j as unknown as { status?: string }).status ?? 'active'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-[14px] text-[var(--color-text-secondary)]">{j.applicant_count}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--color-text-tertiary)]">{formatDate(j.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => act(j.id, 'unpublish')} disabled={action.isPending}><EyeOff className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => act(j.id, 'delete')} disabled={action.isPending}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Trainings ─────────────────────────────────────────────────────────────────

function TrainingsTab() {
  const [statusFilter, setStatusFilter] = useState('')
  const { data: trainings, isLoading } = useAdminTrainings(statusFilter ? { status: statusFilter } : undefined)
  const action = useAdminTrainingAction()
  const rows = trainings ?? []

  function act(id: number, a: 'unpublish' | 'delete') {
    if (window.confirm(a === 'delete' ? 'Delete this training permanently?' : 'Unpublish this listing?'))
      action.mutate({ id, action: a })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border-2 border-[var(--color-border)] rounded-[var(--radius-md)] text-[14px] text-[var(--color-text-primary)] bg-white outline-none focus:border-[var(--color-brand-cyan)]">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon={Briefcase} title="No trainings found" description="Try a different filter." />
      ) : (
        <div className="overflow-x-auto bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)]">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                {['Title', 'Trainer', 'Status', 'Applicants', 'Start Date', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t: Training, i) => (
                <tr key={t.id} className={cn('hover:bg-[var(--color-bg-secondary)] transition-colors', i < rows.length - 1 && 'border-b border-[var(--color-border)]')}>
                  <td className="px-5 py-4">
                    <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{t.title}</p>
                    <p className="text-[12px] text-[var(--color-text-tertiary)]">{t.category}</p>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[var(--color-text-secondary)]">{t.trainer_name}</td>
                  <td className="px-5 py-4">
                    <Badge variant={(t as unknown as { status?: string }).status === 'active' ? 'accepted' : 'chip'}>
                      {(t as unknown as { status?: string }).status ?? 'active'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-[14px] text-[var(--color-text-secondary)]">{t.applicant_count}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--color-text-tertiary)]">{formatDate(t.start_date)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => act(t.id, 'unpublish')} disabled={action.isPending}><EyeOff className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => act(t.id, 'delete')} disabled={action.isPending}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Tab = 'jobs' | 'trainings'

export function Component() {
  const [tab, setTab] = useState<Tab>('jobs')

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Content</h1>

      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {(['jobs', 'trainings'] as Tab[]).map((key) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={cn('px-5 py-3 text-[14px] font-[600] border-b-2 -mb-px transition-all capitalize',
              tab === key
                ? 'border-[var(--color-brand-cyan)] text-[var(--color-brand-cyan)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}>
            {key}
          </button>
        ))}
      </div>

      {tab === 'jobs'      && <JobsTab />}
      {tab === 'trainings' && <TrainingsTab />}
    </div>
  )
}
