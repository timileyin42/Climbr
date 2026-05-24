import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/feedback/Skeleton'
import {
  useEmployerInfo,
  useEmployerCredits,
  usePurchaseCredits,
  useConfirmPayment,
} from '@/lib/api/queries/useEmployer'

export function Component() {
  const [ref, setRef] = useState('')
  const { data: creditsData, isLoading: loadingCredits } = useEmployerCredits()
  const { data: infoData,    isLoading: loadingInfo    } = useEmployerInfo()
  const purchase = usePurchaseCredits()
  const confirm  = useConfirmPayment()

  const credits = creditsData?.job_credits ?? 0

  function handlePurchase(packageId: number) {
    purchase.mutate(packageId, {
      onSuccess: (data) => window.open(data.authorization_url, '_blank'),
    })
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Credits</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">Each credit lets you post one job listing.</p>
      </div>

      {/* Balance card */}
      <div className="bg-[var(--color-brand-orange)] rounded-[var(--radius-xl)] p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <CreditCard className="w-7 h-7 text-white" />
        </div>
        <div>
          {loadingCredits ? (
            <div className="h-9 w-16 rounded bg-white/20 animate-pulse" />
          ) : (
            <p className="text-[40px] font-[800] text-white leading-none">{credits}</p>
          )}
          <p className="text-white/70 text-[14px] mt-1">job credit{credits !== 1 ? 's' : ''} remaining</p>
        </div>
      </div>

      {/* Packages */}
      <div>
        <h2 className="text-[18px] font-[700] text-[var(--color-text-primary)] mb-4">Buy credits</h2>
        {loadingInfo ? (
          <div className="grid sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-44 rounded-[var(--radius-xl)]" />)}
          </div>
        ) : (infoData?.pricing ?? []).length === 0 ? (
          <p className="text-[14px] text-[var(--color-text-secondary)]">No packages available right now.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {(infoData?.pricing ?? []).map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white border-2 border-[var(--color-border)] hover:border-[var(--color-brand-orange)] transition-colors rounded-[var(--radius-xl)] p-5 flex flex-col"
              >
                <p className="text-[16px] font-[700] text-[var(--color-text-primary)] capitalize">{pkg.plan}</p>
                <p className="text-[30px] font-[800] text-[var(--color-brand-orange)] mt-2 leading-none">
                  ₦{pkg.price.toLocaleString()}
                </p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-1.5">
                  {pkg.quantity} credit{pkg.quantity !== 1 ? 's' : ''}
                </p>
                {pkg.description && (
                  <p className="text-[12px] text-[var(--color-text-tertiary)] mt-2 flex-1">{pkg.description}</p>
                )}
                <Button
                  className="mt-4"
                  style={{ background: 'var(--color-brand-orange)' }}
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchase.isPending}
                >
                  {purchase.isPending ? 'Opening…' : 'Buy now'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm payment */}
      <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
        <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)] mb-1">Already paid?</h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">
          Enter the Paystack reference from your confirmation email to apply the credits.
        </p>
        <div className="flex gap-3">
          <Input
            placeholder="e.g. trx_abc123"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            className="flex-1"
          />
          <Button
            style={{ background: 'var(--color-brand-orange)' }}
            onClick={() => confirm.mutate(ref, { onSuccess: () => setRef('') })}
            disabled={!ref.trim() || confirm.isPending}
          >
            {confirm.isPending ? 'Checking…' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  )
}
