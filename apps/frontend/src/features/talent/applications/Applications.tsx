import { useState } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useApplications, useRemoveApplication } from '@/lib/api/queries/useTalent'
import { cn } from '@/lib/utils'

type FilterKey = 'all' | 'job' | 'training' | 'pending' | 'in_review' | 'accepted' | 'rejected'

const tabs: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'job',       label: 'Jobs' },
  { key: 'training',  label: 'Trainings' },
  { key: 'pending',   label: 'Pending' },
  { key: 'in_review', label: 'In Review' },
  { key: 'accepted',  label: 'Accepted' },
  { key: 'rejected',  label: 'Rejected' },
]

const statusVariant: Record<string, 'pending' | 'in-review' | 'accepted' | 'rejected' | 'chip'> = {
  pending:   'pending',
  in_review: 'in-review',
  accepted:  'accepted',
  rejected:  'rejected',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function Component() {
  const [filter, setFilter] = useState<FilterKey>('all')

  const typeParam   = filter === 'job' ? 'job' : filter === 'training' ? 'training' : undefined
  const statusParam = ['pending', 'in_review', 'accepted', 'rejected'].includes(filter) ? filter : undefined

  const { data, isLoading } = useApplications({ type: typeParam, status: statusParam })
  const remove = useRemoveApplication()

  const applications = data?.applications ?? []
  const stats        = data?.stats

  function handleRemove(id: number, type: 'job' | 'training') {
    if (!window.confirm('Remove this application?')) return
    remove.mutate({ id, type })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">My Applications</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">Track the status of every application you've submitted.</p>
      </div>

      {/* Stats */}
      {!isLoading && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total',     value: stats.total_applications },
            { label: 'In Review', value: stats.in_review },
            { label: 'Accepted',  value: stats.accepted },
            { label: 'Rejected',  value: stats.rejected },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-4">
              <p className="text-[28px] font-[800] text-[var(--color-text-primary)]">{value}</p>
              <p className="text-[13px] text-[var(--color-text-secondary)]">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              'px-4 py-2 rounded-full text-[13px] font-[600] whitespace-nowrap transition-all',
              filter === key
                ? 'bg-[var(--color-brand-cyan)] text-white'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-20 w-full rounded-[var(--radius-lg)]" />)}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Start applying to jobs and trainings to see them here."
          action={{ label: 'Browse Jobs', onClick: () => window.location.href = '/jobs' }}
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14px] font-[700] text-[var(--color-text-primary)] truncate">{app.title}</p>
                    <p className="text-[13px] text-[var(--color-text-secondary)] truncate">{app.company}</p>
                  </div>
                  <button type="button" onClick={() => handleRemove(app.id, app.type)} className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-pink)]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="chip">{app.type === 'job' ? 'Job' : 'Training'}</Badge>
                  <Badge variant={statusVariant[app.status] ?? 'chip'}>{app.status.replace('_', ' ')}</Badge>
                  <span className="text-[12px] text-[var(--color-text-tertiary)] ml-auto">{formatDate(app.created_at)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  {['Type', 'Title', 'Company', 'Date Applied', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app, i) => (
                  <tr key={app.id} className={cn('border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors', i === applications.length - 1 && 'border-b-0')}>
                    <td className="px-4 py-3"><Badge variant="chip">{app.type === 'job' ? 'Job' : 'Training'}</Badge></td>
                    <td className="px-4 py-3 text-[14px] font-[600] text-[var(--color-text-primary)] max-w-[200px] truncate">{app.title}</td>
                    <td className="px-4 py-3 text-[14px] text-[var(--color-text-secondary)]">{app.company}</td>
                    <td className="px-4 py-3 text-[13px] text-[var(--color-text-tertiary)]">{formatDate(app.created_at)}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[app.status] ?? 'chip'}>{app.status.replace('_', ' ')}</Badge></td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => handleRemove(app.id, app.type)} className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-pink)] hover:bg-[var(--color-bg-tertiary)]">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
