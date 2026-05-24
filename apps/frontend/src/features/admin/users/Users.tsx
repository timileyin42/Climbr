import { useState } from 'react'
import { Search, UserX, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Users as UsersIcon } from 'lucide-react'
import {
  useAdminTalents, useAdminEmployers, useAdminTrainers,
  useAdminTalentAction, useAdminEmployerAction, useAdminTrainerAction,
} from '@/lib/api/queries/useAdmin'
import type { AdminTalent, AdminEmployer, AdminTrainer } from '@/lib/api/endpoints/admin'
import { cn } from '@/lib/utils'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Talents ───────────────────────────────────────────────────────────────────

function TalentsTab() {
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState('')
  const { data, isLoading } = useAdminTalents(applied ? { name: applied } : undefined)
  const action = useAdminTalentAction()
  const rows = data ?? []

  function confirm(id: number, a: 'disable' | 'delete') {
    const msg = a === 'delete' ? 'Permanently delete this talent?' : 'Disable this account?'
    if (window.confirm(msg)) action.mutate({ id, action: a })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Button variant="outline" onClick={() => setApplied(search)}><Search className="w-4 h-4" /></Button>
        {applied && <Button variant="ghost" onClick={() => { setSearch(''); setApplied('') }}>Clear</Button>}
      </div>
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No talents found" description="Try a different search." />
      ) : (
        <UserTable
          headers={['Name', 'Email', 'Status', 'Joined', 'Actions']}
          rows={rows.map((t: AdminTalent) => ({
            id: t.id, name: `${t.first_name} ${t.last_name}`, email: t.email,
            active: t.is_active, joined: t.created_at,
          }))}
          onAction={confirm}
          loading={action.isPending}
        />
      )}
    </div>
  )
}

// ── Employers ─────────────────────────────────────────────────────────────────

function EmployersTab() {
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState('')
  const { data, isLoading } = useAdminEmployers(applied ? { name: applied } : undefined)
  const action = useAdminEmployerAction()
  const rows = data ?? []

  function confirm(id: number, a: 'disable' | 'delete') {
    if (window.confirm(a === 'delete' ? 'Permanently delete this employer?' : 'Disable this account?'))
      action.mutate({ id, action: a })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Search by company…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Button variant="outline" onClick={() => setApplied(search)}><Search className="w-4 h-4" /></Button>
        {applied && <Button variant="ghost" onClick={() => { setSearch(''); setApplied('') }}>Clear</Button>}
      </div>
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No employers found" description="Try a different search." />
      ) : (
        <div className="overflow-x-auto bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)]">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                {['Company', 'Email', 'Status', 'Jobs', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((e: AdminEmployer, i) => (
                <tr key={e.id} className={cn('hover:bg-[var(--color-bg-secondary)] transition-colors', i < rows.length - 1 && 'border-b border-[var(--color-border)]')}>
                  <td className="px-5 py-4 text-[14px] font-[600] text-[var(--color-text-primary)]">{e.company_name}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--color-text-secondary)]">{e.email}</td>
                  <td className="px-5 py-4"><Badge variant={e.is_active ? 'accepted' : 'rejected'}>{e.is_active ? 'active' : 'disabled'}</Badge></td>
                  <td className="px-5 py-4 text-[14px] text-[var(--color-text-secondary)]">{e.job_count}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--color-text-tertiary)]">{formatDate(e.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => confirm(e.id, 'disable')} disabled={action.isPending}><UserX className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => confirm(e.id, 'delete')} disabled={action.isPending}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Trainers ──────────────────────────────────────────────────────────────────

function TrainersTab() {
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState('')
  const { data, isLoading } = useAdminTrainers(applied ? { name: applied } : undefined)
  const action = useAdminTrainerAction()
  const rows = data ?? []

  function confirm(id: number, a: 'disable' | 'delete') {
    if (window.confirm(a === 'delete' ? 'Permanently delete this trainer?' : 'Disable this account?'))
      action.mutate({ id, action: a })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Button variant="outline" onClick={() => setApplied(search)}><Search className="w-4 h-4" /></Button>
        {applied && <Button variant="ghost" onClick={() => { setSearch(''); setApplied('') }}>Clear</Button>}
      </div>
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No trainers found" description="Try a different search." />
      ) : (
        <div className="overflow-x-auto bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)]">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                {['Provider', 'Email', 'Status', 'Trainings', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t: AdminTrainer, i) => (
                <tr key={t.id} className={cn('hover:bg-[var(--color-bg-secondary)] transition-colors', i < rows.length - 1 && 'border-b border-[var(--color-border)]')}>
                  <td className="px-5 py-4 text-[14px] font-[600] text-[var(--color-text-primary)]">{t.provider_name}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--color-text-secondary)]">{t.email}</td>
                  <td className="px-5 py-4"><Badge variant={t.is_active ? 'accepted' : 'rejected'}>{t.is_active ? 'active' : 'disabled'}</Badge></td>
                  <td className="px-5 py-4 text-[14px] text-[var(--color-text-secondary)]">{t.training_count}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--color-text-tertiary)]">{formatDate(t.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => confirm(t.id, 'disable')} disabled={action.isPending}><UserX className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => confirm(t.id, 'delete')} disabled={action.isPending}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Shared table for Talents ───────────────────────────────────────────────────

function UserTable({ headers, rows, onAction, loading }: {
  headers: string[]
  rows: { id: number; name: string; email: string; active: boolean; joined: string }[]
  onAction: (id: number, action: 'disable' | 'delete') => void
  loading: boolean
}) {
  return (
    <div className="overflow-x-auto bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-lg)]">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            {headers.map((h) => (
              <th key={h} className="px-5 py-3 text-left text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={cn('hover:bg-[var(--color-bg-secondary)] transition-colors', i < rows.length - 1 && 'border-b border-[var(--color-border)]')}>
              <td className="px-5 py-4 text-[14px] font-[600] text-[var(--color-text-primary)]">{r.name}</td>
              <td className="px-5 py-4 text-[13px] text-[var(--color-text-secondary)]">{r.email}</td>
              <td className="px-5 py-4"><Badge variant={r.active ? 'accepted' : 'rejected'}>{r.active ? 'active' : 'disabled'}</Badge></td>
              <td className="px-5 py-4 text-[13px] text-[var(--color-text-tertiary)]">{formatDate(r.joined)}</td>
              <td className="px-5 py-4">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onAction(r.id, 'disable')} disabled={loading}><UserX className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => onAction(r.id, 'delete')} disabled={loading}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Tab = 'talents' | 'employers' | 'trainers'
const tabs: { key: Tab; label: string }[] = [
  { key: 'talents',   label: 'Talents' },
  { key: 'employers', label: 'Employers' },
  { key: 'trainers',  label: 'Trainers' },
]

export function Component() {
  const [tab, setTab] = useState<Tab>('talents')

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Users</h1>

      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {tabs.map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={cn('px-5 py-3 text-[14px] font-[600] border-b-2 -mb-px transition-all',
              tab === key
                ? 'border-[var(--color-brand-cyan)] text-[var(--color-brand-cyan)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'talents'   && <TalentsTab />}
      {tab === 'employers' && <EmployersTab />}
      {tab === 'trainers'  && <TrainersTab />}
    </div>
  )
}
