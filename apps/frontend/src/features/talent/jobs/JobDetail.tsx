import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  MapPin, Users, Calendar, Heart, ArrowLeft, X,
  Banknote, Briefcase, ChevronRight, Building2,
} from 'lucide-react'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useJob } from '@/lib/api/queries/useJobs'
import { useApplyJob, useSaveJob, useUnsaveJob, useSavedJobs } from '@/lib/api/queries/useTalent'
import { useAuthStore } from '@/lib/auth/store'
import { cn } from '@/lib/utils'

const JOB_TYPE_STYLES: Record<string, string> = {
  full_time:   'bg-orange-100 text-orange-600',
  part_time:   'bg-yellow-100 text-yellow-700',
  contract:    'bg-purple-100 text-purple-600',
  internship:  'bg-rose-100 text-rose-500',
  remote:      'bg-cyan-100 text-cyan-700',
}

const LOGO_PALETTES = [
  { bg: 'bg-cyan-100',   text: 'text-cyan-700'   },
  { bg: 'bg-orange-100', text: 'text-orange-700'  },
  { bg: 'bg-purple-100', text: 'text-purple-700'  },
  { bg: 'bg-rose-100',   text: 'text-rose-600'    },
  { bg: 'bg-green-100',  text: 'text-green-700'   },
  { bg: 'bg-indigo-100', text: 'text-indigo-700'  },
]

