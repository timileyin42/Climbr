import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useCreateTraining, useTrainerCredits } from '@/lib/api/queries/useTrainer'
import type { TrainingCreate } from '@/lib/api/endpoints/trainer'

// ── Schemas ───────────────────────────────────────────────────────────────────

const basicsSchema = z.object({
  title:           z.string().min(3, 'Required'),
  category:        z.string().min(1, 'Required'),
  delivery_method: z.enum(['online', 'in_person', 'hybrid']),
  cost:            z.coerce.number().min(0, 'Required'),
  start_date:      z.string().min(1, 'Required'),
})
const detailsSchema = z.object({
  description: z.string().min(50, 'At least 50 characters'),
  location:    z.string().optional(),
  end_date:    z.string().optional(),
  duration:    z.string().optional(),
  level:       z.string().optional(),
  open_slots:  z.coerce.number().optional(),
  curriculum:  z.string().optional(),
  highlights:  z.string().optional(),
})
type BasicsForm  = z.infer<typeof basicsSchema>
type DetailsForm = z.infer<typeof detailsSchema>

const DELIVERY_METHODS = ['online', 'in_person', 'hybrid'] as const
const LEVELS = ['beginner', 'intermediate', 'advanced', 'all levels']

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className={cn('h-1.5 rounded-full transition-all',
          s === current ? 'w-8'
          : s < current  ? 'w-4 opacity-40'
          : 'w-4 bg-[var(--color-border)]')}
          style={s <= current ? { background: 'var(--color-brand-yellow)' } : undefined}
        />
      ))}
    </div>
  )
}

