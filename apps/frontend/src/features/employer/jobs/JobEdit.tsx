import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Users, MapPin, Calendar, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useEmployerJob, useUpdateJob } from '@/lib/api/queries/useEmployer'
import { cn } from '@/lib/utils'

const schema = z.object({
  title:            z.string().min(3, 'Required'),
  industry:         z.string().min(1, 'Required'),
  location:         z.string().min(2, 'Required'),
  job_type:         z.enum(['full_time', 'part_time', 'contract', 'internship', 'remote']),
  description:      z.string().min(50, 'At least 50 characters'),
  experience_level: z.string().optional(),
  company_size:     z.string().optional(),
  salary_min:       z.coerce.number().optional(),
  salary_max:       z.coerce.number().optional(),
  highlights:       z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const JOB_TYPES  = ['full_time', 'part_time', 'contract', 'internship', 'remote'] as const
const EXP_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive']
const CO_SIZES   = ['1-10', '11-50', '51-200', '201-500', '500+']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function Component() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [saved,  setSaved]  = useState(false)

  const { data: job, isLoading, isError } = useEmployerJob(Number(id))
  const update = useUpdateJob()

  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!job) return
    form.reset({
      title:            job.title,
      industry:         job.industry ?? '',
      location:         job.location,
      job_type:         job.job_type as FormValues['job_type'],
      description:      job.description ?? '',
      experience_level: job.experience_level ?? '',
      company_size:     job.company_size ?? '',
      salary_min:       job.salary_min ?? undefined,
      salary_max:       job.salary_max ?? undefined,
      highlights:       job.highlights ?? '',
    })
  }, [job])

  function onSubmit(values: FormValues) {
    update.mutate({ id: Number(id), data: values }, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) },
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (isError || !job) {
    return (
      <div className="text-center py-20">
        <p className="text-[16px] font-[600] text-[var(--color-text-primary)] mb-4">Job not found</p>
        <Button onClick={() => navigate('/employer/jobs')}>Back to Jobs</Button>
      </div>
    )
  }

  const status     = (job as unknown as { status?: string }).status ?? 'active'
  const expiryDate = (job as unknown as { expiry_date?: string }).expiry_date

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
        <Link to="/employer/jobs" className="flex items-center gap-1 hover:text-[var(--color-text-primary)] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> My Jobs
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-primary)] font-[500] line-clamp-1">{job.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-[700] text-[var(--color-text-primary)]">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-[13px] text-[var(--color-text-tertiary)]">
            <span className={cn(
              'px-2.5 py-0.5 rounded-full text-[11px] font-[700] capitalize',
              status === 'active' ? 'bg-green-100 text-green-700' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]'
            )}>{status}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{job.applicant_count} applicants</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
            {expiryDate && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Expires {formatDate(expiryDate)}</span>}
          </div>
        </div>
        <Link to={`/employer/jobs/${id}/applicants`}>
          <Button size="sm" style={{ background: 'var(--color-brand-orange)' }}>
            <Users className="w-3.5 h-3.5 mr-1.5" />
            View Applicants
          </Button>
        </Link>
      </div>

      {/* Edit form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 bg-white border border-[#E4EBF0] rounded-2xl p-6">
        <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)]">Edit Job Details</h2>

        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Job title</label>
          <Input {...form.register('title')} />
          {form.formState.errors.title && <p className="text-[12px] text-rose-500 mt-1">{form.formState.errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Industry</label>
            <Input {...form.register('industry')} />
          </div>
          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Location</label>
            <Input {...form.register('location')} />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-2">Job type</label>
          <div className="flex flex-wrap gap-2">
            {JOB_TYPES.map((t) => (
              <label key={t} className="cursor-pointer">
                <input type="radio" value={t} {...form.register('job_type')} className="sr-only" />
                <span className={cn(
                  'px-3 py-1.5 rounded-full border-2 text-[12px] font-[600] transition-all capitalize block',
                  form.watch('job_type') === t
                    ? 'border-[var(--color-brand-orange)] bg-orange-50 text-[var(--color-brand-orange)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                )}>
                  {t.replace('_', '-')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Description</label>
          <textarea rows={7} {...form.register('description')}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] text-[14px] bg-white resize-none outline-none focus:border-[var(--color-brand-orange)] transition-colors text-[var(--color-text-primary)]" />
          {form.formState.errors.description && <p className="text-[12px] text-rose-500 mt-1">{form.formState.errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Experience level</label>
            <select {...form.register('experience_level')}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] text-[14px] bg-white outline-none focus:border-[var(--color-brand-orange)] transition-colors capitalize">
              <option value="">Any</option>
              {EXP_LEVELS.map((e) => <option key={e} value={e} className="capitalize">{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Company size</label>
            <select {...form.register('company_size')}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] text-[14px] bg-white outline-none focus:border-[var(--color-brand-orange)] transition-colors">
              <option value="">Optional</option>
              {CO_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Min salary (₦)</label>
            <Input type="number" placeholder="e.g. 150000" {...form.register('salary_min')} />
          </div>
          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Max salary (₦)</label>
            <Input type="number" placeholder="e.g. 350000" {...form.register('salary_max')} />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">
            Highlights <span className="font-[400] text-[var(--color-text-tertiary)]">(optional)</span>
          </label>
          <Input placeholder="e.g. Remote-first, equity offered" {...form.register('highlights')} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className="flex items-center gap-2 text-[13px] text-[var(--color-text-tertiary)] hover:text-rose-500 transition-colors"
            onClick={() => {
              if (confirm('Archive this job? It will no longer appear in listings.')) {
                navigate('/employer/jobs')
              }
            }}
          >
            <Archive className="w-4 h-4" /> Archive job
          </button>

          <Button type="submit" disabled={update.isPending} style={{ background: 'var(--color-brand-orange)' }}>
            {update.isPending ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
