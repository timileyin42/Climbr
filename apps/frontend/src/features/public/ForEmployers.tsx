import { Link } from 'react-router-dom'
import { Target, ShieldCheck, BarChart2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stats = [
  { value: '10,000+', label: 'Talent profiles' },
  { value: '48h', label: 'Average time-to-match' },
  { value: '94%', label: 'Employer satisfaction' },
]

const features = [
  { icon: Target,      title: 'Smart Matching',       desc: 'AI-powered matching surfaces candidates that fit your exact requirements — no more sifting through irrelevant CVs.' },
  { icon: ShieldCheck, title: 'Verified Profiles',    desc: 'Every talent profile is email-verified. Skills, education, and work history are submitted by the candidate and visible at a glance.' },
  { icon: BarChart2,   title: 'Applicant Tracking',   desc: 'Move candidates through stages, leave notes, and collaborate with your team — all within your employer dashboard.' },
]

const starter = ['1 active job post', 'Up to 50 applicants per listing', 'Basic analytics', 'Standard support']
const pro     = ['Unlimited job posts', 'Featured placement in search', 'Advanced analytics', 'Priority support', 'Applicant export (CSV)']

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
              <Link to="/for-trainers" className="hover:text-[var(--color-text-primary)]">For Trainers</Link>
              <Link to="/" className="hover:text-[var(--color-text-primary)]">For Talent</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="outline" className="hidden sm:flex">Log in</Button></Link>
            <Link to="/signup?role=employer"><Button style={{ background: 'var(--color-brand-orange)' }} className="text-white">Post a job</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[var(--color-brand-orange)] px-5 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[40px] md:text-[56px] font-[700] text-white leading-[1.05] mb-4">
            Hire smarter.<br />Build your team.
          </h1>
          <p className="text-white/80 text-[17px] mb-10 max-w-xl mx-auto">
            Post jobs, discover verified talent, and make data-driven hiring decisions — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup?role=employer"><Button variant="dark" className="px-8 py-3 text-[15px]">Post your first job</Button></Link>
            <Link to="/faq"><Button variant="outline" className="px-8 py-3 text-[15px] border-white text-white hover:bg-white/10">See how it works</Button></Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-5 border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-[48px] font-[800] text-[var(--color-brand-orange)]">{s.value}</p>
              <p className="text-[15px] text-[var(--color-text-secondary)]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-[var(--color-brand-orange)] px-5 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[32px] font-[700] text-white text-center mb-12">Everything you need to hire right.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[rgba(0,0,0,0.15)] rounded-[var(--radius-xl)] p-6">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[var(--color-brand-orange)]" />
                </div>
                <h3 className="text-[18px] font-[700] text-white mb-2">{title}</h3>
                <p className="text-white/75 text-[14px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[32px] font-[700] text-[var(--color-brand-navy)] text-center mb-4">Simple, transparent pricing.</h2>
          <p className="text-[var(--color-text-secondary)] text-center mb-12">No hidden fees. Start free, upgrade when ready.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Starter */}
            <div className="border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
              <p className="text-[14px] font-[600] text-[var(--color-text-secondary)] mb-1">Starter</p>
              <p className="text-[36px] font-[800] text-[var(--color-brand-navy)] mb-1">Free</p>
              <p className="text-[13px] text-[var(--color-text-tertiary)] mb-6">Forever. No credit card needed.</p>
              <ul className="space-y-3 mb-6">
                {starter.map((f) => <li key={f} className="flex items-center gap-2 text-[14px] text-[var(--color-text-secondary)]"><Check className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" />{f}</li>)}
              </ul>
              <Link to="/signup?role=employer"><Button variant="outline" className="w-full">Get started free</Button></Link>
            </div>
            {/* Pro */}
            <div className="border-2 border-[var(--color-brand-orange)] rounded-[var(--radius-xl)] p-6 relative">
              <span className="absolute -top-3 left-6 bg-[var(--color-brand-orange)] text-white text-[11px] font-[700] px-3 py-1 rounded-full">Most popular</span>
              <p className="text-[14px] font-[600] text-[var(--color-text-secondary)] mb-1">Pro</p>
              <p className="text-[36px] font-[800] text-[var(--color-brand-navy)] mb-1">₦25k<span className="text-[18px] font-[500]">/mo</span></p>
              <p className="text-[13px] text-[var(--color-text-tertiary)] mb-6">Billed monthly. Cancel anytime.</p>
              <ul className="space-y-3 mb-6">
                {pro.map((f) => <li key={f} className="flex items-center gap-2 text-[14px] text-[var(--color-text-secondary)]"><Check className="w-4 h-4 text-[var(--color-brand-orange)] shrink-0" />{f}</li>)}
              </ul>
              <Link to="/signup?role=employer"><Button className="w-full" style={{ background: 'var(--color-brand-orange)' }}>Start Pro</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-brand-navy)] px-5 py-20 text-center">
        <h2 className="text-[32px] font-[700] text-white mb-3">Ready to find your next hire?</h2>
        <p className="text-white/60 mb-8">It's free to get started. No credit card required.</p>
        <Link to="/signup?role=employer">
          <Button style={{ background: 'var(--color-brand-orange)' }} className="text-white px-10 py-3 text-[15px]">Post a job — it's free</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-6 px-5 border-t border-[var(--color-border)] text-center text-[13px] text-[var(--color-text-tertiary)]">
        © Climbr 2025 ·{' '}
        <Link to="/privacy" className="hover:underline">Privacy</Link> ·{' '}
        <Link to="/terms" className="hover:underline">Terms</Link>
      </footer>
    </div>
  )
}
