import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useTrainerTrainings } from '@/lib/api/queries/useTrainer'
import { cn } from '@/lib/utils'

const statusFilters = ['all', 'active', 'archived']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function Component() {
  const [statusFilter, setStatusFilter] = useState('all')
  const { data, isLoading } = useTrainerTrainings(statusFilter === 'all' ? undefined : statusFilter)
  const trainings = data?.trainings ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">My Trainings</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">{data?.total ?? 0} listings total</p>
        </div>
        <Link to="/trainer/trainings/new">
          <Button className="gap-2" style={{ background: 'var(--color-brand-yellow)', color: 'var(--color-brand-navy)' }}>
            <Plus className="w-4 h-4" />Post Training
          </Button>
        </Link>
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
                ? 'text-[var(--color-brand-navy)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
            )}
            style={statusFilter === f ? { background: 'var(--color-brand-yellow)' } : undefined}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16 rounded-[var(--radius-lg)]" />)}
        </div>
      ) : trainings.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No trainings yet"
          description="Post your first training programme to start receiving applications."
          action={{ label: 'Post a Training', onClick: () => { window.location.href = '/trainer/trainings/new' } }}
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {trainings.map((t) => (
              <div key={t.id} className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[14px] font-[700] text-[var(--color-text-primary)]">{t.title}</p>
                  <Badge variant={(t as unknown as { status?: string }).status === 'active' ? 'accepted' : 'chip'}>
                    {(t as unknown as { status?: string }).status ?? 'active'}
                  </Badge>
                </div>
                <p className="text-[12px] text-[var(--color-text-tertiary)] mb-3">{t.applicant_count} applicants · {t.category}</p>
                <div className="flex gap-2">
                  <Link to={`/trainer/trainings/${t.id}`}><Button size="sm" variant="outline">View</Button></Link>
                  <Link to={`/trainer/trainings/${t.id}/applicants`}><Button size="sm">Applicants</Button></Link>
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
                {trainings.map((t, i) => (
                  <tr key={t.id} className={cn('hover:bg-[var(--color-bg-secondary)] transition-colors', i < trainings.length - 1 && 'border-b border-[var(--color-border)]')}>
                    <td className="px-5 py-4">
                      <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{t.title}</p>
                      <p className="text-[12px] text-[var(--color-text-tertiary)]">{t.category}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={(t as unknown as { status?: string }).status === 'active' ? 'accepted' : 'chip'}>
                        {(t as unknown as { status?: string }).status ?? 'active'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-[14px] text-[var(--color-text-secondary)]">{t.applicant_count}</td>
                    <td className="px-5 py-4 text-[13px] text-[var(--color-text-tertiary)]">{formatDate(t.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Link to={`/trainer/trainings/${t.id}`}><Button size="sm" variant="outline">Edit</Button></Link>
                        <Link to={`/trainer/trainings/${t.id}/applicants`}><Button size="sm">Applicants</Button></Link>
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
