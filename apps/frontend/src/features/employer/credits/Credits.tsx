import { useState } from 'react'
import { CreditCard, Zap, Infinity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/feedback/Skeleton'
import {
  useEmployerInfo,
  useEmployerCredits,
  usePurchaseCredits,
  useConfirmPayment,
} from '@/lib/api/queries/useEmployer'
import type { PricingPackage } from '@/lib/api/endpoints/employer'
import { cn } from '@/lib/utils'

const ACCENT = 'var(--color-brand-orange)'

function isUnlimited(pkg: PricingPackage) { return pkg.quantity >= 999 }
function isAnnual(pkg: PricingPackage)    { return pkg.quantity >= 9999 }

function CreditPackCard({ pkg, onBuy, buying }: { pkg: PricingPackage; onBuy: () => void; buying: boolean }) {
  return (
    <div className="bg-white border-2 border-[var(--color-border)] hover:border-[var(--color-brand-orange)] transition-colors rounded-[var(--radius-xl)] p-5 flex flex-col">
      <p className="text-[15px] font-[700] text-[var(--color-text-primary)]">{pkg.plan}</p>
      <div className="flex items-baseline gap-1 mt-3">
        <span className="text-[32px] font-[800]" style={{ color: ACCENT }}>₦{pkg.price.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: ACCENT }} />
        <p className="text-[13px] font-[600] text-[var(--color-text-secondary)]">{pkg.quantity} job credits</p>
      </div>
      {pkg.description && (
        <p className="text-[12px] text-[var(--color-text-tertiary)] mt-2 flex-1">{pkg.description}</p>
      )}
      <Button className="mt-4" style={{ background: ACCENT }} onClick={onBuy} disabled={buying}>
        {buying ? 'Opening…' : 'Buy now'}
      </Button>
    </div>
  )
}

function SubscriptionCard({ pkg, onBuy, buying }: { pkg: PricingPackage; onBuy: () => void; buying: boolean }) {
  const annual = isAnnual(pkg)

  return (
    <div className={cn(
      'relative rounded-[var(--radius-xl)] p-6 flex flex-col border-2 transition-colors',
      annual
        ? 'border-[var(--color-brand-orange)] bg-[var(--color-brand-orange-soft)]'
        : 'border-[var(--color-border)] bg-white hover:border-[var(--color-brand-orange)]'
    )}>
      {annual && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full text-[11px] font-[700] text-white" style={{ background: ACCENT }}>
            BEST VALUE
          </span>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[15px] font-[700] text-[var(--color-text-primary)]">{pkg.plan}</p>
          <span className={cn(
            'inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-[700]',
            annual ? 'text-white' : 'text-[var(--color-brand-orange)]'
          )} style={{ background: annual ? ACCENT : 'var(--color-brand-orange-soft)' }}>
            {annual ? 'ANNUAL' : 'MONTHLY'}
          </span>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: ACCENT }}>
          <Infinity className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-[36px] font-[800]" style={{ color: ACCENT }}>₦{pkg.price.toLocaleString()}</span>
          <span className="text-[14px] text-[var(--color-text-secondary)]">/{annual ? 'yr' : 'mo'}</span>
        </div>
        {annual && (
          <p className="text-[13px] font-[600] mt-1" style={{ color: ACCENT }}>
            Save ₦120,000 · equivalent to 2.4 months free
          </p>
        )}
        {!annual && (
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1">
            ₦480,000/yr on the annual plan
          </p>
        )}
      </div>

      <ul className="mt-4 space-y-1.5 flex-1">
        {['Unlimited job posts', '30-day listing visibility', 'Applicant management', 'Priority support'].map((f) => (
          <li key={f} className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
            <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: ACCENT }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            {f}
          </li>
        ))}
      </ul>

      <Button
        className="mt-5"
        style={{ background: ACCENT }}
        onClick={onBuy}
        disabled={buying}
      >
        {buying ? 'Opening…' : `Get ${annual ? 'Annual' : 'Monthly'} plan`}
      </Button>
    </div>
  )
}

export function Component() {
  const [ref, setRef] = useState('')
  const { data: creditsData, isLoading: loadingCredits } = useEmployerCredits()
  const { data: infoData,    isLoading: loadingInfo    } = useEmployerInfo()
  const purchase = usePurchaseCredits()
  const confirm  = useConfirmPayment()

  const credits  = creditsData?.job_credits ?? 0
  const packages = infoData?.pricing ?? []

  const creditPacks   = packages.filter((p) => !isUnlimited(p))
  const subscriptions = packages.filter((p) => isUnlimited(p))

  function handlePurchase(packageId: number) {
    purchase.mutate(packageId, {
      onSuccess: (data) => window.open(data.authorization_url, '_blank'),
    })
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Credits</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">Each credit lets you post one job listing.</p>
      </div>

      {/* Balance */}
      <div className="bg-[var(--color-brand-orange)] rounded-[var(--radius-xl)] p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <CreditCard className="w-7 h-7 text-white" />
        </div>
        <div>
          {loadingCredits ? (
            <div className="h-9 w-16 rounded bg-white/20 animate-pulse" />
          ) : (
            <p className="text-[40px] font-[800] text-white leading-none">
              {credits >= 999 ? '∞' : credits}
            </p>
          )}
          <p className="text-white/70 text-[14px] mt-1">
            {credits >= 999 ? 'unlimited posts active' : `job credit${credits !== 1 ? 's' : ''} remaining`}
          </p>
        </div>
      </div>

      {loadingInfo ? (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-36 rounded-[var(--radius-xl)]" />)}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-64 rounded-[var(--radius-xl)]" />)}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Credit packs */}
          {creditPacks.length > 0 && (
            <div>
              <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)] mb-3">Credit packs</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {creditPacks.map((pkg) => (
                  <CreditPackCard key={pkg.id} pkg={pkg} onBuy={() => handlePurchase(pkg.id)} buying={purchase.isPending} />
                ))}
              </div>
            </div>
          )}

          {/* Subscriptions */}
          {subscriptions.length > 0 && (
            <div>
              <h2 className="text-[16px] font-[700] text-[var(--color-text-primary)] mb-3">Unlimited plans</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {subscriptions.map((pkg) => (
                  <SubscriptionCard key={pkg.id} pkg={pkg} onBuy={() => handlePurchase(pkg.id)} buying={purchase.isPending} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
            style={{ background: ACCENT }}
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
