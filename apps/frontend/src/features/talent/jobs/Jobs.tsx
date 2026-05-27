import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Briefcase, X, Bell, Bookmark } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { JobCard } from '@/components/cards/JobCard'
import { JobCardSkeleton } from '@/components/feedback/Skeleton'
import { useJobs } from '@/lib/api/queries/useJobs'
import { useSavedJobs, useSaveJob, useUnsaveJob } from '@/lib/api/queries/useTalent'
import { useAuthStore } from '@/lib/auth/store'
import { cn } from '@/lib/utils'

const jobTypeOptions = [
  { value: '', label: 'All types' },
  { value: 'full_time',  label: 'Full-time' },
  { value: 'part_time',  label: 'Part-time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote',     label: 'Remote' },
]

// ── No-results empty state per Figma ─────────────────────────────────────────

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center mb-5">
        <Briefcase className="w-7 h-7 text-[var(--color-text-tertiary)]" />
      </div>
      <p className="text-[15px] text-[var(--color-text-secondary)] text-center max-w-xs">
        {query
          ? <><strong className="text-[var(--color-text-primary)]">"{query}"</strong> isn't on Climbr yet.
              {' '}We'll let you know when a job is up!</>
          : 'No jobs found. Try adjusting your search or filters.'}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 text-[13px] text-[var(--color-brand-cyan)] hover:underline font-[600]"
      >
        Clear filters
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function Component() {
  const user        = useAuthStore((s) => s.user)
  const [search,   setSearch]   = useState('')
  const [location, setLocation] = useState('')
  const [jobType,  setJobType]  = useState('')
  const [page,     setPage]     = useState(1)

  const [appliedSearch,   setAppliedSearch]   = useState('')
  const [appliedLocation, setAppliedLocation] = useState('')
  const [appliedJobType,  setAppliedJobType]  = useState('')

  const { data, isLoading } = useJobs({
    page, limit: 12,
    search:   appliedSearch   || undefined,
    location: appliedLocation || undefined,
    job_type: appliedJobType  || undefined,
  })

  const { data: savedData }  = useSavedJobs()
  const saveJob   = useSaveJob()
  const unsaveJob = useUnsaveJob()

  const savedIds  = new Set(savedData?.map((s) => s.job.id) ?? [])

  function applyFilters() {
    setAppliedSearch(search)
    setAppliedLocation(location)
    setAppliedJobType(jobType)
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setLocation('')
    setJobType('')
    setAppliedSearch('')
    setAppliedLocation('')
    setAppliedJobType('')
    setPage(1)
  }

  const hasFilters = appliedSearch || appliedLocation || appliedJobType

  function handleSave(jobId: number) {
    const saved = savedData?.find((s) => s.job.id === jobId)
    if (saved) unsaveJob.mutate(saved.id)
    else saveJob.mutate(jobId)
  }

  const jobs       = data?.jobs ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] text-[var(--color-text-tertiary)] mb-0.5">
            Welcome, ☀️ {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Job Listings</h1>
        </div>

        <div className="flex items-center gap-3 shrink-0 mt-1">
          {/* View Saved Jobs — black pill per Figma */}
          <Link
            to="/saved"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-text-primary)] text-white text-[13px] font-[600] hover:opacity-80 transition-opacity"
          >
            <Bookmark className="w-3.5 h-3.5" />
            View Saved Jobs
          </Link>

          {/* Notification bell */}
          <button
            type="button"
            className="relative w-9 h-9 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <Bell className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500" />
          </button>
        </div>
      </div>

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
          <Input
            placeholder="Search by industry, location, type…"
            className="pl-9 pr-24"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[11px] text-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)]">
            ⌘ + K
          </kbd>
        </div>

        <select
          value={jobType}
          onChange={(e) => { setJobType(e.target.value); applyFilters() }}
          className="px-3 py-2 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] text-[13px] text-[var(--color-text-primary)] bg-white outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
        >
          {jobTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <Input
          placeholder="Location"
          className="w-36 hidden md:block"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />

        <Button
          variant="outline"
          onClick={applyFilters}
          className={cn('gap-2', hasFilters && 'border-[var(--color-brand-cyan)] text-[var(--color-brand-cyan)]')}
        >
          Filter
          {hasFilters && (
            <button type="button" onClick={(e) => { e.stopPropagation(); clearFilters() }}>
              <X className="w-3 h-3" />
            </button>
          )}
        </Button>
      </div>

      {/* ── Job grid / states ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }, (_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : jobs.length ? (
        <>
          {appliedSearch && (
            <p className="text-[14px] text-[var(--color-text-secondary)]">
              Results for <strong className="text-[var(--color-text-primary)]">"{appliedSearch}"</strong>
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                saved={savedIds.has(job.id)}
                onSave={user ? handleSave : undefined}
              />
            ))}
          </div>
        </>
      ) : (
        <NoResults query={appliedSearch} onClear={clearFilters} />
      )}

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button variant="outline" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-[14px] text-[var(--color-text-secondary)]">
            Page {page} of {pagination.pages}
          </span>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.pages}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
