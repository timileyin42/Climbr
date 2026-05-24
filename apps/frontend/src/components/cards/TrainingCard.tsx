import { MapPin, Calendar, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Training } from '@/lib/api/endpoints/jobs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Props {
  training: Training
  compact?: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCost(cost: number) {
  if (cost === 0) return 'Free'
  return `₦${cost.toLocaleString()}`
}

const deliveryLabel: Record<string, string> = {
  online: 'Online',
  in_person: 'In Person',
  hybrid: 'Hybrid',
}

export function TrainingCard({ training, compact = false }: Props) {
  return (
    <div className={cn(
      'group bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] transition-all duration-200',
      'hover:border-[var(--color-brand-yellow)] hover:shadow-[0_4px_20px_rgba(255,201,60,0.12)]',
      compact ? 'p-4' : 'p-5'
    )}>
      <Link to={`/trainings/${training.id}`} className="block">
        {/* Trainer logo placeholder */}
        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[#FFF8E0] flex items-center justify-center mb-3 text-[14px] font-[700] text-[var(--color-brand-yellow)]">
          {training.trainer_name.charAt(0).toUpperCase()}
        </div>

        <h3 className="text-[15px] font-[700] text-[var(--color-text-primary)] mb-0.5 line-clamp-1">{training.title}</h3>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-3">{training.trainer_name}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="chip">{training.category}</Badge>
          <Badge variant="chip">{deliveryLabel[training.delivery_method] ?? training.delivery_method}</Badge>
        </div>

        <div className="flex items-center gap-3 text-[12px] text-[var(--color-text-tertiary)] flex-wrap">
          {training.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />{training.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />{formatDate(training.start_date)}
          </span>
          <span className="flex items-center gap-1 font-[600] text-[var(--color-brand-orange)]">
            <DollarSign className="w-3 h-3" />{formatCost(training.cost)}
          </span>
        </div>
      </Link>
    </div>
  )
}
