import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Clock, BookOpen, Users, Share2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/feedback/Skeleton'
import { jobsApi } from '@/lib/api/endpoints/jobs'
import { talentApi } from '@/lib/api/endpoints/talent'
import { useMutation } from '@tanstack/react-query'

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-[var(--color-text-tertiary)] mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wide">{label}</p>
        <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{value}</p>
      </div>
    </div>
  )
}

export function Component() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: training, isLoading } = useQuery({
    queryKey: ['training', id],
    queryFn:  () => jobsApi.trainingDetail(Number(id)),
    enabled:  !!id,
  })

  const apply = useMutation({
    mutationFn: () => talentApi.applyTraining(Number(id)),
    onSuccess: () => toast.success('Application submitted!'),
    onError:   () => toast.error('Failed to apply — try again'),
  })

  const save = useMutation({
    mutationFn: () => talentApi.saveTraining(Number(id)),
    onSuccess: () => toast.success('Training saved'),
    onError:   () => toast.error('Failed to save'),
  })

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard')
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-[var(--radius-xl)]" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    )
  }

  if (!training) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--color-text-secondary)]">Training not found.</p>
        <Button variant="outline" onClick={() => navigate('/trainings')} className="mt-4">Back to Trainings</Button>
      </div>
    )
  }

  const costLabel = training.cost === 0 ? 'Free' : `₦${training.cost.toLocaleString()}`

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        <ArrowLeft className="w-4 h-4" />
        Trainings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-brand-cyan-soft)] flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-[var(--color-brand-cyan)]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[22px] font-[700] text-[var(--color-text-primary)] leading-tight">{training.title}</h1>
                <p className="text-[14px] text-[var(--color-text-secondary)] mt-0.5">{training.trainer_name}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {training.category && <Badge variant="chip">{training.category}</Badge>}
              {training.delivery_method && (
                <Badge variant="chip" className="capitalize">{training.delivery_method.replace('_', ' ')}</Badge>
              )}
              {training.cost === 0
                ? <Badge variant="accepted">Free</Badge>
                : <Badge variant="chip">{costLabel}</Badge>}
            </div>

            {training.description && (
              <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">{training.description}</p>
            )}
          </div>

          {/* What you'll learn */}
          {training.highlights && (
            <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
              <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)] mb-3">✅ What You'll Learn</h2>
              <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                {training.highlights}
              </p>
            </div>
          )}

          {/* Course outline */}
          {training.curriculum && (
            <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
              <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)] mb-3">📋 Course Outline</h2>
              <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                {training.curriculum}
              </p>
            </div>
          )}

          {/* Who should join */}
          {training.who_should_join && (
            <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
              <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)] mb-3">🙋 Who Should Join</h2>
              <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                {training.who_should_join}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* CTA card */}
          <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 space-y-3">
            <Button
              className="w-full"
              onClick={() => apply.mutate()}
              disabled={apply.isPending || apply.isSuccess}
            >
              {apply.isSuccess ? 'Applied!' : apply.isPending ? 'Applying…' : 'Join Training'}
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              variant="ghost"
              className="w-full text-[var(--color-text-secondary)]"
              onClick={() => save.mutate()}
              disabled={save.isPending || save.isSuccess}
            >
              {save.isSuccess ? 'Saved!' : 'Save for later'}
            </Button>
          </div>

          {/* Training details */}
          <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 space-y-4">
            <h3 className="text-[14px] font-[700] text-[var(--color-text-primary)]">Training Details</h3>

            <DetailRow
              icon={MapPin}
              label="Format"
              value={training.delivery_method?.replace('_', '/') ?? 'Online'}
            />
            {training.start_date && (
              <DetailRow
                icon={Calendar}
                label="Start Date"
                value={new Date(training.start_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
              />
            )}
            {training.duration && (
              <DetailRow icon={Clock} label="Duration" value={training.duration} />
            )}
            <DetailRow
              icon={BookOpen}
              label="Cost"
              value={costLabel}
            />
            {training.level && (
              <DetailRow icon={Users} label="Level" value={training.level} />
            )}
            {training.open_slots !== undefined && (
              <DetailRow
                icon={Users}
                label="Seats Available"
                value={`${training.open_slots} of ${training.open_slots + training.applicant_count} available`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
