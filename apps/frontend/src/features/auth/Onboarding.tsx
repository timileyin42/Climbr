import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RequireAuth } from '@/lib/auth/guards'
import { useAuthStore } from '@/lib/auth/store'
import { api } from '@/lib/api/client'
import { talentApi } from '@/lib/api/endpoints/talent'
import { cn } from '@/lib/utils'

// ── Progress bar ─────────────────────────────────────────────────────────────

const TOTAL_STEPS = 8

function ProgressBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-all',
            i + 1 < current
              ? 'bg-[var(--color-brand-cyan)]'
              : i + 1 === current
              ? 'bg-[var(--color-brand-cyan)]'
              : 'bg-[var(--color-border)]',
          )}
        />
      ))}
    </div>
  )
}

// ── Step label ────────────────────────────────────────────────────────────────

const STEP_LABELS = [
  'Summary',
  'Education',
  'Resume',
  'Certificates',
  'Work Experience',
  'Skills',
  'Hobbies & Interests',
  'Language',
]

// ── Shared nav buttons ────────────────────────────────────────────────────────

function StepNav({
  step,
  onBack,
  onSkip,
  isLoading,
  continueLabel = 'Continue',
}: {
  step: number
  onBack: () => void
  onSkip: () => void
  isLoading?: boolean
  continueLabel?: string
}) {
  return (
    <div className="mt-6 space-y-3">
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving…' : continueLabel}
      </Button>
      <button
        type="button"
        onClick={onSkip}
        className="w-full text-center text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] py-1"
      >
        Skip for now
      </button>
      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center justify-center gap-1"
        >
          ← Back
        </button>
      )}
    </div>
  )
}

// ── STEP 1: Bio / Summary ────────────────────────────────────────────────────

const bioSchema = z.object({
  bio: z.string().min(20, 'At least 20 characters').max(600, 'Max 600 characters'),
})
type BioForm = z.infer<typeof bioSchema>

function Step1Bio({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<BioForm>({ resolver: zodResolver(bioSchema) })
  const charCount = watch('bio', '').length

  const save = useMutation({
    mutationFn: (v: BioForm) => talentApi.updateProfile({ bio: v.bio }),
    onSuccess: onNext,
    onError: () => toast.error('Failed to save — try again'),
  })

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))}>
      <h1 className="text-[26px] font-[700] text-[var(--color-text-primary)] mb-1">
        Tell us about yourself
      </h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
        Write a short bio. This is the first thing employers see on your profile.
      </p>

      <div>
        <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">
          Summary / Bio
        </label>
        <textarea
          rows={5}
          placeholder="I'm a product designer based in Lagos with 3 years of experience building fintech products…"
          {...register('bio')}
          className={cn(
            'w-full px-3 py-2.5 rounded-[var(--radius-md)] border-2 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] bg-white resize-none outline-none transition-colors',
            errors.bio
              ? 'border-[var(--color-brand-pink)]'
              : 'border-[var(--color-border)] focus:border-[var(--color-brand-cyan)]',
          )}
        />
        <div className="flex justify-between mt-1">
          {errors.bio
            ? <p className="text-[12px] text-[var(--color-brand-pink)]">{errors.bio.message}</p>
            : <span />}
          <p className="text-[12px] text-[var(--color-text-tertiary)]">{charCount}/600</p>
        </div>
      </div>

      <StepNav step={1} onBack={() => {}} onSkip={onSkip} isLoading={save.isPending} />
    </form>
  )
}

// ── STEP 2: Education ────────────────────────────────────────────────────────

const educationSchema = z.object({
  institution:    z.string().min(2, 'Required'),
  degree:         z.string().min(2, 'Required'),
  field_of_study: z.string().min(2, 'Required'),
  start_year:     z.coerce.number().min(1970).max(2030),
  end_year:       z.coerce.number().min(1970).max(2030).optional(),
  current:        z.boolean().optional(),
})
type EducationForm = z.infer<typeof educationSchema>

