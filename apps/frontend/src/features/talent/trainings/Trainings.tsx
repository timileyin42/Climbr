import { useState } from 'react'
import { Search, GraduationCap, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TrainingCard } from '@/components/cards/TrainingCard'
import { JobCardSkeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useTrainings } from '@/lib/api/queries/useJobs'

const deliveryOptions = [
  { value: '',          label: 'All formats' },
  { value: 'online',    label: 'Online' },
  { value: 'in_person', label: 'In Person' },
  { value: 'hybrid',    label: 'Hybrid' },
]

const LIMIT = 12

export function Component() {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('')
  const [delivery, setDelivery] = useState('')
  const [page,     setPage]     = useState(1)

  const [appliedSearch,   setAppliedSearch]   = useState('')
  const [appliedCategory, setAppliedCategory] = useState('')
  const [appliedDelivery, setAppliedDelivery] = useState('')

  const { data, isLoading } = useTrainings({
    skip:            (page - 1) * LIMIT,
    limit:           LIMIT,
    search:          appliedSearch   || undefined,
    category:        appliedCategory || undefined,
    delivery_method: appliedDelivery || undefined,
  })

  function applyFilters() {
    setAppliedSearch(search)
    setAppliedCategory(category)
    setAppliedDelivery(delivery)
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setCategory('')
    setDelivery('')
    setAppliedSearch('')
    setAppliedCategory('')
    setAppliedDelivery('')
    setPage(1)
  }

  const hasFilters = appliedSearch || appliedCategory || appliedDelivery
  const trainings  = data?.trainings ?? []
  const total      = data?.total ?? 0
  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Trainings</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">Upskill with curated courses and programmes.</p>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <Input
              placeholder="Search trainings, categories, trainers…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
          <Button onClick={applyFilters}>Search</Button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Category"
            className="w-36"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          />
          <select
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            className="px-3 py-2 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] text-[13px] text-[var(--color-text-primary)] bg-white outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
          >
            {deliveryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
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
      ) : trainings.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainings.map((t) => <TrainingCard key={t.id} training={t} />)}
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="No trainings found"
          description="Try adjusting your search or filters."
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button variant="outline" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Previous</Button>
          <span className="text-[14px] text-[var(--color-text-secondary)]">Page {page} of {totalPages}</span>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>Next</Button>
        </div>
      )}
    </div>
  )
}
