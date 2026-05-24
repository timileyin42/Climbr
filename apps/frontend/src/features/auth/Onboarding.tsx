import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RequireAuth } from '@/lib/auth/guards'
import { useAuthStore } from '@/lib/auth/store'
import { api } from '@/lib/api/client'
import { cn } from '@/lib/utils'

// ── Step schemas ─────────────────────────────────────────────────────────────

const step1Schema = z.object({
  headline: z.string().min(3, 'At least 3 characters').max(120, 'Too long'),
  location: z.string().min(2, 'Required'),
})

const step2Schema = z.object({
  skills: z.string().min(1, 'Add at least one skill'),
})

const step3Schema = z.object({
  bio: z.string().min(20, 'At least 20 characters').max(600, 'Max 600 characters'),
})

type Step1 = z.infer<typeof step1Schema>
type Step2 = z.infer<typeof step2Schema>
type Step3 = z.infer<typeof step3Schema>

// ── Experience options ───────────────────────────────────────────────────────

const EXP_OPTIONS = [
  { id: 'student',    label: 'Student',          desc: 'Currently in school or recently graduated' },
  { id: 'entry',      label: 'Entry level',       desc: '0–2 years of experience' },
  { id: 'mid',        label: 'Mid level',         desc: '3–5 years of experience' },
  { id: 'senior',     label: 'Senior level',      desc: '6–10 years of experience' },
  { id: 'lead',       label: 'Lead / Manager',    desc: '10+ years or management role' },
]

const JOB_TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']

// ── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={cn('h-1.5 rounded-full transition-all',
          i + 1 === current ? 'w-8 bg-[var(--color-brand-cyan)]'
          : i + 1 < current  ? 'w-4 bg-[var(--color-brand-cyan)]/40'
          : 'w-4 bg-[var(--color-border)]')} />
      ))}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function Component() {
  const navigate   = useNavigate()
  const user       = useAuthStore((s) => s.user)
  const [step, setStep]         = useState(1)
  const [experience, setExp]    = useState('')
  const [jobTypes, setJobTypes] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [skillList, setSkillList]   = useState<string[]>([])

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema) })
  const form3 = useForm<Step3>({ resolver: zodResolver(step3Schema) })

  const submit = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.patch('profile/me', { json: payload }).json<void>(),
    onSuccess: () => {
      toast.success('Profile set up! Welcome to Climbr.')
      navigate('/dashboard')
    },
    onError: () => toast.error('Something went wrong — try again'),
  })

  function addSkill(raw: string) {
    const tag = raw.trim().replace(/,+$/, '')
    if (!tag || skillList.includes(tag)) return
    const next = [...skillList, tag]
    setSkillList(next)
    form2.setValue('skills', next.join(', '), { shouldValidate: true })
    setSkillInput('')
  }

  function removeSkill(s: string) {
    const next = skillList.filter((x) => x !== s)
    setSkillList(next)
    form2.setValue('skills', next.join(', '), { shouldValidate: true })
  }

  function toggleJobType(t: string) {
    setJobTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  function handleFinalSubmit(v: Step3) {
    const v1 = form1.getValues()
    submit.mutate({
      headline:    v1.headline,
      location:    v1.location,
      experience,
      job_types:   jobTypes,
      skills:      skillList,
      bio:         v.bio,
    })
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="mb-10">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[15px] font-[700]">
              Climbr
            </span>
          </div>

          <StepDots current={step} total={3} />

          {/* ─── Step 1: Basics ─────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <h1 className="text-[28px] font-[700] text-[var(--color-brand-navy)] mb-1">
                Hey {user?.firstName}, let's set up your profile
              </h1>
              <p className="text-[14px] text-[var(--color-text-secondary)] mb-8">
                This takes 2 minutes and helps employers find you.
              </p>

              <form onSubmit={form1.handleSubmit(() => setStep(2))} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">
                    Headline <span className="text-[var(--color-text-tertiary)] font-[400]">(e.g. "Frontend Engineer · Lagos")</span>
                  </label>
                  <Input placeholder="What's your professional title?" {...form1.register('headline')} />
                  {form1.formState.errors.headline && (
                    <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{form1.formState.errors.headline.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Location</label>
                  <Input placeholder="City, Country" {...form1.register('location')} />
                  {form1.formState.errors.location && (
                    <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{form1.formState.errors.location.message}</p>
                  )}
                </div>

                <div>
                  <p className="text-[13px] font-[600] text-[var(--color-text-primary)] mb-3">Experience level</p>
                  <div className="space-y-2">
                    {EXP_OPTIONS.map(({ id, label, desc }) => (
                      <button key={id} type="button" onClick={() => setExp(id)}
                        className={cn('w-full flex items-center gap-4 px-4 py-3 rounded-[var(--radius-md)] border-2 transition-all text-left',
                          experience === id
                            ? 'border-[var(--color-brand-cyan)] bg-[var(--color-brand-cyan-soft)]'
                            : 'border-[var(--color-border)] hover:border-[var(--color-brand-cyan)]/40'
                        )}>
                        <div>
                          <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{label}</p>
                          <p className="text-[12px] text-[var(--color-text-secondary)]">{desc}</p>
                        </div>
                        {experience === id && (
                          <div className="ml-auto w-4 h-4 rounded-full bg-[var(--color-brand-cyan)] flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2">Continue</Button>
              </form>
            </>
          )}

          {/* ─── Step 2: Skills & job types ─────────────────────────────── */}
          {step === 2 && (
            <>
              <button type="button" onClick={() => setStep(1)}
                className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 flex items-center gap-1">
                ← Back
              </button>
              <h1 className="text-[28px] font-[700] text-[var(--color-brand-navy)] mb-1">Skills & preferences</h1>
              <p className="text-[14px] text-[var(--color-text-secondary)] mb-8">
                Help employers match you with the right opportunities.
              </p>

              <form onSubmit={form2.handleSubmit(() => setStep(3))} className="space-y-6">
                {/* Skills tag input */}
                <div>
                  <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">
                    Skills <span className="text-[var(--color-text-tertiary)] font-[400]">(press Enter or comma to add)</span>
                  </label>
                  <div className={cn('flex flex-wrap gap-2 p-3 rounded-[var(--radius-md)] border-2 min-h-[48px] transition-colors',
                    form2.formState.errors.skills ? 'border-[var(--color-brand-pink)]' : 'border-[var(--color-border)] focus-within:border-[var(--color-brand-cyan)]'
                  )}>
                    {skillList.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-brand-cyan-soft)] text-[var(--color-brand-cyan)] text-[12px] font-[600]">
                        {s}
                        <button type="button" onClick={() => removeSkill(s)} className="hover:opacity-60">×</button>
                      </span>
                    ))}
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput) }
                        if (e.key === 'Backspace' && !skillInput && skillList.length) removeSkill(skillList[skillList.length - 1])
                      }}
                      onBlur={() => { if (skillInput) addSkill(skillInput) }}
                      placeholder={skillList.length ? '' : 'React, Python, Product Management…'}
                      className="flex-1 min-w-[120px] outline-none text-[14px] bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
                    />
                  </div>
                  {/* hidden input for RHF validation */}
                  <input type="hidden" {...form2.register('skills')} />
                  {form2.formState.errors.skills && (
                    <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{form2.formState.errors.skills.message}</p>
                  )}
                </div>

                {/* Job type multi-select */}
                <div>
                  <p className="text-[13px] font-[600] text-[var(--color-text-primary)] mb-3">
                    Preferred job types <span className="text-[var(--color-text-tertiary)] font-[400]">(select all that apply)</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {JOB_TYPE_OPTIONS.map((t) => (
                      <button key={t} type="button" onClick={() => toggleJobType(t)}
                        className={cn('px-4 py-2 rounded-full border-2 text-[13px] font-[600] transition-all',
                          jobTypes.includes(t)
                            ? 'border-[var(--color-brand-cyan)] bg-[var(--color-brand-cyan-soft)] text-[var(--color-brand-cyan)]'
                            : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-cyan)]/40'
                        )}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full">Continue</Button>
              </form>
            </>
          )}

          {/* ─── Step 3: Bio ─────────────────────────────────────────────── */}
          {step === 3 && (
            <>
              <button type="button" onClick={() => setStep(2)}
                className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 flex items-center gap-1">
                ← Back
              </button>
              <h1 className="text-[28px] font-[700] text-[var(--color-brand-navy)] mb-1">Tell your story</h1>
              <p className="text-[14px] text-[var(--color-text-secondary)] mb-8">
                A short bio helps you stand out. Keep it genuine.
              </p>

              <form onSubmit={form3.handleSubmit(handleFinalSubmit)} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Bio</label>
                  <textarea
                    rows={5}
                    placeholder="I'm a product designer based in Lagos with 3 years of experience building fintech products..."
                    {...form3.register('bio')}
                    className={cn(
                      'w-full px-3 py-2.5 rounded-[var(--radius-md)] border-2 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] bg-white resize-none outline-none transition-colors',
                      form3.formState.errors.bio
                        ? 'border-[var(--color-brand-pink)]'
                        : 'border-[var(--color-border)] focus:border-[var(--color-brand-cyan)]'
                    )}
                  />
                  {form3.formState.errors.bio && (
                    <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{form3.formState.errors.bio.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full mt-2" disabled={submit.isPending}>
                  {submit.isPending ? 'Saving…' : 'Finish setup'}
                </Button>

                <button type="button" onClick={() => navigate('/dashboard')}
                  className="w-full text-center text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]">
                  Skip for now
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  )
}
