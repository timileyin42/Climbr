import { Bookmark, GraduationCap } from 'lucide-react'
import { useState } from 'react'
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

export function Component() {
  const [tab, setTab] = useState<'jobs' | 'trainings'>('jobs')

  const queryClient   = useQueryClient()
  const { data: savedJobs,      isLoading: loadingJobs }      = useSavedJobs()
  const { data: savedTrainings, isLoading: loadingTrainings } = useSavedTrainings()
  const unsave  = useUnsaveJob()
  const resave  = useSaveJob()

  function handleUnsaveJob(savedId: number, jobId: number, jobTitle: string) {
    unsave.mutate(savedId, {
      onSuccess: () => {
        toast.custom(
          (t) => (
            <div className="flex items-center gap-3 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-lg px-4 py-3 min-w-[300px]">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[12px] text-[var(--color-text-tertiary)] mb-0.5">Job Listings › Saved Jobs</p>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Saved Jobs</h1>
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
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Jobs tab */}
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
                onSave={() => handleUnsaveJob(s.id, s.job.id, s.job.title)}
              />
            ))}
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

      {/* Trainings tab */}
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
            action={{ label: 'Browse Trainings', onClick: () => { window.location.href = '/trainings' } }}
          />
        )
      )}
    </div>
  )
}