function Step2Education({
  onNext,
  onBack,
  onSkip,
}: {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<EducationForm>({
    resolver: zodResolver(educationSchema),
    defaultValues: { current: false },
  })
  const isCurrent = watch('current')

  const save = useMutation({
    mutationFn: (v: EducationForm) => talentApi.addEducation(v),
    onSuccess: onNext,
    onError: () => toast.error('Failed to save — try again'),
  })

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))}>
      <h1 className="text-[26px] font-[700] text-[var(--color-text-primary)] mb-1">Education</h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
        Add your highest level of education. You can add more from your profile later.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Institution</label>
          <Input placeholder="University of Lagos" {...register('institution')} />
          {errors.institution && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.institution.message}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Degree</label>
          <Input placeholder="Bachelor of Science" {...register('degree')} />
          {errors.degree && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.degree.message}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Field of Study</label>
          <Input placeholder="Computer Science" {...register('field_of_study')} />
          {errors.field_of_study && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.field_of_study.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Start Year</label>
            <Input type="number" placeholder="2018" {...register('start_year')} />
          </div>
          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">End Year</label>
            <Input type="number" placeholder="2022" disabled={!!isCurrent} {...register('end_year')} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-[var(--color-text-primary)] cursor-pointer">
          <input type="checkbox" {...register('current')} className="accent-[var(--color-brand-cyan)]" />
          Currently enrolled
        </label>
      </div>

      <StepNav step={2} onBack={onBack} onSkip={onSkip} isLoading={save.isPending} />
    </form>
  )
}

// ── STEP 3: Resume ───────────────────────────────────────────────────────────

const resumeSchema = z.object({
  resume_url: z.string().url('Enter a valid URL').or(z.literal('')),
})
type ResumeForm = z.infer<typeof resumeSchema>

function Step3Resume({
  onNext,
  onBack,
  onSkip,
}: {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ResumeForm>({
    resolver: zodResolver(resumeSchema),
  })

  const save = useMutation({
    mutationFn: (v: ResumeForm) =>
      v.resume_url ? talentApi.updateProfile({ resume_url: v.resume_url }) : Promise.resolve(null),
    onSuccess: onNext,
    onError: () => toast.error('Failed to save — try again'),
  })

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))}>
      <h1 className="text-[26px] font-[700] text-[var(--color-text-primary)] mb-1">Resume</h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
        Paste a link to your CV or resume — Google Drive, Dropbox, or any public link works.
      </p>

      <div>
        <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Resume URL</label>
        <Input
          type="url"
          placeholder="https://drive.google.com/…"
          {...register('resume_url')}
        />
        {errors.resume_url && (
          <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.resume_url.message}</p>
        )}
        <p className="text-[12px] text-[var(--color-text-tertiary)] mt-2">
          Make sure the link is set to "Anyone with the link can view".
        </p>
      </div>

      <StepNav step={3} onBack={onBack} onSkip={onSkip} isLoading={save.isPending} />
    </form>
  )
}

// ── STEP 4: Certificates ─────────────────────────────────────────────────────

const certSchema = z.object({
  name:                 z.string().min(2, 'Required'),
  issuing_organization: z.string().min(2, 'Required'),
  issue_date:           z.string().optional(),
  credential_url:       z.string().url('Enter a valid URL').or(z.literal('')).optional(),
})
type CertForm = z.infer<typeof certSchema>

