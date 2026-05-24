import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, Users, Calendar, Bookmark, BookmarkCheck, ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useJob } from '@/lib/api/queries/useJobs'
import { useApplyJob, useSaveJob, useUnsaveJob, useSavedJobs } from '@/lib/api/queries/useTalent'
import { useAuthStore } from '@/lib/auth/store'

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null
  const fmt = (n: number) => n >= 1000 ? `₦${(n / 1000).toFixed(0)}k` : `₦${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}/mo`
  if (min) return `From ${fmt(min)}/mo`
  return `Up to ${fmt(max!)}/mo`
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 7) return `${d} days ago`
  return `${Math.floor(d / 7)} weeks ago`
}

export function Component() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const user      = useAuthStore((s) => s.user)
  const [confirm, setConfirm] = useState(false)
  const [applied, setApplied] = useState(false)

  const { data: job, isLoading, isError } = useJob(Number(id))
  const { data: savedData }               = useSavedJobs()
  const applyJob  = useApplyJob()
  const saveJob   = useSaveJob()
  const unsaveJob = useUnsaveJob()

  const savedEntry = savedData?.find((s) => s.job.id === Number(id))
  const isSaved    = !!savedEntry

  function toggleSave() {
    if (isSaved) unsaveJob.mutate(savedEntry!.id)
    else saveJob.mutate(Number(id))
  }

  function confirmApply() {
    applyJob.mutate(Number(id), {
      onSuccess: () => { setApplied(true); setConfirm(false) },
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-16 w-16 rounded-[var(--radius-md)]" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-[var(--radius-xl)]" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[18px] font-[600] text-[var(--color-text-primary)] mb-2">Job not found</p>
        <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">This listing may have been removed or expired.</p>
        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    )
  }

  const salary = formatSalary(job.salary_min, job.salary_max)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)] mb-6">
        <Link to="/jobs" className="flex items-center gap-1 hover:text-[var(--color-text-primary)]">
          <ArrowLeft className="w-3.5 h-3.5" />Jobs
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-primary)] font-[500] line-clamp-1">{job.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: job content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="w-16 h-16 rounded-[var(--radius-md)] bg-[var(--color-brand-navy)] flex items-center justify-center text-[22px] font-[800] text-white mb-4">
              {job.employer_name.charAt(0)}
            </div>
            <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)] mb-1">{job.title}</h1>
            <p className="text-[16px] text-[var(--color-text-secondary)] mb-3">{job.employer_name}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="chip">{job.job_type.replace('_', '-')}</Badge>
              {job.experience_level && <Badge variant="chip">{job.experience_level}</Badge>}
              {job.industry && <Badge variant="chip">{job.industry}</Badge>}
            </div>
            <div className="flex flex-wrap gap-4 text-[13px] text-[var(--color-text-tertiary)]">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{job.applicant_count} applicants</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Posted {timeAgo(job.created_at)}</span>
            </div>
          </div>

          {/* Highlights callout */}
          {job.highlights && (
            <div className="bg-[var(--color-brand-orange-soft)] border-l-4 border-[var(--color-brand-orange)] rounded-r-[var(--radius-md)] p-4">
              <p className="text-[13px] font-[700] text-[var(--color-brand-orange)] mb-1">✦ Why you'll love this</p>
              <p className="text-[14px] text-[var(--color-text-primary)] leading-relaxed">{job.highlights}</p>
            </div>
          )}

          {/* Description */}
          <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
            <h2 className="text-[18px] font-[700] text-[var(--color-text-primary)] mb-4">Job Description</h2>
            <div className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">{job.description}</div>
          </div>

          {/* Employer info */}
          <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
            <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)] mb-2">About {job.employer_name}</h2>
            <p className="text-[14px] text-[var(--color-text-secondary)]">
              {job.applicant_count} people have applied to this listing.
              {job.company_size && ` · ${job.company_size} company.`}
            </p>
          </div>
        </div>

        {/* Right: sticky action card */}
        <div className="lg:sticky lg:top-6 bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4">
          {salary && (
            <div>
              <p className="text-[12px] text-[var(--color-text-tertiary)] uppercase tracking-wide mb-1">Salary</p>
              <p className="text-[24px] font-[800] text-[var(--color-brand-cyan)]">{salary}</p>
            </div>
          )}
          <div className="space-y-2 text-[13px] text-[var(--color-text-secondary)]">
            {job.experience_level && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                <span>{job.experience_level}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              <span>{job.job_type.replace('_', '-')}</span>
            </div>
          </div>

          {applied ? (
            <div className="w-full py-3 rounded-full bg-[var(--color-brand-cyan-soft)] text-[var(--color-brand-cyan)] text-[14px] font-[700] text-center">
              ✓ Applied
            </div>
          ) : (
            <Button className="w-full" onClick={() => user ? setConfirm(true) : navigate('/login')}>
              Apply Now
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={toggleSave}
            disabled={saveJob.isPending || unsaveJob.isPending}
          >
            {isSaved
              ? <><BookmarkCheck className="w-4 h-4 text-[var(--color-brand-pink)]" />Saved</>
              : <><Bookmark className="w-4 h-4" />Save Job</>
            }
          </Button>
        </div>
      </div>

      {/* Apply confirmation modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius-xl)] p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-[700] text-[var(--color-text-primary)]">Confirm Application</h2>
              <button type="button" onClick={() => setConfirm(false)} className="p-1 hover:bg-[var(--color-bg-tertiary)] rounded-[var(--radius-md)]">
                <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </button>
            </div>
            <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
              Apply to <strong>{job.title}</strong> at <strong>{job.employer_name}</strong>?
              Your profile will be shared with the employer.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={confirmApply} disabled={applyJob.isPending}>
                {applyJob.isPending ? 'Applying…' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
