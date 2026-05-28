import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Bell, Bookmark, LayoutGrid, List, X } from 'lucide-react'
import { JobCard } from '@/components/cards/JobCard'
import { JobCardSkeleton } from '@/components/feedback/Skeleton'
import { useJobs } from '@/lib/api/queries/useJobs'
import { useSavedJobs, useSaveJob, useUnsaveJob } from '@/lib/api/queries/useTalent'
import { useAuthStore } from '@/lib/auth/store'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'list'

const JOB_TYPES = [
  { value: '',            label: 'All types'  },
  { value: 'full_time',   label: 'Full-time'  },
  { value: 'part_time',   label: 'Part-time'  },
  { value: 'contract',    label: 'Contract'   },
  { value: 'internship',  label: 'Internship' },
  { value: 'remote',      label: 'Remote'     },
]

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center mb-5">
        <Search className="w-7 h-7 text-[var(--color-text-tertiary)]" />
      </div>
      <p className="text-[15px] font-[600] text-[var(--color-text-primary)] mb-1">
        {query ? `No results for "${query}"` : 'No jobs found'}
      </p>
      <p className="text-[13px] text-[var(--color-text-secondary)] mb-5 text-center max-w-xs">
        {query ? "We'll let you know when a matching job is posted." : 'Try adjusting your filters or check back later.'}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="text-[13px] font-[600] text-[var(--color-brand-cyan)] hover:underline"
      >
        Clear filters
      </button>
    </div>
  )
}

export function Component() {
  const user = useAuthStore((s) => s.user)

  const [search,   setSearch]   = useState('')
  const [jobType,  setJobType]  = useState('')
  const [view,     setView]     = useState<ViewMode>('grid')
  const [page,     setPage]     = useState(1)
  const [showFilter, setShowFilter] = useState(false)

  const [appliedSearch,  setAppliedSearch]  = useState('')
  const [appliedType,    setAppliedType]    = useState('')

  const { data, isLoading } = useJobs({
    page, limit: 12,
    search:   appliedSearch || undefined,
    job_type: appliedType   || undefined,
  })

  const { data: savedData } = useSavedJobs()
  const saveJob   = useSaveJob()
  const unsaveJob = useUnsaveJob()

  const savedIds = new Set(savedData?.map((s) => s.job.id) ?? [])

  function applyFilters() {
    setAppliedSearch(search)
    setAppliedType(jobType)
    setPage(1)
  }

  function clearFilters() {
    setSearch(''); setJobType('')
    setAppliedSearch(''); setAppliedType('')
    setPage(1)
  }

  function handleSave(jobId: number) {
    const saved = savedData?.find((s) => s.job.id === jobId)
    if (saved) unsaveJob.mutate(saved.id)
    else saveJob.mutate(jobId)
  }

  const jobs       = data?.jobs ?? []
  const pagination = data?.pagination
  const hasFilters = appliedSearch || appliedType

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Job Listings</h1>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/saved"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-text-primary)] text-white text-[13px] font-[600] hover:opacity-80 transition-opacity"
          >
            <Bookmark className="w-3.5 h-3.5" />
            View Saved Jobs
          </Link>
          <button
            type="button"
            className="relative w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <Bell className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </button>
        </div>
      </div>

      {/* ── Search + view toggle bar ─────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search by industry, location, type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full h-10 pl-10 pr-16 rounded-full border border-[var(--color-border)] text-[13px] text-[var(--color-text-primary)] bg-white placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[10px] text-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)]">
            ⌘K
          </kbd>
        </div>

        {/* View toggles */}
        <div className="flex items-center border border-[var(--color-border)] rounded-full overflow-hidden shrink-0">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={cn('w-9 h-9 flex items-center justify-center transition-colors',
              view === 'grid' ? 'bg-[var(--color-text-primary)] text-white' : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={cn('w-9 h-9 flex items-center justify-center transition-colors',
              view === 'list' ? 'bg-[var(--color-text-primary)] text-white' : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Filter button */}
        <button
          type="button"
          onClick={() => setShowFilter((p) => !p)}
          className={cn(
            'flex items-center gap-1.5 h-10 px-4 rounded-full border text-[13px] font-[600] transition-colors shrink-0',
            hasFilters
              ? 'border-[var(--color-brand-cyan)] text-[var(--color-brand-cyan)] bg-[var(--color-brand-cyan-soft)]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
          {hasFilters && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); clearFilters() }}
              onKeyDown={(e) => e.key === 'Enter' && clearFilters()}
              className="ml-0.5"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </button>
      </div>

      {/* ── Filter panel ─────────────────────────────────────────────────── */}
      {showFilter && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)]">
          <div className="flex flex-wrap gap-1.5">
            {JOB_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => { setJobType(t.value); setAppliedType(t.value); setPage(1) }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[12px] font-[600] transition-all border',
                  appliedType === t.value
                    ? 'bg-[var(--color-brand-navy)] text-white border-[var(--color-brand-navy)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)] bg-white'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Opportunities section ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)]">
            {appliedSearch
              ? <>Results for <span className="text-[var(--color-brand-cyan)]">"{appliedSearch}"</span></>
              : 'Opportunities You Might Like'
            }
          </h2>
          {pagination && (
            <p className="text-[12px] text-[var(--color-text-tertiary)]">
              {pagination.total} jobs
            </p>
          )}
        </div>

        {isLoading ? (
          <div className={cn(
            'grid gap-4',
            view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            {Array.from({ length: 9 }, (_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : jobs.length ? (
          <div className={cn(
            'grid gap-4',
            view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                saved={savedIds.has(job.id)}
                onSave={user ? handleSave : undefined}
              />
            ))}
          </div>
        ) : (
          <NoResults query={appliedSearch} onClear={clearFilters} />
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-full border border-[var(--color-border)] text-[13px] font-[600] text-[var(--color-text-secondary)] disabled:opacity-40 hover:border-[var(--color-text-primary)] transition-colors"
          >
            ← Prev
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-8 h-8 rounded-full text-[13px] font-[600] transition-colors',
                    page === p
                      ? 'bg-[var(--color-brand-navy)] text-white'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                  )}
                >
                  {p}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pagination.pages}
            className="px-4 py-2 rounded-full border border-[var(--color-border)] text-[13px] font-[600] text-[var(--color-text-secondary)] disabled:opacity-40 hover:border-[var(--color-text-primary)] transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
