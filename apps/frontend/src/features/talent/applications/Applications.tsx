import { useState, useRef, useEffect } from 'react'
import { FileText, SlidersHorizontal, Search, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useApplications, useRemoveApplication } from '@/lib/api/queries/useTalent'
import { cn } from '@/lib/utils'

// ── Status badge map ──────────────────────────────────────────────────────────

const statusVariant: Record<string, 'pending' | 'in-review' | 'accepted' | 'rejected' | 'chip'> = {
  pending:     'pending',
  in_review:   'in-review',
  shortlisted: 'chip',
  accepted:    'accepted',
  rejected:    'rejected',
}

const STATUS_LABEL: Record<string, string> = {
  pending:     'Pending',
  in_review:   'In Review',
  shortlisted: 'Shortlisted',
  accepted:    'Accepted',
  rejected:    'Rejected',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Filter types ──────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'in_review' | 'accepted' | 'shortlisted' | 'pending' | 'rejected'
type TypeFilter   = 'all' | 'job' | 'training'
type SortKey      = 'date_desc' | 'date_asc' | 'az' | 'za'

interface Filters {
  status:   StatusFilter
  type:     TypeFilter
  dateFrom: string
  dateTo:   string
  sort:     SortKey
}

const DEFAULT_FILTERS: Filters = {
  status: 'all', type: 'all', dateFrom: '', dateTo: '', sort: 'date_desc',
}

// ── Filter panel ──────────────────────────────────────────────────────────────

type FilterMode = 'status' | 'date' | 'type' | 'alpha'
const FILTER_MODES: { key: FilterMode; label: string }[] = [
  { key: 'status', label: 'Status' },
  { key: 'date',   label: 'Date Applied' },
  { key: 'type',   label: 'Type' },
  { key: 'alpha',  label: 'Alphabetical' },
]

function FilterPanel({
  filters,
  onChange,
  onClose,
}: {
  filters: Filters
  onChange: (f: Filters) => void
  onClose: () => void
}) {
  const [mode, setMode] = useState<FilterMode>('status')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 z-20 flex bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-lg overflow-hidden"
      style={{ minWidth: 320 }}
    >
      {/* Mode selector */}
      <div className="flex flex-col border-r border-[var(--color-border)] py-2 min-w-[120px]">
        {FILTER_MODES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-[13px] text-left transition-colors',
              mode === key
                ? 'font-[700] text-[var(--color-text-primary)]'
                : 'font-[500] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            )}
          >
            {mode === key && <span className="w-1 h-1 rounded-full bg-[var(--color-brand-cyan)] shrink-0" />}
            {label}
          </button>
        ))}
      </div>

      {/* Options pane */}
      <div className="flex-1 p-4 min-w-[160px]">
        {mode === 'status' && (
          <div className="space-y-1">
            {(['all', 'in_review', 'shortlisted', 'pending', 'accepted', 'rejected'] as StatusFilter[]).map((s) => (
              <label key={s} className="flex items-center gap-2 text-[13px] text-[var(--color-text-primary)] py-1 cursor-pointer">
                <input
                  type="radio"
                  name="status-filter"
                  checked={filters.status === s}
                  onChange={() => onChange({ ...filters, status: s })}
                  className="accent-[var(--color-brand-cyan)]"
                />
                {s === 'all' ? 'All Statuses' : STATUS_LABEL[s] ?? s}
              </label>
            ))}
          </div>
        )}

        {mode === 'date' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-[600] text-[var(--color-text-secondary)] mb-1">From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                className="w-full px-2 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-brand-cyan)]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-[600] text-[var(--color-text-secondary)] mb-1">To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                className="w-full px-2 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-brand-cyan)]"
              />
            </div>
          </div>
        )}

        {mode === 'type' && (
          <div className="space-y-1">
            {(['all', 'job', 'training'] as TypeFilter[]).map((t) => (
              <label key={t} className="flex items-center gap-2 text-[13px] text-[var(--color-text-primary)] py-1 cursor-pointer">
                <input
                  type="radio"
                  name="type-filter"
                  checked={filters.type === t}
                  onChange={() => onChange({ ...filters, type: t })}
                  className="accent-[var(--color-brand-cyan)]"
                />
                {t === 'all' ? 'All Types' : t === 'job' ? 'Job' : 'Training'}
              </label>
            ))}
          </div>
        )}

        {mode === 'alpha' && (
          <div className="space-y-1">
            {([['date_desc', 'Newest first'], ['date_asc', 'Oldest first'], ['az', 'A → Z'], ['za', 'Z → A']] as [SortKey, string][]).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-[13px] text-[var(--color-text-primary)] py-1 cursor-pointer">
                <input
                  type="radio"
                  name="sort-filter"
                  checked={filters.sort === key}
                  onChange={() => onChange({ ...filters, sort: key })}
                  className="accent-[var(--color-brand-cyan)]"
                />
                {label}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Row action menu ───────────────────────────────────────────────────────────

function RowMenu({ onView, onRemove }: { onView: () => void; onRemove: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-md min-w-[160px] py-1">
          <button
            type="button"
            onClick={() => { onView(); setOpen(false) }}
            className="w-full text-left px-4 py-2 text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => { onRemove(); setOpen(false) }}
            className="w-full text-left px-4 py-2 text-[13px] text-red-500 hover:bg-red-50"
          >
            Remove application
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function Component() {
  const [filters,       setFilters]       = useState<Filters>(DEFAULT_FILTERS)
  const [search,        setSearch]        = useState('')
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [activeTab,     setActiveTab]     = useState<'All' | 'In Review' | 'Accepted' | 'Rejected'>('All')

  const tabToStatus: Record<string, string | undefined> = {
    'All': undefined, 'In Review': 'in_review', 'Accepted': 'accepted', 'Rejected': 'rejected',
  }

  const { data, isLoading } = useApplications({
    status: tabToStatus[activeTab] ?? (filters.status !== 'all' ? filters.status : undefined),
    type:   filters.type !== 'all' ? filters.type : undefined,
  })
  const remove = useRemoveApplication()

  const applications = (data?.applications ?? [])
    .filter((a) => {
      if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.company.toLowerCase().includes(search.toLowerCase())) return false
      if (filters.dateFrom && new Date(a.created_at) < new Date(filters.dateFrom)) return false
      if (filters.dateTo   && new Date(a.created_at) > new Date(filters.dateTo))   return false
      return true
    })
    .sort((a, b) => {
      if (filters.sort === 'az') return a.title.localeCompare(b.title)
      if (filters.sort === 'za') return b.title.localeCompare(a.title)
      if (filters.sort === 'date_asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const stats = data?.stats
  const hasActiveFilters = filters.status !== 'all' || filters.type !== 'all' || filters.dateFrom || filters.dateTo || filters.sort !== 'date_desc'

  function handleRemove(id: number, type: 'job' | 'training') {
    remove.mutate({ id, type })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">My Applications</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">
          Track every job and training you've applied for, all in one place.
        </p>
      </div>

      {/* Stats cards */}
      {!isLoading && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Applications',   value: stats.total_applications, active: activeTab === 'All' },
            { label: 'Applications In Review',value: stats.in_review,         active: activeTab === 'In Review' },
            { label: 'Shortlisted / Accepted',value: stats.accepted,          active: activeTab === 'Accepted' },
            { label: 'Rejected',              value: stats.rejected,           active: activeTab === 'Rejected' },
          ].map(({ label, value, active }) => (
            <div
              key={label}
              className={cn(
                'border-2 rounded-[var(--radius-lg)] p-4 transition-colors',
                active
                  ? 'bg-[var(--color-brand-cyan-soft)] border-[var(--color-brand-cyan)]'
                  : 'bg-white border-[var(--color-border)]',
              )}
            >
              <p className="text-[28px] font-[800] text-[var(--color-text-primary)]">{value}</p>
              <p className="text-[13px] text-[var(--color-text-secondary)]">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs + search + filter */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status tabs */}
        <div className="flex gap-1">
          {(['All', 'In Review', 'Accepted', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-1.5 rounded-full text-[13px] font-[600] transition-all',
                activeTab === tab
                  ? 'bg-[var(--color-brand-cyan)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)]',
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search in list…"
            className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
          />
        </div>

        {/* Filter button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border text-[13px] font-[600] transition-colors',
              hasActiveFilters || filterOpen
                ? 'border-[var(--color-brand-cyan)] text-[var(--color-brand-cyan)] bg-[var(--color-brand-cyan-soft)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {filterOpen && (
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onClose={() => setFilterOpen(false)}
            />
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16 w-full rounded-[var(--radius-lg)]" />)}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description="Start applying to jobs and trainings to see them here."
          action={{ label: 'Browse Jobs', onClick: () => { window.location.href = '/jobs' } }}
        />
      ) : (
        <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-[var(--color-border)]">
            {applications.map((app) => (
              <div key={app.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14px] font-[700] text-[var(--color-text-primary)] truncate">{app.title}</p>
                    <p className="text-[13px] text-[var(--color-text-secondary)] truncate">{app.company}</p>
                  </div>
                  <RowMenu
                    onView={() => {}}
                    onRemove={() => handleRemove(app.id, app.type)}
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="chip">{app.type === 'job' ? 'Job' : 'Training'}</Badge>
                  <Badge variant={statusVariant[app.status] ?? 'chip'}>
                    {STATUS_LABEL[app.status] ?? app.status}
                  </Badge>
                  <span className="text-[12px] text-[var(--color-text-tertiary)] ml-auto">{formatDate(app.created_at)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <table className="w-full hidden md:table">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                {['Type', 'Title', 'Company/Provider', 'Date Applied', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => (
                <tr
                  key={app.id}
                  className={cn(
                    'hover:bg-[var(--color-bg-secondary)] transition-colors',
                    i < applications.length - 1 && 'border-b border-[var(--color-border)]',
                  )}
                >
                  <td className="px-4 py-3">
                    <Badge variant="chip">{app.type === 'job' ? 'Job' : 'Training'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[14px] font-[600] text-[var(--color-text-primary)] max-w-[200px] truncate">
                    {app.title}
                  </td>
                  <td className="px-4 py-3 text-[14px] text-[var(--color-text-secondary)]">{app.company}</td>
                  <td className="px-4 py-3 text-[13px] text-[var(--color-text-tertiary)]">{formatDate(app.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[app.status] ?? 'chip'}>
                      {STATUS_LABEL[app.status] ?? app.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <RowMenu
                      onView={() => {}}
                      onRemove={() => handleRemove(app.id, app.type)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
