import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useCreateJob, useEmployerCredits } from '@/lib/api/queries/useEmployer'
import type { JobCreate } from '@/lib/api/endpoints/employer'

// ── Schemas ──────────────────────────────────────────────────────────────────

const basicsSchema = z.object({
  title:    z.string().min(3, 'Required'),
  industry: z.string().min(1, 'Required'),
  location: z.string().min(2, 'Required'),
  job_type: z.enum(['full_time', 'part_time', 'contract', 'internship', 'remote']),
})
const detailsSchema = z.object({
  description:      z.string().min(50, 'At least 50 characters'),
  experience_level: z.string().optional(),
  company_size:     z.string().optional(),
  salary_min:       z.coerce.number().optional(),
  salary_max:       z.coerce.number().optional(),
  highlights:       z.string().optional(),
})
type BasicsForm  = z.infer<typeof basicsSchema>
type DetailsForm = z.infer<typeof detailsSchema>

const JOB_TYPES = ['full_time', 'part_time', 'contract', 'internship', 'remote'] as const
const EXP_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive']
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className={cn('h-1.5 rounded-full transition-all',
          s === current ? 'w-8 bg-[var(--color-brand-orange)]'
          : s < current  ? 'w-4 bg-[var(--color-brand-orange)]/40'
          : 'w-4 bg-[var(--color-border)]')} />
      ))}
    </div>
  )
}

