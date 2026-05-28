import { Heart, MapPin, Banknote } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Job } from '@/lib/api/endpoints/jobs'
import { cn } from '@/lib/utils'

interface Props {
  job: Job
  saved?: boolean
  onSave?: (id: number) => void
}

const JOB_TYPE_STYLES: Record<string, string> = {
  full_time:      'bg-orange-100 text-orange-600',
  part_time:      'bg-yellow-100 text-yellow-700',
  contract:       'bg-purple-100 text-purple-600',
  internship:     'bg-rose-100 text-rose-500',
  remote:         'bg-cyan-100 text-cyan-700',
  apprenticeship: 'bg-green-100 text-green-700',
  volunteering:   'bg-teal-100 text-teal-700',
  freelance:      'bg-indigo-100 text-indigo-600',
}

const LOGO_PALETTES = [
  { bg: 'bg-cyan-100',   text: 'text-cyan-700'   },
  { bg: 'bg-orange-100', text: 'text-orange-700'  },
  { bg: 'bg-purple-100', text: 'text-purple-700'  },
  { bg: 'bg-rose-100',   text: 'text-rose-600'    },
  { bg: 'bg-green-100',  text: 'text-green-700'   },
  { bg: 'bg-indigo-100', text: 'text-indigo-700'  },
  { bg: 'bg-yellow-100', text: 'text-yellow-700'  },
  { bg: 'bg-teal-100',   text: 'text-teal-700'    },
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
  if (min && max) return `${fmt(min)} – ${fmt(max)}/yr`
  if (min) return `From ${fmt(min)}/yr`
  return `Up to ${fmt(max!)}/yr`
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return '1 day ago'
  if (d < 7)  return `${d} days ago`
  if (d < 14) return '1 week ago'
  if (d < 30) return `${Math.floor(d / 7)} weeks ago`
  return `${Math.floor(d / 30)}mo ago`
}

export function JobCard({ job, saved = false, onSave }: Props) {
  const salary    = formatSalary(job.salary_min, job.salary_max)
  const typeStyle = JOB_TYPE_STYLES[job.job_type] ?? 'bg-orange-100 text-orange-600'
  const logo      = logoStyle(job.employer_name)

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E4EBF0] hover:border-[#CBD5E1] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200">

      {/* ── Banner image area ──────────────────────────────────────────── */}
      <Link to={`/jobs/${job.id}`} className="block shrink-0">
        <div className="h-[160px] bg-gradient-to-br from-[#E6F7FB] via-[#D8F1F8] to-[#C8EBEF] relative overflow-hidden">
          {job.image_url
            ? <img src={job.image_url} alt="" className="w-full h-full object-cover" />
            : <div className="absolute inset-0 flex items-end justify-end p-4 opacity-[0.07]">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-brand-cyan)]">
                  <path d="M20 7H4C2.9 7 2 7.9 2 9v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 13H4V9h16v11zm-9-3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V14h2v-1.5C16 11.57 14.93 11 13.5 11S11 11.57 11 12.5V17h2v-3.5zm-4 0c0 .83.67 1.5 1.5 1.5S10 17.33 10 16.5V14h2v-1.5C12 11.57 10.93 11 9.5 11S7 11.57 7 12.5V17h2v-3.5zM12 1L8 5h3v4h2V5h3L12 1z"/>
                </svg>
              </div>
          }
        </div>
      </Link>

      {/* ── Card body ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4 flex-1">

        {/* Type badge + time + heart */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn('shrink-0 px-3 py-1 rounded-full text-[11px] font-[700] capitalize', typeStyle)}>
              {job.job_type.replace('_', '-')}
            </span>
            <span className="text-[12px] text-[var(--color-text-tertiary)] truncate">{timeAgo(job.created_at)}</span>
          </div>
          {onSave && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(job.id) }}
              className="shrink-0 p-1 -m-1 rounded-full hover:bg-rose-50 transition-colors"
              aria-label={saved ? 'Unsave job' : 'Save job'}
            >
              <Heart className={cn('w-4 h-4 transition-all', saved ? 'fill-rose-500 text-rose-500' : 'text-[var(--color-text-tertiary)] group-hover:text-rose-400')} />
            </button>
          )}
        </div>

        {/* Title + company logo */}
        <div className="flex items-start gap-2">
          <Link to={`/jobs/${job.id}`} className="flex-1 min-w-0">
            <h3 className="text-[15px] font-[700] text-[var(--color-text-primary)] line-clamp-1 leading-snug">
              {job.title}
            </h3>
            <p className="text-[13px] text-[var(--color-brand-cyan)] font-[500] mt-0.5 line-clamp-1">
              {job.employer_name}
            </p>
          </Link>
          <div className={cn('shrink-0 w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-[800]', logo.bg, logo.text)}>
            {job.employer_name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Description */}
        {job.description && (
          <p className="text-[12px] text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed -mt-1">
            {job.description}
          </p>
        )}

        {/* Location + Salary */}
        <div className="flex items-end gap-3 mt-auto pt-1 border-t border-[#F0F4F8]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <MapPin className="w-3 h-3 text-[var(--color-text-tertiary)]" />
              <span className="text-[10px] font-[600] text-[var(--color-text-tertiary)] uppercase tracking-wide">Location</span>
            </div>
            <p className="text-[12px] font-[600] text-[var(--color-text-primary)] truncate">{job.location}</p>
          </div>
          {salary && (
            <div className="shrink-0 text-right">
              <div className="flex items-center gap-1 mb-0.5 justify-end">
                <Banknote className="w-3 h-3 text-[var(--color-text-tertiary)]" />
                <span className="text-[10px] font-[600] text-[var(--color-text-tertiary)] uppercase tracking-wide">Salary</span>
              </div>
              <p className="text-[12px] font-[600] text-[var(--color-text-primary)]">{salary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
