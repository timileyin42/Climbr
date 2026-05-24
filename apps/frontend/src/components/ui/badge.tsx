import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[11px] font-[500] leading-[1.3] transition-colors',
  {
    variants: {
      variant: {
        chip: 'bg-[var(--color-brand-orange-soft)] text-[var(--color-brand-orange)]',
        pending:
          'bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)]',
        'in-review':
          'bg-[var(--color-status-in-review-bg)] text-[var(--color-status-in-review)]',
        accepted:
          'bg-[var(--color-status-accepted-bg)] text-[var(--color-status-accepted)]',
        shortlisted:
          'bg-[var(--color-status-shortlisted-bg)] text-[var(--color-status-shortlisted)]',
        rejected:
          'bg-[var(--color-status-rejected-bg)] text-[var(--color-status-rejected)]',
        outline:
          'border border-[var(--color-border)] text-[var(--color-text-secondary)]',
      },
    },
    defaultVariants: {
      variant: 'chip',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