function logoStyle(name: string) {
  return LOGO_PALETTES[name.charCodeAt(0) % LOGO_PALETTES.length]
}

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null
  const fmt = (n: number) =>
    n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}M`
    : n >= 1000    ? `₦${(n / 1000).toFixed(0)}k`
    : `₦${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}/mo`
  if (min) return `From ${fmt(min)}/mo`
  return `Up to ${fmt(max!)}/mo`
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return '1 day ago'
  if (d < 7)  return `${d} days ago`
  if (d < 30) return `${Math.floor(d / 7)} weeks ago`
  return `${Math.floor(d / 30)}mo ago`
}

export function Component() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)

  const [confirm,     setConfirm]     = useState(false)
  const [applied,     setApplied]     = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

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
    applyJob.mutate({ jobId: Number(id), coverLetter: coverLetter.trim() || undefined }, {
      onSuccess: () => { setApplied(true); setConfirm(false); setCoverLetter('') },
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-5 w-40 rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
          <div><Skeleton className="h-64 rounded-2xl" /></div>
        </div>
      </div>
    )
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[18px] font-[600] text-[var(--color-text-primary)] mb-2">Job not found</p>
        <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">This listing may have been removed or expired.</p>
        <button
          type="button"
          onClick={() => navigate('/jobs')}
          className="px-5 py-2.5 rounded-full bg-[var(--color-brand-navy)] text-white text-[13px] font-[600]"
        >
          Back to Jobs
        </button>
      </div>
    )
  }

  const salary    = formatSalary(job.salary_min, job.salary_max)
  const typeStyle = JOB_TYPE_STYLES[job.job_type] ?? 'bg-orange-100 text-orange-600'
  const logo      = logoStyle(job.employer_name)

  return (
    <div className="max-w-5xl mx-auto">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-tertiary)] mb-6">
        <Link to="/jobs" className="flex items-center gap-1 hover:text-[var(--color-text-primary)] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Jobs
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--color-text-primary)] font-[500] line-clamp-1">{job.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── Left: content ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Banner */}
          <div className="h-[200px] rounded-2xl bg-gradient-to-br from-[#E6F7FB] via-[#D8F1F8] to-[#C8EBEF] overflow-hidden">
            {job.image_url && <img src={job.image_url} alt="" className="w-full h-full object-cover" />}
          </div>

          {/* Company + title block */}
          <div className="bg-white border border-[#E4EBF0] rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-[20px] font-[800] shrink-0', logo.bg, logo.text)}>
                {job.employer_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-[24px] font-[700] text-[var(--color-text-primary)] leading-tight mb-0.5">{job.title}</h1>
                <p className="text-[15px] text-[var(--color-brand-cyan)] font-[500]">{job.employer_name}</p>
              </div>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className={cn('px-3 py-1 rounded-full text-[12px] font-[700] capitalize', typeStyle)}>
                {job.job_type.replace('_', '-')}
              </span>
              {job.experience_level && (
                <span className="px-3 py-1 rounded-full text-[12px] font-[700] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] capitalize">
                  {job.experience_level}
                </span>
              )}
              {job.industry && (
                <span className="px-3 py-1 rounded-full text-[12px] font-[700] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
                  {job.industry}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-5 text-[13px] text-[var(--color-text-tertiary)]">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{job.applicant_count} applicants</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Posted {timeAgo(job.created_at)}</span>
              {salary && <span className="flex items-center gap-1.5 text-[var(--color-brand-cyan)] font-[600]"><Banknote className="w-3.5 h-3.5" />{salary}</span>}
            </div>
          </div>

          {/* Highlights */}
          {job.highlights && (
            <div className="bg-orange-50 border-l-4 border-orange-400 rounded-r-2xl p-4">
              <p className="text-[13px] font-[700] text-orange-600 mb-1">✦ Why you'll love this role</p>
              <p className="text-[14px] text-[var(--color-text-primary)] leading-relaxed">{job.highlights}</p>
            </div>
          )}

          {/* Description */}
          <div className="bg-white border border-[#E4EBF0] rounded-2xl p-6">
            <h2 className="text-[17px] font-[700] text-[var(--color-text-primary)] mb-4">Job Description</h2>
            <div className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">{job.description}</div>
          </div>

          {/* About company */}
          <div className="bg-white border border-[#E4EBF0] rounded-2xl p-6">
            <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              About {job.employer_name}
            </h2>
            <p className="text-[14px] text-[var(--color-text-secondary)]">
              {job.applicant_count} people have applied to this listing.
              {job.company_size && ` · ${job.company_size} employees.`}
            </p>
          </div>
        </div>

        {/* ── Right: sticky action card ──────────────────────────────────── */}
        <div className="lg:sticky lg:top-6 space-y-3">
          <div className="bg-white border border-[#E4EBF0] rounded-2xl p-6 space-y-4">
            {salary && (
              <div>
                <p className="text-[11px] font-[700] text-[var(--color-text-tertiary)] uppercase tracking-widest mb-1">Salary</p>
                <p className="text-[26px] font-[800] text-[var(--color-brand-cyan)]">{salary}</p>
              </div>
            )}

            <div className="space-y-2.5">
              {[
                { icon: Briefcase, label: job.job_type.replace('_', '-') },
                ...(job.experience_level ? [{ icon: Users, label: job.experience_level }] : []),
                { icon: MapPin, label: job.location },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-[13px] text-[var(--color-text-secondary)]">
                  <Icon className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
                  <span className="capitalize">{label}</span>
                </div>
              ))}
            </div>

            {/* Apply / Applied */}
            {applied ? (
              <div className="w-full py-3 rounded-full bg-cyan-50 text-[var(--color-brand-cyan)] text-[14px] font-[700] text-center">
                ✓ Application submitted
              </div>
            ) : (
              <button
                type="button"
                onClick={() => user ? setConfirm(true) : navigate('/login')}
                className="w-full py-3 rounded-full bg-[var(--color-brand-navy)] text-white text-[14px] font-[700] hover:opacity-90 transition-opacity"
              >
                Apply Now
              </button>
            )}

            {/* Save */}
            <button
              type="button"
              onClick={toggleSave}
              disabled={saveJob.isPending || unsaveJob.isPending}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-full border text-[14px] font-[600] transition-all',
                isSaved
                  ? 'border-rose-200 text-rose-500 bg-rose-50'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)]'
              )}
            >
              <Heart className={cn('w-4 h-4', isSaved && 'fill-rose-500')} />
              {isSaved ? 'Saved' : 'Save Job'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Apply modal ─────────────────────────────────────────────────── */}
      {confirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-[700] text-[var(--color-text-primary)]">Apply for {job.title}</h2>
              <button type="button" onClick={() => setConfirm(false)} className="p-1 hover:bg-[var(--color-bg-secondary)] rounded-full transition-colors">
                <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </button>
            </div>

            {/* CV note */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] mb-4">
              <Briefcase className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                Your uploaded CV &amp; profile will be shared with <strong>{job.employer_name}</strong>.
              </p>
            </div>

            {/* Cover letter */}
            <div className="mb-5">
              <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">
                Cover letter <span className="text-[var(--color-text-tertiary)] font-[400]">(optional)</span>
              </label>
              <textarea
                rows={5}
                placeholder="Introduce yourself and why you're a great fit…"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] text-[14px] bg-white resize-none outline-none focus:border-[var(--color-brand-navy)] transition-colors text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className="flex-1 py-3 rounded-full border border-[var(--color-border)] text-[14px] font-[600] text-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmApply}
                disabled={applyJob.isPending}
                className="flex-1 py-3 rounded-full bg-[var(--color-brand-navy)] text-white text-[14px] font-[700] hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {applyJob.isPending ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
