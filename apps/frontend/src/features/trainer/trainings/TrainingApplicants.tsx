import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useTrainingApplicants, useTrainerApplicantAction } from '@/lib/api/queries/useTrainer'
import type { Applicant } from '@/lib/api/endpoints/employer'
import { cn } from '@/lib/utils'

function statusVariant(status: string): 'accepted' | 'shortlisted' | 'rejected' | 'chip' {
  if (status === 'accepted')    return 'accepted'
  if (status === 'shortlisted') return 'shortlisted'
  if (status === 'rejected')    return 'rejected'
  return 'chip'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

function MobileCard({ applicant, onAction, loading }: {
  applicant: Applicant
  onAction: (id: number, action: 'accept' | 'shortlist' | 'reject') => void
  loading: boolean
}) {
  const initials = `${applicant.first_name[0] ?? '?'}${applicant.last_name[0] ?? '?'}`
  return (
    <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-[700] shrink-0" style={{ background: '#FFF8E0', color: 'var(--color-brand-navy)' }}>
            {initials}
          </div>
          <div>
            <p className="text-[14px] font-[700] text-[var(--color-text-primary)]">{applicant.first_name} {applicant.last_name}</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)]">{applicant.email}</p>
          </div>
        </div>
        <Badge variant={statusVariant(applicant.status)}>{applicant.status}</Badge>
      </div>
      <p className="text-[12px] text-[var(--color-text-tertiary)] mb-3">Applied {formatDate(applicant.applied_at)}</p>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" style={{ background: 'var(--color-brand-cyan)' }}
          onClick={() => onAction(applicant.id, 'accept')} disabled={loading}>Accept</Button>
        <Button size="sm" style={{ background: 'var(--color-brand-yellow)', color: 'var(--color-brand-navy)' }}
          onClick={() => onAction(applicant.id, 'shortlist')} disabled={loading}>Shortlist</Button>
        <Button size="sm" variant="outline"
          onClick={() => onAction(applicant.id, 'reject')} disabled={loading}>Reject</Button>
      </div>
    </div>
  )
}

export function Component() {
  const { id }       = useParams<{ id: string }>()
  const trainingId   = Number(id)
  const { data, isLoading } = useTrainingApplicants(trainingId)
  const action = useTrainerApplicantAction(trainingId)

  const applicants = data?.applications ?? []

  function act(applicantId: number, a: 'accept' | 'shortlist' | 'reject') {
    action.mutate({ applicantId, action: a })
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/trainer/trainings" className="inline-flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-3">
          <ChevronLeft className="w-4 h-4" />Back to Trainings
        </Link>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">
          {data?.training_title ?? 'Applicants'}
        </h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">
          {data?.total_applications ?? 0} total application{(data?.total_applications ?? 0) !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-20 rounded-[var(--radius-lg)]" />)}
        </div>
      ) : applicants.length === 0 ? (
        <EmptyState icon={Users} title="No applicants yet" description="Applications will appear here once candidates enrol in this programme." />
      ) : (
        <>
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {applicants.map((a) => (
              <MobileCard key={a.id} applicant={a} onAction={act} loading={action.isPending} />
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden md:block bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  {['Applicant', 'Email', 'Status', 'Applied', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applicants.map((a, i) => (
                  <tr key={a.id} className={cn('hover:bg-[var(--color-bg-secondary)] transition-colors', i < applicants.length - 1 && 'border-b border-[var(--color-border)]')}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-[700] shrink-0"
                             style={{ background: '#FFF8E0', color: 'var(--color-brand-navy)' }}>
                          {`${a.first_name[0] ?? '?'}${a.last_name[0] ?? '?'}`}
                        </div>
                        <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{a.first_name} {a.last_name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[var(--color-text-secondary)]">{a.email}</td>
                    <td className="px-5 py-4"><Badge variant={statusVariant(a.status)}>{a.status}</Badge></td>
                    <td className="px-5 py-4 text-[13px] text-[var(--color-text-tertiary)]">{formatDate(a.applied_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" style={{ background: 'var(--color-brand-cyan)' }}
                          onClick={() => act(a.id, 'accept')} disabled={action.isPending}>Accept</Button>
                        <Button size="sm" style={{ background: 'var(--color-brand-yellow)', color: 'var(--color-brand-navy)' }}
                          onClick={() => act(a.id, 'shortlist')} disabled={action.isPending}>Shortlist</Button>
                        <Button size="sm" variant="outline"
                          onClick={() => act(a.id, 'reject')} disabled={action.isPending}>Reject</Button>
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
