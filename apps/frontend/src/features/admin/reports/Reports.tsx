import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api/endpoints/admin'

const REPORT_TYPES = [
  { key: 'talents',   label: 'Talents',   description: 'All registered talent accounts' },
  { key: 'employers', label: 'Employers', description: 'All employer accounts with job stats' },
  { key: 'trainers',  label: 'Trainers',  description: 'All trainer accounts with training stats' },
  { key: 'jobs',      label: 'Jobs',      description: 'All job listings with applicant counts' },
  { key: 'trainings', label: 'Trainings', description: 'All training listings with enrolment counts' },
  { key: 'payments',  label: 'Payments',  description: 'Full payment history with amounts and status' },
] as const

type ReportType = typeof REPORT_TYPES[number]['key']

export function Component() {
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')
  const [format,    setFormat]    = useState<'csv' | 'excel' | 'pdf'>('csv')
  const [loading,   setLoading]   = useState<ReportType | null>(null)

  async function download(type: ReportType) {
    setLoading(type)
    try {
      const blob = await adminApi.downloadReport(
        type,
        format,
        startDate || undefined,
        endDate   || undefined
      )
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `climbr_${type}_report.${format === 'excel' ? 'xlsx' : format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded')
    } catch {
      toast.error('Failed to download report')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-[28px] font-[700] text-[var(--color-text-primary)]">Reports</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">Download platform data as CSV, Excel, or PDF.</p>
      </div>

      {/* Options */}
      <div className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 space-y-4">
        <h2 className="text-[15px] font-[700] text-[var(--color-text-primary)]">Report options</h2>
        <div className="grid grid-cols-3 gap-3">
          {(['csv', 'excel', 'pdf'] as const).map((f) => (
            <label key={f} className="cursor-pointer">
              <input type="radio" value={f} checked={format === f} onChange={() => setFormat(f)} className="sr-only" />
              <div className={`px-4 py-2.5 rounded-[var(--radius-md)] border-2 text-[13px] font-[600] text-center uppercase transition-all ${
                format === f
                  ? 'border-[var(--color-brand-cyan)] bg-[var(--color-brand-cyan-soft)] text-[var(--color-brand-cyan)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-cyan)]/40'
              }`}>{f}</div>
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-[600] text-[var(--color-text-secondary)] mb-1">Start date</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-[12px] font-[600] text-[var(--color-text-secondary)] mb-1">End date</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Report cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {REPORT_TYPES.map(({ key, label, description }) => (
          <div key={key} className="bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-[700] text-[var(--color-text-primary)]">{label}</p>
              <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">{description}</p>
            </div>
            <Button
              size="sm"
              style={{ background: 'var(--color-brand-cyan)' }}
              onClick={() => download(key)}
              disabled={loading === key}
              className="shrink-0"
            >
              {loading === key ? '…' : <Download className="w-4 h-4" />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
