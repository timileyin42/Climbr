import { useState } from 'react'
import { Plus, Pencil, Check, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useTalentProfile, useUpdateTalentProfile } from '@/lib/api/queries/useTalent'
import { talentApi, type WorkExperience, type Education } from '@/lib/api/endpoints/talent'
import { useQueryClient } from '@tanstack/react-query'
import { talentKeys } from '@/lib/api/queries/useTalent'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Bio edit ─────────────────────────────────────────────────────────────────

function BioSection({ bio }: { bio: string | null }) {
  const [editing, setEditing] = useState(false)
  const [value,   setValue]   = useState(bio ?? '')
  const update = useUpdateTalentProfile()

  function save() {
    update.mutate({ bio: value }, { onSuccess: () => setEditing(false) })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)]">Bio</h2>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-1 text-[13px] text-[var(--color-brand-cyan)] hover:underline">
            <Pencil className="w-3.5 h-3.5" />Edit
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea
            rows={4}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border-2 border-[var(--color-brand-cyan)] text-[14px] text-[var(--color-text-primary)] bg-white resize-none outline-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save'}</Button>
            <Button size="sm" variant="outline" onClick={() => { setEditing(false); setValue(bio ?? '') }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
          {bio || <span className="italic text-[var(--color-text-tertiary)]">No bio yet. Click Edit to add one.</span>}
        </p>
      )}
    </div>
  )
}

// ── Work Experience ───────────────────────────────────────────────────────────

const workSchema = z.object({
  role:       z.string().min(1, 'Required'),
  company:    z.string().min(1, 'Required'),
  start_date: z.string().min(1, 'Required'),
  end_date:   z.string().optional(),
  current:    z.boolean().optional(),
})
type WorkForm = z.infer<typeof workSchema>