function Step4Certificates({
  onNext,
  onBack,
  onSkip,
}: {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}) {
  const [certFile, setCertFile] = useState<File | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<CertForm>({
    resolver: zodResolver(certSchema),
  })

  const [isSaving, setIsSaving] = useState(false)

  async function handleSave(v: CertForm) {
    setIsSaving(true)
    try {
      // Step 1: create the certificate record
      const created = await api.post('talent/profile/certificates', { json: v }).json<{ id: number }>()

      // Step 2: if user picked a file, upload it
      if (certFile && created?.id) {
        const fd = new FormData()
        fd.append('certificate_file', certFile)
        await api.post(`talent/profile/certificates/${created.id}/upload`, { body: fd })
      }

      onNext()
    } catch {
      toast.error('Failed to save — try again')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <h1 className="text-[26px] font-[700] text-[var(--color-text-primary)] mb-1">Certificates</h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
        Add a professional certification or course completion. You can add more later.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Certificate Name</label>
          <Input placeholder="AWS Solutions Architect" {...register('name')} />
          {errors.name && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Issuing Organisation</label>
          <Input placeholder="Amazon Web Services" {...register('issuing_organization')} />
          {errors.issuing_organization && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.issuing_organization.message}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Issue Date</label>
          <Input type="date" {...register('issue_date')} />
        </div>
        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">
            Credential URL <span className="text-[var(--color-text-tertiary)] font-[400]">(optional)</span>
          </label>
          <Input type="url" placeholder="https://…" {...register('credential_url')} />
          {errors.credential_url && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.credential_url.message}</p>}
        </div>

        {/* Certificate image / file upload */}
        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">
            Upload Certificate <span className="text-[var(--color-text-tertiary)] font-[400]">(optional — PNG, JPG, PDF)</span>
          </label>
          <label
            className="flex items-center gap-3 w-full border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] px-4 py-3 cursor-pointer hover:border-[var(--color-brand-cyan)] transition-colors"
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              className="hidden"
              onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
            />
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-cyan-soft)] flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              {certFile ? (
                <p className="text-[13px] font-[600] text-[var(--color-text-primary)] truncate">{certFile.name}</p>
              ) : (
                <p className="text-[13px] text-[var(--color-text-secondary)]">Click to upload certificate image or PDF</p>
              )}
            </div>
            {certFile && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setCertFile(null) }}
                className="text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-pink)] shrink-0 text-[18px] leading-none"
              >
                ×
              </button>
            )}
          </label>
        </div>
      </div>

      <StepNav step={4} onBack={onBack} onSkip={onSkip} isLoading={isSaving} />
    </form>
  )
}

// ── STEP 5: Work Experience ──────────────────────────────────────────────────

const workSchema = z.object({
  company:    z.string().min(2, 'Required'),
  role:       z.string().min(2, 'Required'),
  description:z.string().optional(),
  start_date: z.string().min(1, 'Required'),
  end_date:   z.string().optional(),
  current:    z.boolean().optional(),
})
type WorkForm = z.infer<typeof workSchema>

function Step5WorkExperience({
  onNext,
  onBack,
  onSkip,
}: {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<WorkForm>({
    resolver: zodResolver(workSchema),
    defaultValues: { current: false },
  })
  const isCurrent = watch('current')

  const save = useMutation({
    mutationFn: (v: WorkForm) => talentApi.addWorkExperience(v),
    onSuccess: onNext,
    onError: () => toast.error('Failed to save — try again'),
  })

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))}>
      <h1 className="text-[26px] font-[700] text-[var(--color-text-primary)] mb-1">Work Experience</h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
        Add your most recent role. You can add more from your profile page.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Company</label>
          <Input placeholder="Paystack" {...register('company')} />
          {errors.company && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.company.message}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Role / Title</label>
          <Input placeholder="Frontend Engineer" {...register('role')} />
          {errors.role && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.role.message}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">
            Description <span className="text-[var(--color-text-tertiary)] font-[400]">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="What did you work on?"
            {...register('description')}
            className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] focus:border-[var(--color-brand-cyan)] text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] bg-white resize-none outline-none transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Start Date</label>
            <Input type="month" {...register('start_date')} />
            {errors.start_date && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.start_date.message}</p>}
          </div>
          <div>
            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">End Date</label>
            <Input type="month" disabled={!!isCurrent} {...register('end_date')} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-[var(--color-text-primary)] cursor-pointer">
          <input type="checkbox" {...register('current')} className="accent-[var(--color-brand-cyan)]" />
          I currently work here
        </label>
      </div>

      <StepNav step={5} onBack={onBack} onSkip={onSkip} isLoading={save.isPending} />
    </form>
  )
}

