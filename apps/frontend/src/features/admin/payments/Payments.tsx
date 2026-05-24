import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useAdminPayments } from '@/lib/api/queries/useAdmin'
import type { Payment } from '@/lib/api/endpoints/admin'
import { cn } from '@/lib/utils'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusVariant(status: string): 'accepted' | 'rejected' | 'chip' {
  if (status === 'success')  return 'accepted'
  if (status === 'failed')   return 'rejected'
  return 'chip'
}

export function Component() {
  const [userType, setUserType] = useState('')
  const [status,   setStatus]   = useState('')
  const { data, isLoading } = useAdminPayments(
    (userType || status) ? { user_type: userType || undefined, status: status || undefined } : undefined
  )
  const payments = data ?? []
  const total = payments.reduce((sum, p) => sum + (p.status === 'success' ? p.amount : 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Payments</h1>
          {!isLoading && (
            <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">
              {payments.length} records · ₦{total.toLocaleString()} collected
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={userType} onChange={(e) => setUserType(e.target.value)}
          className="px-3 py-2 border-2 border-[var(--color-border)] rounded-[var(--radius-md)] text-[14px] bg-white text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-cyan)]">
          <option value="">All user types</option>
          <option value="employer">Employer</option>
          <option value="trainer">Trainer</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border-2 border-[var(--color-border)] rounded-[var(--radius-md)] text-[14px] bg-white text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-cyan)]">
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments" description="Payments will appear here once transactions are made." />
      ) : (
        <div className="overflow-x-auto bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)]">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                {['ID', 'Amount', 'Status', 'User ID', 'Reference', 'Date'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p: Payment, i) => (
                <tr key={p.id} className={cn('hover:bg-[var(--color-bg-secondary)] transition-colors', i < payments.length - 1 && 'border-b border-[var(--color-border)]')}>
                  <td className="px-5 py-4 text-[13px] text-[var(--color-text-tertiary)]">#{p.id}</td>
                  <td className="px-5 py-4 text-[14px] font-[600] text-[var(--color-text-primary)]">
                    ₦{p.amount.toLocaleString()} <span className="text-[12px] font-[400] text-[var(--color-text-tertiary)]">{p.currency}</span>
                  </td>
                  <td className="px-5 py-4"><Badge variant={statusVariant(p.status)}>{p.status}</Badge></td>
                  <td className="px-5 py-4 text-[13px] text-[var(--color-text-secondary)]">{p.user_id}</td>
                  <td className="px-5 py-4 text-[12px] text-[var(--color-text-tertiary)] font-mono">{p.payment_intent_id}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--color-text-tertiary)]">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
