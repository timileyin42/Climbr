import { MapPin, Clock, Bookmark, BookmarkCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Job } from '@/lib/api/endpoints/jobs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Props {
  job: Job
  saved?: boolean
  onSave?: (id: number) => void
  compact?: boolean
}

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null
  const fmt = (n: number) => n >= 1000 ? `₦${(n / 1000).toFixed(0)}k` : `₦${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 7) return `${d}d ago`
  if (d < 30) return `${Math.floor(d / 7)}w ago`
  return `${Math.floor(d / 30)}mo ago`
}

export function JobCard({ job, saved = false, onSave, compact = false }: Props) {
  const salary = formatSalary(job.salary_min, job.salary_max)

  return (
    <div className={cn(
      'group relative bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] transition-all duration-200',
      'hover:border-[var(--color-brand-cyan)] hover:shadow-[0_4px_20px_rgba(12,192,223,0.12)]',
      compact ? 'p-4' : 'p-5'
    )}>
      {/* Save button */}
      {onSave && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onSave(job.id) }}
          className="absolute top-4 right-4 text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-pink)] transition-colors"
        >
          {saved
            ? <BookmarkCheck className="w-4 h-4 text-[var(--color-brand-pink)]" />
            : <Bookmark className="w-4 h-4" />
          }
        </button>
      )}

      <Link to={`/jobs/${job.id}`} className="block">
        {/* Company logo placeholder */}
        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-3 text-[14px] font-[700] text-[var(--color-brand-navy)]">
          {job.employer_name.charAt(0).toUpperCase()}
        </div>

        <h3 className="text-[15px] font-[700] text-[var(--color-text-primary)] mb-0.5 line-clamp-1 pr-6">{job.title}</h3>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-3">{job.employer_name}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="chip">{job.job_type.replace('_', '-')}</Badge>
          {job.experience_level && <Badge variant="chip">{job.experience_level}</Badge>}
          {job.industry && !compact && <Badge variant="chip">{job.industry}</Badge>}
        </div>

        <div className="flex items-center gap-3 text-[12px] text-[var(--color-text-tertiary)]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />{job.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />{timeAgo(job.created_at)}
          </span>
          {salary && <span className="text-[var(--color-brand-cyan)] font-[600]">{salary}</span>}
        </div>
      </Link>
    </div>
  )
}
