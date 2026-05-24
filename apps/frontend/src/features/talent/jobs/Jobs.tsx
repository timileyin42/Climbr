import { useState } from 'react'
import { Search, Briefcase, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { JobCard } from '@/components/cards/JobCard'
import { JobCardSkeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useJobs } from '@/lib/api/queries/useJobs'
import { useSavedJobs, useSaveJob, useUnsaveJob } from '@/lib/api/queries/useTalent'
import { useAuthStore } from '@/lib/auth/store'

const jobTypeOptions = [
  { value: '', label: 'All types' },
  { value: 'full_time',   label: 'Full-time' },
  { value: 'part_time',   label: 'Part-time' },
  { value: 'contract',    label: 'Contract' },
  { value: 'internship',  label: 'Internship' },
  { value: 'remote',      label: 'Remote' },
]

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
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Job Listings</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">Discover opportunities matched to your profile.</p>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <Input
              placeholder="Search jobs, companies, keywords…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
          <Button onClick={applyFilters}>Search</Button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="px-3 py-2 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] text-[13px] text-[var(--color-text-primary)] bg-white outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
          >
            {jobTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <Input
            placeholder="Location"
            className="w-40"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          />

          {hasFilters && (
            <button type="button" onClick={clearFilters} className="flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
              <X className="w-3.5 h-3.5" />Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }, (_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : jobs.length ? (
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
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="Try adjusting your search or filters."
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button variant="outline" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Previous</Button>
          <span className="text-[14px] text-[var(--color-text-secondary)]">Page {page} of {pagination.pages}</span>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.pages}>Next</Button>
        </div>
      )}
    </div>
  )
}