export function Component() {
  const navigate  = useNavigate()
  const [step, setStep]     = useState(1)
  const [basics, setBasics] = useState<BasicsForm | null>(null)

  const { data: creditsData } = useTrainerCredits()
  const credits = creditsData?.training_credits ?? 0
  const create  = useCreateTraining()

  const form1 = useForm<BasicsForm>({ resolver: zodResolver(basicsSchema), defaultValues: { delivery_method: 'online', cost: 0 } })
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
    const payload: TrainingCreate = {
      ...basics,
      ...details,
      location:   details.location   || undefined,
      end_date:   details.end_date   || undefined,
      duration:   details.duration   || undefined,
      level:      details.level      || undefined,
      open_slots: details.open_slots || undefined,
      curriculum: details.curriculum || undefined,
      highlights: details.highlights || undefined,
    }
    create.mutate(payload, { onSuccess: () => navigate('/trainer/trainings') })
  }

  if (credits === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#FFF8E0' }}>
          <span className="text-[28px]">💳</span>
        </div>
        <h1 className="text-[24px] font-[700] text-[var(--color-brand-navy)] mb-3">You need credits to post</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
          Each training post uses one credit. Purchase a package to get started.
        </p>
        <Button onClick={() => navigate('/trainer/credits')} style={{ background: 'var(--color-brand-yellow)', color: 'var(--color-brand-navy)' }}>
          Buy Credits
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-[28px] font-[700] text-[var(--color-brand-navy)] mb-2">Post a Training</h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
        {credits} credit{credits > 1 ? 's' : ''} remaining · 1 credit will be used.
      </p>

      <StepDots current={step} />

      {/* ─── Step 1: Basics ─── */}
      {step === 1 && (
        <form onSubmit={form1.handleSubmit(goToStep2)} className="space-y-5">
          <h2 className="text-[20px] font-[700] text-[var(--color-text-primary)]">Training basics</h2>

          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Title</label>
            <Input placeholder="e.g. Advanced React Development" {...form1.register('title')} />
            {form1.formState.errors.title && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{form1.formState.errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Category</label>
              <Input placeholder="e.g. Technology" {...form1.register('category')} />
              {form1.formState.errors.category && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{form1.formState.errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Cost (₦)</label>
              <Input type="number" min="0" placeholder="0 for free" {...form1.register('cost')} />
              {form1.formState.errors.cost && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{form1.formState.errors.cost.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Start date</label>
            <Input type="date" {...form1.register('start_date')} />
            {form1.formState.errors.start_date && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{form1.formState.errors.start_date.message}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-2">Delivery method</label>
            <div className="flex flex-wrap gap-2">
              {DELIVERY_METHODS.map((m) => (
                <label key={m} className="cursor-pointer">
                  <input type="radio" value={m} {...form1.register('delivery_method')} className="sr-only" />
                  <span className={cn(
                    'px-4 py-2 rounded-full border-2 text-[13px] font-[600] transition-all capitalize block',
                    form1.watch('delivery_method') === m
                      ? 'border-[var(--color-brand-yellow)] text-[var(--color-brand-navy)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-yellow)]/40'
                  )}
                  style={form1.watch('delivery_method') === m ? { background: 'var(--color-brand-yellow)' } : undefined}>
                    {m.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" style={{ background: 'var(--color-brand-yellow)', color: 'var(--color-brand-navy)' }}>Continue</Button>
        </form>
      )}

      {/* ─── Step 2: Details ─── */}
      {step === 2 && (
        <div className="space-y-5">
          <button type="button" onClick={() => setStep(1)} className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1">← Back</button>
          <h2 className="text-[20px] font-[700] text-[var(--color-text-primary)]">Training details</h2>

          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Description</label>
            <textarea rows={6} placeholder="Describe what participants will learn, prerequisites, and outcomes…" {...form2.register('description')}
              className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] text-[14px] bg-white resize-none outline-none focus:border-[var(--color-brand-yellow)] transition-colors text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]" />
            {form2.formState.errors.description && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{form2.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Level</label>
              <select {...form2.register('level')} className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] text-[14px] text-[var(--color-text-primary)] bg-white outline-none focus:border-[var(--color-brand-yellow)] transition-colors capitalize">
                <option value="">Any</option>
                {LEVELS.map((l) => <option key={l} value={l} className="capitalize">{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Location</label>
              <Input placeholder="e.g. Lagos (or online)" {...form2.register('location')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">End date</label>
              <Input type="date" {...form2.register('end_date')} />
            </div>
            <div>
              <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Duration</label>
              <Input placeholder="e.g. 6 weeks" {...form2.register('duration')} />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Open slots <span className="text-[var(--color-text-tertiary)] font-[400]">(optional)</span></label>
            <Input type="number" min="1" placeholder="e.g. 30" {...form2.register('open_slots')} />
          </div>

          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Curriculum <span className="text-[var(--color-text-tertiary)] font-[400]">(optional — module outline)</span></label>
            <textarea rows={4} placeholder="Week 1: Foundations&#10;Week 2: Core concepts…" {...form2.register('curriculum')}
              className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] text-[14px] bg-white resize-none outline-none focus:border-[var(--color-brand-yellow)] transition-colors text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]" />
          </div>

          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Highlights <span className="text-[var(--color-text-tertiary)] font-[400]">(optional — shown as a callout)</span></label>
            <Input placeholder="e.g. Certificate issued, hands-on projects, mentorship" {...form2.register('highlights')} />
          </div>

          <Button className="w-full" style={{ background: 'var(--color-brand-yellow)', color: 'var(--color-brand-navy)' }} onClick={goToStep3}>Preview</Button>
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
              <span className="capitalize">{basics.delivery_method.replace('_', ' ')}</span>
              <span>·</span>
              <span>{basics.category}</span>
              <span>·</span>
              <span>{basics.cost === 0 ? 'Free' : `₦${Number(basics.cost).toLocaleString()}`}</span>
              <span>·</span>
              <span>Starts {new Date(basics.start_date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {form2.getValues('highlights') && (
              <div className="border-l-4 rounded-r-[var(--radius-md)] p-3" style={{ background: '#FFF8E0', borderColor: 'var(--color-brand-yellow)' }}>
                <p className="text-[13px] font-[700]" style={{ color: 'var(--color-brand-navy)' }}>✦ Why you'll love this</p>
                <p className="text-[13px] text-[var(--color-text-primary)] mt-0.5">{form2.getValues('highlights')}</p>
              </div>
            )}
            <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
              {form2.getValues('description')}
            </p>
          </div>

          <p className="text-[13px] text-[var(--color-text-secondary)]">
            Posting this training will use <strong>1 credit</strong>. You have {credits} remaining.
          </p>

          <Button className="w-full" style={{ background: 'var(--color-brand-yellow)', color: 'var(--color-brand-navy)' }} onClick={handlePost} disabled={create.isPending}>
            {create.isPending ? 'Posting…' : 'Post Training'}
          </Button>
        </div>
      )}
    </div>
  )
}
