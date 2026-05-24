import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-[var(--color-text-tertiary)]" />
        </div>
      )}
      <h3 className="text-[18px] font-[600] text-[var(--color-text-primary)] mb-2">{title}</h3>
      {description && <p className="text-[14px] text-[var(--color-text-secondary)] max-w-xs mb-6">{description}</p>}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}
