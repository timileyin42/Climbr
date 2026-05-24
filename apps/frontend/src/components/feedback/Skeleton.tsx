import { cn } from '@/lib/utils'

interface Props { className?: string }

export function Skeleton({ className }: Props) {
  return (
    <div className={cn('animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)]', className)} />
  )
}

export function JobCardSkeleton() {
  return (
    <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 space-y-3">
      <Skeleton className="w-10 h-10 rounded-[var(--radius-md)]" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}
