import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = [
  {
    title: 'Getting started',
    items: [
      { q: 'What is Climbr?', a: 'Climbr is a career platform that connects talent with employers and trainers across Africa. You can discover jobs, swipe through opportunities, apply with one tap, and track every application in one place.' },
      { q: 'Is Climbr free for job seekers?', a: 'Yes — completely free for talent. Create a profile, apply to jobs, and enroll in trainings at no cost.' },
      { q: 'How do I create an account?', a: 'Click "Sign up", choose your role (Talent, Employer, or Trainer), fill in your details, and verify your email. It takes under 2 minutes.' },
    ],
  },
  {
    title: 'For Talent',
    items: [
      { q: 'How does job matching work?', a: 'Climbr matches jobs to your profile based on your skills, experience level, location preference, and job type. The more complete your profile, the better the matches.' },
      { q: 'Can I apply via mobile?', a: 'Yes — Climbr has a mobile app available on iOS and Android with full application management.' },
      { q: 'What is the Discover feature?', a: 'Discover lets you swipe through job and training cards like a deck. Swipe right to save, left to skip. It\'s the fastest way to find opportunities that fit.' },
    ],
  },
  {
    title: 'For Employers',
    items: [
      { q: 'How much does it cost to post a job?', a: 'You get one free job post to start. After that, credit packages are available — see our pricing page for details.' },
      { q: 'How do I review applicants?', a: 'Your employer dashboard shows all applicants per job listing. You can filter by status, view full profiles, and update application statuses directly.' },
      { q: 'Can I promote my job listings?', a: 'Yes — Pro plan listings receive featured placement and appear at the top of search results and recommendations.' },
    ],
  },
  {
    title: 'For Trainers',
    items: [
      { q: 'How do I list a training?', a: 'After verifying your trainer account, go to your dashboard and click "Post a Training". Fill in the basics, curriculum, schedule, and pricing.' },
      { q: 'How are payments handled?', a: 'Climbr integrates with Paystack for secure payment processing. Earnings are transferred to your linked bank account on a rolling basis.' },
      { q: 'Can I offer free trainings?', a: 'Yes — you can set the training cost to ₦0 for free enrollment.' },
    ],
  },
]

export function Component() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[14px] font-[700]">Climbr</Link>
          <div className="flex items-center gap-4 text-[14px] font-[500] text-[var(--color-text-secondary)]">
            <Link to="/login" className="hover:text-[var(--color-text-primary)]">Log in</Link>
            <Link to="/signup" className="px-4 py-2 rounded-full bg-[var(--color-brand-cyan)] text-white font-[700]">Sign up</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 px-5 text-center border-b border-[var(--color-border)]">
        <h1 className="text-[40px] font-[700] text-[var(--color-brand-navy)] mb-3">Frequently Asked Questions</h1>
        <p className="text-[16px] text-[var(--color-text-secondary)] max-w-md mx-auto">
          Can't find what you're looking for? <Link to="/contact" className="text-[var(--color-brand-cyan)] hover:underline">Contact us</Link>.
        </p>
      </section>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto px-5 py-16 space-y-10">
        {categories.map((cat) => (
          <div key={cat.title}>
            <h2 className="text-[20px] font-[700] text-[var(--color-brand-navy)] mb-4">{cat.title}</h2>
            <div className="space-y-2">
              {cat.items.map(({ q, a }) => {
                const key = `${cat.title}::${q}`
                const isOpen = open === key
                return (
                  <div
                    key={key}
                    className={cn(
                      'rounded-[var(--radius-lg)] border-2 overflow-hidden transition-all',
                      isOpen ? 'border-[var(--color-brand-cyan)]' : 'border-[var(--color-border)]'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : key)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <span className="text-[15px] font-[600] text-[var(--color-text-primary)] pr-4">{q}</span>
                      {isOpen
                        ? <Minus className="w-4 h-4 text-[var(--color-brand-cyan)] shrink-0" />
                        : <Plus  className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
                      }
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5">
                        <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">{a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <footer className="py-6 px-5 border-t border-[var(--color-border)] text-center text-[13px] text-[var(--color-text-tertiary)]">
        © Climbr 2025 ·{' '}
        <Link to="/privacy" className="hover:underline">Privacy</Link> ·{' '}
        <Link to="/terms" className="hover:underline">Terms</Link>
      </footer>
    </div>
  )
}
