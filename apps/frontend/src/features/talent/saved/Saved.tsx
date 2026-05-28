import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, LayoutGrid, List, Bookmark, GraduationCap, ChevronRight, X } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { JobCard } from '@/components/cards/JobCard'
import { TrainingCard } from '@/components/cards/TrainingCard'
import { JobCardSkeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import {
  useSavedJobs,
  useSavedTrainings,
  useUnsaveJob,
  useSaveJob,
} from '@/lib/api/queries/useTalent'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'list'

export function Component() {
  const [tab,    setTab]    = useState<'jobs' | 'trainings'>('jobs')
  const [search, setSearch] = useState('')
  const [view,   setView]   = useState<ViewMode>('grid')

  const queryClient = useQueryClient()
  const { data: savedJobs,      isLoading: loadingJobs }      = useSavedJobs()
  const { data: savedTrainings, isLoading: loadingTrainings } = useSavedTrainings()
  const unsave = useUnsaveJob()
  const resave = useSaveJob()

  function handleUnsaveJob(savedId: number, jobId: number, jobTitle: string) {
    unsave.mutate(savedId, {
      onSuccess: () => {
        toast.custom(
          (t) => (
            <div className="flex items-center gap-3 bg-white border border-[var(--color-border)] rounded-2xl shadow-lg px-4 py-3 min-w-[300px]">
              <div className="flex-1">
                <p className="text-[13px] font-[700] text-[var(--color-text-primary)]">Successful!</p>
                <p className="text-[13px] text-[var(--color-text-secondary)]">
                  We've removed <strong>{jobTitle}</strong> from your saved jobs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resave.mutate(jobId, {
                    onSuccess: () => {
                      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
                      toast.dismiss(t)
                    },
                  })
                }}
                className="text-[var(--color-brand-cyan)] text-[13px] font-[700] hover:underline shrink-0"
              >
                Undo
              </button>
            </div>
          ),
          { duration: 5000 },
        )
      },
    })
  }

  const filteredJobs = search.trim()
    ? (savedJobs ?? []).filter((s) =>
        s.job.title.toLowerCase().includes(search.toLowerCase()) ||
        s.job.employer_name.toLowerCase().includes(search.toLowerCase()) ||
        s.job.location.toLowerCase().includes(search.toLowerCase())
      )
    : (savedJobs ?? [])

  return (
    <div className="space-y-6">

      {/* ── Breadcrumb + header ──────────────────────────────────────────── */}
      <div>
        <nav className="flex items-center gap-1 text-[12px] text-[var(--color-text-tertiary)] mb-2">
          <Link to="/jobs" className="hover:text-[var(--color-text-primary)] transition-colors">Job Listings</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[var(--color-text-primary)] font-[500]">Saved Jobs</span>
        </nav>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Saved Jobs</h1>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {(['jobs', 'trainings'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-3 text-[14px] font-[600] border-b-2 -mb-px transition-all capitalize',
              tab === t
                ? 'border-[var(--color-brand-cyan)] text-[var(--color-brand-cyan)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Search + view controls ───────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search by industry, location, type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

        <button
          type="button"
          className="flex items-center gap-1.5 h-10 px-4 rounded-full border border-[var(--color-border)] text-[13px] font-[600] text-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)] transition-colors shrink-0"
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
        </button>
      </div>

      {/* ── Jobs tab ─────────────────────────────────────────────────────── */}
      {tab === 'jobs' && (
        loadingJobs ? (
          <div className={cn('grid gap-4', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {Array.from({ length: 4 }, (_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : filteredJobs.length ? (
          <div className={cn('grid gap-4', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {filteredJobs.map((s) => (
              <JobCard
                key={s.id}
                job={s.job}
                saved
                onSave={() => handleUnsaveJob(s.id, s.job.id, s.job.title)}
              />
            ))}
          </div>
        ) : search ? (
          <div className="flex flex-col items-center py-16">
            <p className="text-[15px] font-[600] text-[var(--color-text-primary)] mb-1">No results for "{search}"</p>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="flex items-center gap-1 text-[13px] text-[var(--color-brand-cyan)] font-[600] mt-2 hover:underline"
            >
              <X className="w-3 h-3" /> Clear search
            </button>
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="No saved jobs"
            description="Bookmark jobs while browsing and they'll appear here."
            action={{ label: 'Browse Jobs', onClick: () => { window.location.href = '/jobs' } }}
          />
        )
      )}

      {/* ── Trainings tab ────────────────────────────────────────────────── */}
      {tab === 'trainings' && (
        loadingTrainings ? (
          <div className={cn('grid gap-4', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {Array.from({ length: 4 }, (_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : savedTrainings?.length ? (
          <div className={cn('grid gap-4', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {savedTrainings.map((s) => (
              <TrainingCard key={s.id} training={s.training} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="No saved trainings"
            description="Bookmark trainings while browsing and they'll appear here."
            action={{ label: 'Browse Trainings', onClick: () => { window.location.href = '/trainings' } }}
          />
        )
      )}
    </div>
  )
}
