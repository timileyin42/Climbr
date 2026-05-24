import { Link } from 'react-router-dom'
import { Users, ClipboardList, TrendingUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stats = [
  { value: '5,000+', label: 'Learners enrolled' },
  { value: '200+', label: 'Active trainers' },
  { value: '4.8★', label: 'Average rating' },
]

const features = [
  { icon: Users,         title: 'Student Discovery',        desc: 'Your trainings appear in personalised recommendations for thousands of job-seekers actively looking to upskill.' },
  { icon: ClipboardList, title: 'Enrollment Management',    desc: 'View, approve, or reject applicants from a single dashboard. Filter by status and export your roster anytime.' },
  { icon: TrendingUp,    title: 'Earnings Dashboard',       desc: 'Real-time revenue tracking, payout history, and performance insights so you know exactly how your trainings are doing.' },
]

const starter = ['1 active training listing', 'Up to 30 enrollments', 'Basic analytics', 'Standard support']
const pro     = ['Unlimited trainings', 'Featured placement', 'Advanced earnings analytics', 'Priority support', 'Enrollment export (CSV)']

export function Component() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[14px] font-[700]">
              Climbr
            </Link>
            <div className="hidden md:flex items-center gap-6 text-[14px] font-[500] text-[var(--color-text-secondary)]">
              <Link to="/for-employers" className="hover:text-[var(--color-text-primary)]">For Employers</Link>
              <Link to="/" className="hover:text-[var(--color-text-primary)]">For Talent</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="outline" className="hidden sm:flex">Log in</Button></Link>
            <Link to="/signup?role=trainer"><Button variant="dark">List a training</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[var(--color-brand-yellow)] px-5 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[40px] md:text-[56px] font-[700] text-[var(--color-brand-navy)] leading-[1.05] mb-4">
            Share your expertise.<br />Grow your students.
          </h1>
          <p className="text-[var(--color-brand-navy)]/70 text-[17px] mb-10 max-w-xl mx-auto">
            List your trainings, reach thousands of motivated learners, and build your training business on Climbr.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup?role=trainer"><Button variant="dark" className="px-8 py-3 text-[15px]">List your first training</Button></Link>
            <Link to="/faq"><Button variant="outline" className="px-8 py-3 text-[15px]">See how it works</Button></Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-5 border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-[48px] font-[800] text-[var(--color-brand-yellow)]">{s.value}</p>
              <p className="text-[15px] text-[var(--color-text-secondary)]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-[var(--color-brand-yellow)] px-5 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[32px] font-[700] text-[var(--color-brand-navy)] text-center mb-12">Everything a trainer needs.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[rgba(0,0,0,0.08)] rounded-[var(--radius-xl)] p-6">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[var(--color-brand-yellow)]" />
                </div>
                <h3 className="text-[18px] font-[700] text-[var(--color-brand-navy)] mb-2">{title}</h3>
                <p className="text-[var(--color-brand-navy)]/65 text-[14px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[32px] font-[700] text-[var(--color-brand-navy)] text-center mb-4">Simple, transparent pricing.</h2>
          <p className="text-[var(--color-text-secondary)] text-center mb-12">Start free. Scale when your students do.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
              <p className="text-[14px] font-[600] text-[var(--color-text-secondary)] mb-1">Starter</p>
              <p className="text-[36px] font-[800] text-[var(--color-brand-navy)] mb-1">Free</p>
              <p className="text-[13px] text-[var(--color-text-tertiary)] mb-6">No credit card needed.</p>
              <ul className="space-y-3 mb-6">
                {starter.map((f) => <li key={f} className="flex items-center gap-2 text-[14px] text-[var(--color-text-secondary)]"><Check className="w-4 h-4 text-[var(--color-brand-yellow)] shrink-0" />{f}</li>)}
              </ul>
              <Link to="/signup?role=trainer"><Button variant="outline" className="w-full">Get started free</Button></Link>
            </div>
            <div className="border-2 border-[var(--color-brand-yellow)] rounded-[var(--radius-xl)] p-6 relative">
              <span className="absolute -top-3 left-6 bg-[var(--color-brand-yellow)] text-[var(--color-brand-navy)] text-[11px] font-[700] px-3 py-1 rounded-full">Most popular</span>
              <p className="text-[14px] font-[600] text-[var(--color-text-secondary)] mb-1">Pro</p>
              <p className="text-[36px] font-[800] text-[var(--color-brand-navy)] mb-1">₦20k<span className="text-[18px] font-[500]">/mo</span></p>
              <p className="text-[13px] text-[var(--color-text-tertiary)] mb-6">Cancel anytime.</p>
              <ul className="space-y-3 mb-6">
                {pro.map((f) => <li key={f} className="flex items-center gap-2 text-[14px] text-[var(--color-text-secondary)]"><Check className="w-4 h-4 text-[var(--color-brand-yellow)] shrink-0" />{f}</li>)}
              </ul>
              <Link to="/signup?role=trainer"><Button variant="dark" className="w-full">Start Pro</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-brand-navy)] px-5 py-20 text-center">
        <h2 className="text-[32px] font-[700] text-white mb-3">Ready to reach more learners?</h2>
        <p className="text-white/60 mb-8">List your first training free. No credit card required.</p>
        <Link to="/signup?role=trainer">
          <Button style={{ background: 'var(--color-brand-yellow)', color: 'var(--color-brand-navy)' }} className="px-10 py-3 text-[15px] font-[700]">List a training — free</Button>
        </Link>
      </section>

      <footer className="py-6 px-5 border-t border-[var(--color-border)] text-center text-[13px] text-[var(--color-text-tertiary)]">
        © Climbr 2025 ·{' '}
        <Link to="/privacy" className="hover:underline">Privacy</Link> ·{' '}
        <Link to="/terms" className="hover:underline">Terms</Link>
      </footer>
    </div>
  )
}