// ── STEP 6: Skills ───────────────────────────────────────────────────────────

function Step6Skills({
  onNext,
  onBack,
  onSkip,
}: {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}) {
  const [input, setInput]   = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  function addSkill(raw: string) {
    const tag = raw.trim().replace(/,+$/, '')
    if (!tag || skills.includes(tag)) return
    setSkills((prev) => [...prev, tag])
    setInput('')
  }

  function removeSkill(s: string) {
    setSkills((prev) => prev.filter((x) => x !== s))
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (input) addSkill(input)
    if (skills.length === 0) { onNext(); return }

    setSaving(true)
    try {
      await Promise.all(
        skills.map((name) =>
          api.post('talent/profile/skills', { json: { name } }).json<unknown>(),
        ),
      )
      onNext()
    } catch {
      toast.error('Failed to save skills — try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-[26px] font-[700] text-[var(--color-text-primary)] mb-1">Skills</h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
        Add your key skills. Press Enter or comma to add each one.
      </p>

      <div
        className={cn(
          'flex flex-wrap gap-2 p-3 rounded-[var(--radius-md)] border-2 min-h-[56px] transition-colors',
          'border-[var(--color-border)] focus-within:border-[var(--color-brand-cyan)]',
        )}
      >
        {skills.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-brand-cyan-soft)] text-[var(--color-brand-cyan)] text-[12px] font-[600]"
          >
            {s}
            <button type="button" onClick={() => removeSkill(s)} className="hover:opacity-60 leading-none">×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(input) }
            if (e.key === 'Backspace' && !input && skills.length) removeSkill(skills[skills.length - 1])
          }}
          onBlur={() => { if (input) addSkill(input) }}
          placeholder={skills.length ? '' : 'React, Python, Product Design…'}
          className="flex-1 min-w-[140px] outline-none text-[14px] bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
        />
      </div>

      <StepNav step={6} onBack={onBack} onSkip={onSkip} isLoading={saving} />
    </form>
  )
}

// ── STEP 7: Hobbies & Interests ──────────────────────────────────────────────

