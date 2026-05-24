import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Users, MessageSquare, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useJobApplicants, useApplicantAction } from '@/lib/api/queries/useEmployer'
import { useStartConversation } from '@/lib/api/queries/useMessages'
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

function ApplicantRow({ applicant, onAction, onMessage, loading }: {
  applicant: Applicant
  onAction:  (id: number, action: 'accept' | 'shortlist' | 'reject') => void
  onMessage: (userId: number, name: string) => void
  loading:   boolean
}) {
  const initials = `${applicant.first_name[0] ?? '?'}${applicant.last_name[0] ?? '?'}`
  return (
    <div className="md:hidden bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          {applicant.avatar_url
            ? <img src={applicant.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
            : <div className="w-10 h-10 rounded-full bg-[var(--color-brand-orange-soft)] flex items-center justify-center text-[13px] font-[700] text-[var(--color-brand-orange)] shrink-0">{initials}</div>
          }
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
        {applicant.resume_url && (
          <Button size="sm" variant="outline" asChild>
            <a href={applicant.resume_url} target="_blank" rel="noreferrer">
              <Download className="w-3.5 h-3.5 mr-1" />CV
            </a>
          </Button>
        )}
        {applicant.user_id && (
          <Button size="sm" variant="outline"
            onClick={() => onMessage(applicant.user_id!, `${applicant.first_name} ${applicant.last_name}`)}>
            <MessageSquare className="w-3.5 h-3.5 mr-1" />Chat
          </Button>
        )}
      </div>
    </div>
  )
}

export function Component() {
  const { id }   = useParams<{ id: string }>()
  const jobId    = Number(id)
  const navigate = useNavigate()
  const { data, isLoading } = useJobApplicants(jobId)
  const action   = useApplicantAction(jobId)
  const startConv = useStartConversation()

  const applicants = data?.applications ?? []

  function act(applicantId: number, a: 'accept' | 'shortlist' | 'reject') {
    action.mutate({ applicantId, action: a })
  }

  function message(userId: number, name: string) {
    startConv.mutate(
      { userId, message: `Hi ${name.split(' ')[0]}, I came across your application and wanted to connect.` },
      { onSuccess: (conv) => navigate(`/employer/messages?c=${conv.id}`) },
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/employer/jobs" className="inline-flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-3">
          <ChevronLeft className="w-4 h-4" />Back to Jobs
        </Link>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">
          {data?.job_title ?? 'Applicants'}
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
        <EmptyState icon={Users} title="No applicants yet" description="Applications will appear here once candidates apply to this listing." />
      ) : (
        <>
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {applicants.map((a) => (
              <ApplicantRow key={a.id} applicant={a} onAction={act} onMessage={message} loading={action.isPending} />
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
                        {a.avatar_url
                          ? <img src={a.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                          : <div className="w-9 h-9 rounded-full bg-[var(--color-brand-orange-soft)] flex items-center justify-center text-[12px] font-[700] text-[var(--color-brand-orange)] shrink-0">{`${a.first_name[0] ?? '?'}${a.last_name[0] ?? '?'}`}</div>
                        }
                        <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{a.first_name} {a.last_name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[var(--color-text-secondary)]">{a.email}</td>
                    <td className="px-5 py-4"><Badge variant={statusVariant(a.status)}>{a.status}</Badge></td>
                    <td className="px-5 py-4 text-[13px] text-[var(--color-text-tertiary)]">{formatDate(a.applied_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" style={{ background: 'var(--color-brand-cyan)' }}
                          onClick={() => act(a.id, 'accept')} disabled={action.isPending}>Accept</Button>
                        <Button size="sm" style={{ background: 'var(--color-brand-yellow)', color: 'var(--color-brand-navy)' }}
                          onClick={() => act(a.id, 'shortlist')} disabled={action.isPending}>Shortlist</Button>
                        <Button size="sm" variant="outline"
                          onClick={() => act(a.id, 'reject')} disabled={action.isPending}>Reject</Button>
                        {a.resume_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={a.resume_url} target="_blank" rel="noreferrer">
                              <Download className="w-3.5 h-3.5 mr-1" />CV
                            </a>
                          </Button>
                        )}
                        {a.user_id && (
                          <Button size="sm" variant="outline" disabled={startConv.isPending}
                            onClick={() => message(a.user_id!, `${a.first_name} ${a.last_name}`)}>
                            <MessageSquare className="w-3.5 h-3.5 mr-1" />Chat
                          </Button>
                        )}
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
