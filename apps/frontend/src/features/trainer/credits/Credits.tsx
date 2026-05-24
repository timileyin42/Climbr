import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/feedback/Skeleton'
import {
  useTrainerInfo,
  useTrainerCredits,
  usePurchaseTrainerCredits,
  useConfirmTrainerPayment,
} from '@/lib/api/queries/useTrainer'

export function Component() {
  const [ref, setRef] = useState('')
  const { data: creditsData, isLoading: loadingCredits } = useTrainerCredits()
  const { data: infoData,    isLoading: loadingInfo    } = useTrainerInfo()
  const purchase = usePurchaseTrainerCredits()
  const confirm  = useConfirmTrainerPayment()

  const credits = creditsData?.training_credits ?? 0

  function handlePurchase(packageId: number) {
    purchase.mutate(packageId, {
      onSuccess: (data) => window.open(data.authorization_url, '_blank'),
    })
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Credits</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">Each credit lets you post one training programme.</p>
      </div>

      {/* Balance card */}
      <div className="rounded-[var(--radius-xl)] p-6 flex items-center gap-5" style={{ background: 'var(--color-brand-yellow)' }}>
        <div className="w-14 h-14 rounded-full bg-black/10 flex items-center justify-center shrink-0">
          <CreditCard className="w-7 h-7" style={{ color: 'var(--color-brand-navy)' }} />
        </div>
        <div>
          {loadingCredits ? (
            <div className="h-9 w-16 rounded bg-black/10 animate-pulse" />
          ) : (
            <p className="text-[40px] font-[800] leading-none" style={{ color: 'var(--color-brand-navy)' }}>{credits}</p>
          )}
          <p className="text-[var(--color-brand-navy)]/60 text-[14px] mt-1">training credit{credits !== 1 ? 's' : ''} remaining</p>
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
                className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 flex flex-col transition-colors"
                style={{ ['--hover-border' as string]: 'var(--color-brand-yellow)' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand-yellow)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              >
                <p className="text-[16px] font-[700] text-[var(--color-text-primary)] capitalize">{pkg.plan}</p>
                <p className="text-[30px] font-[800] leading-none mt-2" style={{ color: 'var(--color-brand-navy)' }}>
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
                  style={{ background: 'var(--color-brand-yellow)', color: 'var(--color-brand-navy)' }}
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
            style={{ background: 'var(--color-brand-yellow)', color: 'var(--color-brand-navy)' }}
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