function Step7Hobbies({
  onNext,
  onBack,
  onSkip,
}: {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}) {
  const [input, setInput]     = useState('')
  const [hobbies, setHobbies] = useState<string[]>([])
  const [saving, setSaving]   = useState(false)

  function addHobby(raw: string) {
    const tag = raw.trim().replace(/,+$/, '')
    if (!tag || hobbies.includes(tag)) return
    setHobbies((prev) => [...prev, tag])
    setInput('')
  }

  function removeHobby(s: string) {
    setHobbies((prev) => prev.filter((x) => x !== s))
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (input) addHobby(input)
    if (hobbies.length === 0) { onNext(); return }

    setSaving(true)
    try {
      await Promise.all(
        hobbies.map((name) =>
          api.post('talent/profile/hobbies', { json: { name } }).json<unknown>(),
        ),
      )
      onNext()
    } catch {
      toast.error('Failed to save — try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-[26px] font-[700] text-[var(--color-text-primary)] mb-1">
        Hobbies & Interests
      </h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
        Share what you enjoy outside of work. Press Enter or comma to add each one.
      </p>

      <div
        className={cn(
          'flex flex-wrap gap-2 p-3 rounded-[var(--radius-md)] border-2 min-h-[56px] transition-colors',
          'border-[var(--color-border)] focus-within:border-[var(--color-brand-cyan)]',
        )}
      >
        {hobbies.map((h) => (
          <span
            key={h}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF0E5] text-[#FF8A3D] text-[12px] font-[600]"
          >
            {h}
            <button type="button" onClick={() => removeHobby(h)} className="hover:opacity-60 leading-none">×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addHobby(input) }
            if (e.key === 'Backspace' && !input && hobbies.length) removeHobby(hobbies[hobbies.length - 1])
          }}
          onBlur={() => { if (input) addHobby(input) }}
          placeholder={hobbies.length ? '' : 'Travelling, Photography, Football…'}
          className="flex-1 min-w-[140px] outline-none text-[14px] bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
        />
      </div>

      <StepNav step={7} onBack={onBack} onSkip={onSkip} isLoading={saving} />
    </form>
  )
}

// ── STEP 8: Language ─────────────────────────────────────────────────────────

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Fluent', 'Native']

const languageSchema = z.object({
  name:        z.string().min(2, 'Required'),
  proficiency: z.string().min(1, 'Select a level'),
})
type LanguageForm = z.infer<typeof languageSchema>

function Step8Language({
  onFinish,
  onBack,
  onSkip,
}: {
  onFinish: () => void
  onBack: () => void
  onSkip: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<LanguageForm>({
    resolver: zodResolver(languageSchema),
  })

  const save = useMutation({
    mutationFn: (v: LanguageForm) =>
      api.post('talent/profile/languages', { json: v }).json<unknown>(),
    onSuccess: onFinish,
    onError: () => toast.error('Failed to save — try again'),
  })

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))}>
      <h1 className="text-[26px] font-[700] text-[var(--color-text-primary)] mb-1">Language</h1>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
        Add the languages you speak. You can add more from your profile.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Language</label>
          <Input placeholder="English" {...register('name')} />
          {errors.name && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Proficiency</label>
          <select
            {...register('proficiency')}
            className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] focus:border-[var(--color-brand-cyan)] text-[14px] text-[var(--color-text-primary)] bg-white outline-none transition-colors"
          >
            <option value="">Select proficiency level</option>
            {PROFICIENCY_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          {errors.proficiency && (
            <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.proficiency.message}</p>
          )}
        </div>
      </div>

      <StepNav
        step={8}
        onBack={onBack}
        onSkip={onSkip}
        isLoading={save.isPending}
        continueLabel="Finish setup"
      />
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function Component() {
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)
  const [step, setStep] = useState(1)

  // If talent already has bio set, skip onboarding (returning user)
  const { data: profile, isLoading: checkingProfile } = useQuery({
    queryKey: ['talent-profile-onboarding-check'],
    queryFn:  talentApi.profile,
    enabled:  !!user && user.role === 'talent',
    retry:    false,
  })

  useEffect(() => {
    if (profile?.bio) {
      navigate('/dashboard', { replace: true })
    }
  }, [profile, navigate])

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  const goBack = () => setStep((s) => Math.max(s - 1, 1))
  const skip   = () => {
    if (step === TOTAL_STEPS) { navigate('/dashboard'); return }
    goNext()
  }

  function handleFinish() {
    toast.success('Profile set up! Welcome to Climbr 🎉')
    navigate('/dashboard')
  }

  if (checkingProfile) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--color-brand-cyan)] border-t-transparent rounded-full animate-spin" />
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-between">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[15px] font-[700]">
              Climbr
            </span>
            <span className="text-[13px] text-[var(--color-text-tertiary)]">
              Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
            </span>
          </div>

          <ProgressBar current={step} />

          {step === 1 && <Step1Bio       onNext={goNext}    onSkip={skip} />}
          {step === 2 && <Step2Education onNext={goNext} onBack={goBack} onSkip={skip} />}
          {step === 3 && <Step3Resume    onNext={goNext} onBack={goBack} onSkip={skip} />}
          {step === 4 && <Step4Certificates onNext={goNext} onBack={goBack} onSkip={skip} />}
          {step === 5 && <Step5WorkExperience onNext={goNext} onBack={goBack} onSkip={skip} />}
          {step === 6 && <Step6Skills    onNext={goNext} onBack={goBack} onSkip={skip} />}
          {step === 7 && <Step7Hobbies   onNext={goNext} onBack={goBack} onSkip={skip} />}
          {step === 8 && (
            <Step8Language
              onFinish={handleFinish}
              onBack={goBack}
              onSkip={() => navigate('/dashboard')}
            />
          )}
        </div>
      </div>
    </RequireAuth>
  )
}
