import { MessageSquare } from 'lucide-react'
import { EmptyState } from '@/components/feedback/EmptyState'

export function Component() {
  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Contact Submissions</h1>
      <EmptyState
        icon={MessageSquare}
        title="Contact submissions endpoint coming soon"
        description="The backend contact submissions API is not yet available. Submissions will appear here once the endpoint is implemented."
      />
    </div>
  )
}