export function Component() {
  const navigate  = useNavigate()
  const [step, setStep]     = useState(1)
  const [basics, setBasics] = useState<BasicsForm | null>(null)

  const { data: creditsData } = useEmployerCredits()
  const credits   = creditsData?.job_credits ?? 0
  const freePosts = creditsData?.free_posts_remaining ?? 2
  const canPost   = credits > 0 || freePosts > 0
  const create    = useCreateJob()

  const form1 = useForm<BasicsForm>({ resolver: zodResolver(basicsSchema), defaultValues: { job_type: 'full_time' } })
  const form2 = useForm<DetailsForm>({ resolver: zodResolver(detailsSchema) })

  function goToStep2(v: BasicsForm) {
    setBasics(v)
    setStep(2)
  }

  function goToStep3() {
    form2.handleSubmit(() => setStep(3))()
  }

  function handlePost() {
    const details = form2.getValues()
    if (!basics) return
    const payload: JobCreate = {
      ...basics,
      ...details,
      salary_min:   details.salary_min   || undefined,
      salary_max:   details.salary_max   || undefined,
      company_size: details.company_size || undefined,
      experience_level: details.experience_level || undefined,
      highlights:   details.highlights   || undefined,
    }
    create.mutate(payload, { onSuccess: () => navigate('/employer/jobs') })
  }

  if (!canPost) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-[var(--color-brand-orange-soft)] flex items-center justify-center mx-auto mb-5">
          <span className="text-[28px]">💳</span>
        </div>
        <h1 className="text-[24px] font-[700] text-[var(--color-brand-navy)] mb-3">You need credits to post</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
          Each job post uses one credit. Purchase a package to get started.
        </p>
        <Button onClick={() => navigate('/employer/credits')} style={{ background: 'var(--color-brand-orange)' }}>
          Buy Credits
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-[28px] font-[700] text-[var(--color-brand-navy)] mb-2">Post a Job</h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
        {freePosts > 0
          ? `${freePosts} free post${freePosts > 1 ? 's' : ''} remaining this month · no credit used`
          : `${credits} credit${credits > 1 ? 's' : ''} remaining · 1 credit will be used`}
      </p>

      <StepDots current={step} />

      {/* ─── Step 1: Basics ─── */}
      {step === 1 && (
        <form onSubmit={form1.handleSubmit(goToStep2)} className="space-y-5">
          <h2 className="text-[20px] font-[700] text-[var(--color-text-primary)]">Job basics</h2>

          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Job title</label>
            <Input placeholder="e.g. Frontend Engineer" {...form1.register('title')} />
            {form1.formState.errors.title && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{form1.formState.errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Industry</label>
              <Input placeholder="e.g. Technology" {...form1.register('industry')} />
              {form1.formState.errors.industry && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{form1.formState.errors.industry.message}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Location</label>
              <Input placeholder="e.g. Lagos" {...form1.register('location')} />
              {form1.formState.errors.location && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{form1.formState.errors.location.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-2">Job type</label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((t) => (
                <label key={t} className="cursor-pointer">
                  <input type="radio" value={t} {...form1.register('job_type')} className="sr-only" />
                  <span className={cn(
                    'px-4 py-2 rounded-full border-2 text-[13px] font-[600] transition-all capitalize block',
                    form1.watch('job_type') === t
                      ? 'border-[var(--color-brand-orange)] bg-[var(--color-brand-orange-soft)] text-[var(--color-brand-orange)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-orange)]/40'
                  )}>
                    {t.replace('_', '-')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" style={{ background: 'var(--color-brand-orange)' }}>Continue</Button>
        </form>
      )}

      {/* ─── Step 2: Details ─── */}
      {step === 2 && (
        <div className="space-y-5">
          <button type="button" onClick={() => setStep(1)} className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1">← Back</button>
          <h2 className="text-[20px] font-[700] text-[var(--color-text-primary)]">Job details</h2>

          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Description</label>
            <textarea rows={6} placeholder="Describe the role, responsibilities, and requirements…" {...form2.register('description')}
              className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] text-[14px] bg-white resize-none outline-none focus:border-[var(--color-brand-orange)] transition-colors text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]" />
            {form2.formState.errors.description && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{form2.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Experience level</label>
              <select {...form2.register('experience_level')} className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] text-[14px] text-[var(--color-text-primary)] bg-white outline-none focus:border-[var(--color-brand-orange)] transition-colors">
                <option value="">Any</option>
                {EXP_LEVELS.map((e) => <option key={e} value={e} className="capitalize">{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Company size</label>
              <select {...form2.register('company_size')} className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] text-[14px] text-[var(--color-text-primary)] bg-white outline-none focus:border-[var(--color-brand-orange)] transition-colors">
                <option value="">Optional</option>
                {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Min salary (₦)</label>
              <Input type="number" placeholder="e.g. 150000" {...form2.register('salary_min')} />
            </div>
            <div>
              <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Max salary (₦)</label>
              <Input type="number" placeholder="e.g. 350000" {...form2.register('salary_max')} />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Highlights <span className="text-[var(--color-text-tertiary)] font-[400]">(optional — shown as a callout to candidates)</span></label>
            <Input placeholder="e.g. Remote-first, equity offered, great culture" {...form2.register('highlights')} />
          </div>

          <Button className="w-full" style={{ background: 'var(--color-brand-orange)' }} onClick={goToStep3}>Preview</Button>
        </div>
      )}

      {/* ─── Step 3: Preview + post ─── */}
      {step === 3 && basics && (
        <div className="space-y-5">
          <button type="button" onClick={() => setStep(2)} className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1">← Back</button>
          <h2 className="text-[20px] font-[700] text-[var(--color-text-primary)]">Preview</h2>

          <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4">
            <h3 className="text-[22px] font-[700] text-[var(--color-text-primary)]">{basics.title}</h3>
            <div className="flex flex-wrap gap-2 text-[13px] text-[var(--color-text-secondary)]">
              <span>{basics.location}</span>
              <span>·</span>
              <span className="capitalize">{basics.job_type.replace('_', '-')}</span>
              <span>·</span>
              <span>{basics.industry}</span>
            </div>
            {form2.getValues('highlights') && (
              <div className="bg-[var(--color-brand-orange-soft)] border-l-4 border-[var(--color-brand-orange)] rounded-r-[var(--radius-md)] p-3">
                <p className="text-[13px] text-[var(--color-brand-orange)] font-[700]">✦ Why you'll love this</p>
                <p className="text-[13px] text-[var(--color-text-primary)] mt-0.5">{form2.getValues('highlights')}</p>
              </div>
            )}
            <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
              {form2.getValues('description')}
            </p>
          </div>

          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {freePosts > 0
              ? <>This post uses one of your <strong>{freePosts} free post{freePosts > 1 ? 's' : ''}</strong> this month — no credit deducted.</>
              : <>Posting this job will use <strong>1 credit</strong>. You have {credits} remaining.</>
            }
          </p>

          <Button className="w-full" style={{ background: 'var(--color-brand-orange)' }} onClick={handlePost} disabled={create.isPending}>
            {create.isPending ? 'Posting…' : 'Post Job'}
          </Button>
        </div>
      )}
    </div>
  )
}
