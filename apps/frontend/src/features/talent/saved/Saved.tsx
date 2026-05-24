import { Bookmark, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { JobCard } from '@/components/cards/JobCard'
import { TrainingCard } from '@/components/cards/TrainingCard'
import { JobCardSkeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useSavedJobs, useSavedTrainings, useUnsaveJob } from '@/lib/api/queries/useTalent'
import { cn } from '@/lib/utils'

export function Component() {
  const [tab, setTab] = useState<'jobs' | 'trainings'>('jobs')

  const { data: savedJobs,      isLoading: loadingJobs }      = useSavedJobs()
  const { data: savedTrainings, isLoading: loadingTrainings } = useSavedTrainings()
  const unsave = useUnsaveJob()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Saved</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">Opportunities you've bookmarked for later.</p>
      </div>

      {/* Tabs */}
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
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'jobs' && (
        loadingJobs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }, (_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : savedJobs?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedJobs.map((s) => (
              <JobCard
                key={s.id}
                job={s.job}
                saved
                onSave={() => unsave.mutate(s.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="No saved jobs"
            description="Bookmark jobs while browsing and they'll appear here."
            action={{ label: 'Browse Jobs', onClick: () => window.location.href = '/jobs' }}
          />
        )
      )}

      {tab === 'trainings' && (
        loadingTrainings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }, (_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : savedTrainings?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedTrainings.map((s) => (
              <TrainingCard key={s.id} training={s.training} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="No saved trainings"
            description="Bookmark trainings while browsing and they'll appear here."
            action={{ label: 'Browse Trainings', onClick: () => window.location.href = '/trainings' }}
          />
        )
      )}
    </div>
  )
}