function WorkSection({ items }: { items: WorkExperience[] }) {
  const [adding, setAdding] = useState(false)
  const qc  = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkForm>({ resolver: zodResolver(workSchema) })

  async function onSubmit(v: WorkForm) {
    await talentApi.addWorkExperience(v)
    qc.invalidateQueries({ queryKey: talentKeys.profile })
    toast.success('Work experience added')
    reset()
    setAdding(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)]">Work Experience</h2>
        <button type="button" onClick={() => setAdding(!adding)} className="flex items-center gap-1 text-[13px] text-[var(--color-brand-cyan)] hover:underline">
          <Plus className="w-3.5 h-3.5" />Add
        </button>
      </div>

      {items.length === 0 && !adding && (
        <p className="text-[14px] italic text-[var(--color-text-tertiary)]">Nothing added yet.</p>
      )}

      <div className="space-y-3">
        {items.map((w) => (
          <div key={w.id} className="flex items-start gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
            <div className="w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0 text-[12px] font-[700] text-[var(--color-text-secondary)]">
              {w.company.charAt(0)}
            </div>
            <div>
              <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{w.role}</p>
              <p className="text-[13px] text-[var(--color-text-secondary)]">{w.company} · {w.start_date} – {w.current ? 'Present' : w.end_date ?? ''}</p>
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 border-2 border-[var(--color-brand-cyan)] rounded-[var(--radius-lg)] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-[600] text-[var(--color-text-primary)] mb-1">Role</label>
              <Input placeholder="Frontend Engineer" {...register('role')} />
              {errors.role && <p className="text-[11px] text-[var(--color-brand-pink)] mt-0.5">{errors.role.message}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-[600] text-[var(--color-text-primary)] mb-1">Company</label>
              <Input placeholder="Acme Inc." {...register('company')} />
              {errors.company && <p className="text-[11px] text-[var(--color-brand-pink)] mt-0.5">{errors.company.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-[600] text-[var(--color-text-primary)] mb-1">Start date</label>
              <Input type="date" {...register('start_date')} />
            </div>
            <div>
              <label className="block text-[12px] font-[600] text-[var(--color-text-primary)] mb-1">End date</label>
              <Input type="date" {...register('end_date')} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">Save</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => { setAdding(false); reset() }}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  )
}

// ── Education ────────────────────────────────────────────────────────────────

const eduSchema = z.object({
  institution:    z.string().min(1, 'Required'),
  degree:         z.string().min(1, 'Required'),
  field_of_study: z.string().min(1, 'Required'),
  start_year:     z.coerce.number().min(1950).max(2030),
  end_year:       z.coerce.number().optional(),
})
type EduForm = z.infer<typeof eduSchema>

function EducationSection({ items }: { items: Education[] }) {
  const [adding, setAdding] = useState(false)
  const qc  = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EduForm>({ resolver: zodResolver(eduSchema) })

  async function onSubmit(v: EduForm) {
    await talentApi.addEducation(v)
    qc.invalidateQueries({ queryKey: talentKeys.profile })
    toast.success('Education added')
    reset()
    setAdding(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)]">Education</h2>
        <button type="button" onClick={() => setAdding(!adding)} className="flex items-center gap-1 text-[13px] text-[var(--color-brand-cyan)] hover:underline">
          <Plus className="w-3.5 h-3.5" />Add
        </button>
      </div>

      {items.length === 0 && !adding && (
        <p className="text-[14px] italic text-[var(--color-text-tertiary)]">Nothing added yet.</p>
      )}

      <div className="space-y-3">
        {items.map((e) => (
          <div key={e.id} className="py-2 border-b border-[var(--color-border)] last:border-0">
            <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{e.degree} in {e.field_of_study}</p>
            <p className="text-[13px] text-[var(--color-text-secondary)]">{e.institution} · {e.start_year} – {e.end_year ?? 'Present'}</p>
          </div>
        ))}
      </div>

      {adding && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 border-2 border-[var(--color-brand-cyan)] rounded-[var(--radius-lg)] p-4 space-y-3">
          <div>
            <label className="block text-[12px] font-[600] text-[var(--color-text-primary)] mb-1">Institution</label>
            <Input placeholder="University of Lagos" {...register('institution')} />
            {errors.institution && <p className="text-[11px] text-[var(--color-brand-pink)] mt-0.5">{errors.institution.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-[600] text-[var(--color-text-primary)] mb-1">Degree</label>
              <Input placeholder="B.Sc." {...register('degree')} />
            </div>
            <div>
              <label className="block text-[12px] font-[600] text-[var(--color-text-primary)] mb-1">Field</label>
              <Input placeholder="Computer Science" {...register('field_of_study')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-[600] text-[var(--color-text-primary)] mb-1">Start year</label>
              <Input type="number" placeholder="2019" {...register('start_year')} />
            </div>
            <div>
              <label className="block text-[12px] font-[600] text-[var(--color-text-primary)] mb-1">End year</label>
              <Input type="number" placeholder="2023" {...register('end_year')} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">Save</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => { setAdding(false); reset() }}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function Component() {
  const { data: profile, isLoading } = useTalentProfile()

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    )
  }

  if (!profile) return null

  const initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header card */}
      <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
        <div className="flex items-start gap-5 mb-5">
          <div className="w-20 h-20 rounded-full bg-[var(--color-brand-navy)] flex items-center justify-center text-[24px] font-[800] text-white shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-[24px] font-[700] text-[var(--color-text-primary)]">{profile.first_name} {profile.last_name}</h1>
            <p className="text-[14px] text-[var(--color-text-secondary)]">{profile.email}</p>
            {profile.phone && <p className="text-[13px] text-[var(--color-text-tertiary)]">{profile.phone}</p>}
          </div>
        </div>
        <BioSection bio={profile.bio} />
      </div>

      {/* Skills */}
      {profile.profile.skills.length > 0 && (
        <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
          <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)] mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.profile.skills.map((s) => <Badge key={s.id} variant="chip">{s.name}</Badge>)}
          </div>
        </div>
      )}

      {/* Work experience */}
      <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
        <WorkSection items={profile.profile.work_experience} />
      </div>

      {/* Education */}
      <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
        <EducationSection items={profile.profile.education} />
      </div>

      {/* Certificates */}
      {profile.profile.certificates.length > 0 && (
        <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
          <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)] mb-3">Certificates</h2>
          <div className="space-y-2">
            {profile.profile.certificates.map((c) => (
              <div key={c.id} className="py-2 border-b border-[var(--color-border)] last:border-0">
                <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{c.name}</p>
                <p className="text-[13px] text-[var(--color-text-secondary)]">{c.issuer}{c.issue_date ? ` · ${c.issue_date}` : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hobbies */}
      {profile.profile.hobbies.length > 0 && (
        <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
          <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)] mb-3">Hobbies & Interests</h2>
          <div className="flex flex-wrap gap-2">
            {profile.profile.hobbies.map((h) => <Badge key={h.id} variant="chip">{h.name}</Badge>)}
          </div>
        </div>
      )}
    </div>
  )
}
