import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useJobPricing, useTrainingPricing, useUpdateJobPricing, useUpdateTrainingPricing } from '@/lib/api/queries/useAdmin'
import type { PricingPackage } from '@/lib/api/endpoints/employer'
import { cn } from '@/lib/utils'

interface EditState { price: string; description: string }

function PackageCard({ pkg, onSave, saving, accent }: {
  pkg: PricingPackage
  onSave: (id: number, data: { price: number; description: string }) => void
  saving: boolean
  accent: string
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<EditState>({ price: String(pkg.price), description: pkg.description })

  function submit() {
    onSave(pkg.id, { price: Number(form.price), description: form.description })
    setEditing(false)
  }

  return (
    <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[16px] font-[700] text-[var(--color-text-primary)] capitalize">{pkg.plan}</p>
          <p className="text-[13px] text-[var(--color-text-secondary)]">{pkg.quantity} credit{pkg.quantity !== 1 ? 's' : ''}</p>
        </div>
        {!editing && (
          <Button size="icon" variant="ghost" onClick={() => setEditing(true)} className="w-8 h-8">
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-[600] text-[var(--color-text-secondary)] mb-1">Price (₦)</label>
            <Input type="number" min="0" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[12px] font-[600] text-[var(--color-text-secondary)] mb-1">Description</label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" style={{ background: accent }} onClick={submit} disabled={saving}>
              <Check className="w-3.5 h-3.5 mr-1" />Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              <X className="w-3.5 h-3.5 mr-1" />Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-[28px] font-[800] mt-2" style={{ color: accent }}>₦{pkg.price.toLocaleString()}</p>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1">{pkg.description}</p>
        </>
      )}
    </div>
  )
}

export function Component() {
  const [tab, setTab] = useState<'jobs' | 'trainings'>('jobs')
  const { data: jobInfo,      isLoading: loadingJobs      } = useJobPricing()
  const { data: trainingInfo, isLoading: loadingTrainings } = useTrainingPricing()
  const updateJob      = useUpdateJobPricing()
  const updateTraining = useUpdateTrainingPricing()

  const jobPackages      = jobInfo?.pricing ?? []
  const trainingPackages = trainingInfo?.pricing ?? []

  function saveJob(id: number, data: { price: number; description: string }) {
    updateJob.mutate({ id, data: { price: data.price, description: data.description } })
  }
  function saveTraining(id: number, data: { price: number; description: string }) {
    updateTraining.mutate({ id, data: { price: data.price, description: data.description } })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Pricing</h1>

      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {(['jobs', 'trainings'] as const).map((key) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={cn('px-5 py-3 text-[14px] font-[600] border-b-2 -mb-px transition-all capitalize',
              tab === key
                ? 'border-[var(--color-brand-cyan)] text-[var(--color-brand-cyan)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}>
            {key}
          </button>
        ))}
      </div>

      {tab === 'jobs' && (
        loadingJobs ? (
          <div className="grid sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-44 rounded-[var(--radius-xl)]" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {jobPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onSave={saveJob} saving={updateJob.isPending} accent="var(--color-brand-orange)" />
            ))}
          </div>
        )
      )}

      {tab === 'trainings' && (
        loadingTrainings ? (
          <div className="grid sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-44 rounded-[var(--radius-xl)]" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {trainingPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onSave={saveTraining} saving={updateTraining.isPending} accent="var(--color-brand-yellow)" />
            ))}
          </div>
        )
      )}
    </div>
  )
}
