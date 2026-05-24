import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

/* ── Data ──────────────────────────────────────────────────────────────────── */
const companies = ['Adobe', 'Google', 'Slack', 'Miro', 'Salesforce', 'Zendesk', 'Stripe', 'Twilio', 'Headspace', 'Feedly', 'PayPal', 'SEMrush']

const testimonials = [
  { name: 'jane', company: 'Miro', quote: '"I applied for two gigs on Climbr and landed one in a week. No stress, no fake promises. It just worked. This is what job hunting should feel like."', bg: 'bg-white', nameColor: 'text-[var(--color-brand-navy)]', textColor: 'text-[var(--color-text-secondary)]' },
  { name: 'Mike', company: 'Google', quote: '"I\'m still a student, but Climbr helped me get into a remote training that actually taught me something useful. Not just theory. I\'m already freelancing with what I learned."', bg: 'bg-white', nameColor: 'text-[var(--color-brand-navy)]', textColor: 'text-[var(--color-text-secondary)]' },
  { name: 'samuel', company: 'Stripe', quote: '"Most job platforms feel like a scam. Climbr felt different. Real roles. Real responses. I even got an email update when a company viewed my profile."', bg: 'bg-[#FFC93C]', nameColor: 'text-[var(--color-brand-navy)]', textColor: 'text-[var(--color-brand-navy)]/70' },
  { name: 'jane', company: 'Dribbble', quote: '"I didn\'t think I had enough experience to apply for anything, but Climbr\'s vibe gave me the confidence to try. Now I\'ve got a paid internship and a clearer path forward."', bg: 'bg-white', nameColor: 'text-[var(--color-brand-navy)]', textColor: 'text-[var(--color-text-secondary)]' },
]

const faqs = [
  { q: 'Is Climbr free to use?', a: 'Yes. You can sign up, create your profile, and apply — without paying anything.' },
  { q: 'Do I need a CV to apply?', a: 'No. Your Climbr profile is your CV. Fill in your skills, experience and education once — it follows you everywhere.' },
  { q: 'Can I apply to more than one job or training?', a: 'Yes, as many as you like. Track every application from one place.' },
  { q: 'What kind of jobs are on Climbr?', a: 'Entry-level to mid-level roles across tech, design, marketing, finance and more. Every listing is posted by a verified employer.' },
  { q: 'Will I get notified when something changes?', a: 'Yes. Push and email notifications keep you updated when your application status changes.' },
  { q: 'Can I apply if I\'m still in school?', a: 'Absolutely. Many listings are specifically targeting students and fresh graduates.' },
]

function ArrowDoodle() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="inline-block ml-1 align-middle -mt-2">
      <path d="M8 56 L44 16" stroke="#FF8A3D" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 16 L28 15" stroke="#FF8A3D" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 16 L45 32" stroke="#FF8A3D" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 64 L48 28" stroke="#FF8A3D" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M24 68 L54 38" stroke="#FF8A3D" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    </svg>
  )
}

function PhoneMockup() {
  return (
    <div className="w-52 h-[420px] rounded-[40px] bg-black shadow-2xl mx-auto relative overflow-hidden border-[5px] border-gray-800">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 rounded-full bg-gray-700" />
    </div>
  )
}

function Asterisk() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      {[0, 30, 60, 90, 120, 150].map((deg) => (
        <line key={deg} x1="26" y1="3" x2="26" y2="49" stroke="white" strokeWidth="3.5" strokeLinecap="round"
          transform={`rotate(${deg} 26 26)`} />
      ))}
    </svg>
  )
}

export function Component() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif] overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between h-16 px-6 md:px-10">
        <a href="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[15px] font-[700] tracking-tight">
          Climbr
        </a>
        <div className="hidden md:flex items-center gap-6 text-[14px] font-[500] text-[var(--color-brand-navy)]">
          <a href="/jobs" className="hover:opacity-70 transition-opacity">Who's hiring</a>
          <a href="/jobs" className="hover:opacity-70 transition-opacity">Job roles</a>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden md:flex items-center gap-1 border border-[var(--color-brand-navy)] rounded-full px-3 py-1.5 text-[13px] font-[500]">
            Talents <span className="text-[10px]">▾</span>
          </button>
          <a href="/signup" className="inline-flex items-center h-9 px-5 rounded-full border border-[var(--color-brand-navy)] text-[var(--color-brand-navy)] text-[13px] font-[600] hover:bg-gray-50 transition-colors">
            Sign up
          </a>
          <a href="/login" className="inline-flex items-center h-9 px-5 rounded-full bg-[var(--color-brand-navy)] text-white text-[13px] font-[600] hover:opacity-90 transition-opacity">
            Log in
          </a>
        </div>
      </nav>

      {/* ── Hero (full cyan bg) ───────────────────────────────────────────────── */}
      <section className="relative bg-[var(--color-brand-cyan)] text-white overflow-hidden pt-24">
        <div className="relative z-10 text-center px-6 md:px-12 pt-16 pb-16">
          <h1 className="text-[52px] md:text-[72px] font-[700] leading-[1.0] tracking-tight">
            Your future
            <br />
            starts here.
            <ArrowDoodle />
          </h1>
          <p className="text-white/80 text-[16px] md:text-[18px] mt-6 mb-10 max-w-md mx-auto leading-[1.5]">
            Find your first, second, and third job on the career network built just for you
          </p>
          {/* Email bar */}
          <div className="flex items-center max-w-sm mx-auto bg-white rounded-full overflow-hidden shadow-lg">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-3.5 text-[14px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
            <a href={`/signup?email=${encodeURIComponent(email)}`}
              className="shrink-0 m-1 inline-flex items-center h-10 px-5 rounded-full bg-[var(--color-brand-orange)] text-white text-[13px] font-[600] hover:opacity-90 transition-opacity">
              Sign up
            </a>
          </div>
        </div>
        {/* White wave */}
        <div className="relative h-20 overflow-hidden">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0 80 C480 0 960 0 1440 80 L1440 80 L0 80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── Three pillars ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[32px] md:text-[40px] font-[700] text-[var(--color-brand-navy)] mb-16">
            Create a profile, build your career
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { bg: 'bg-[var(--color-brand-cyan)]', emoji: '💡', label: 'Real', desc: 'The authentic place where students get guidance, inspo, info, and connections straight from the source' },
              { bg: 'bg-[var(--color-brand-navy)]', emoji: '📄', label: 'Relevant', desc: 'Built just for you with personalized content from your school, experts, and 1M companies' },
              { bg: 'bg-[var(--color-brand-navy)]', emoji: '🎯', label: 'Future-focused', desc: 'The career platform you\'ll actually use with jobs, internships, and opportunities you won\'t find anywhere else' },
            ].map(({ bg, emoji, label, desc }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className={`w-28 h-28 rounded-full ${bg} flex items-center justify-center text-[48px] mb-6`}>
                  {emoji}
                </div>
                <h3 className="text-[22px] font-[700] text-[var(--color-brand-navy)] mb-3">{label}</h3>
                <p className="text-[14px] text-[var(--color-text-secondary)] leading-[1.6]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Companies band ───────────────────────────────────────────────────── */}
      <section className="pb-4 px-6 md:px-12 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[28px] md:text-[36px] font-[700] text-[var(--color-brand-navy)] mb-10 text-center">
            These companies and more want to hire people like you
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-5 items-center justify-items-center mb-0">
            {companies.map((co) => (
              <span key={co} className="text-[14px] font-[700] text-[var(--color-text-secondary)] tracking-tight">{co}</span>
            ))}
          </div>
        </div>
        {/* Orange blob */}
        <div className="relative h-28 mt-8 overflow-hidden">
          <svg viewBox="0 0 1440 112" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0 112 C400 40 1040 40 1440 112 L1440 112 L0 112 Z" fill="#FF8A3D" />
          </svg>
        </div>
      </section>

      {/* ── Orange: Inspiring career content ──────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#FF8A3D' }}>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="w-full" preserveAspectRatio="none">
            <path d="M0 120 C360 40 1080 40 1440 120 L1440 120 L0 120 Z" fill="#EC4899" />
          </svg>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-[40px] md:text-[52px] font-[700] text-[var(--color-brand-navy)] leading-[1.1] mb-5">
              Inspiring career content
            </h2>
            <p className="text-[16px] text-[var(--color-brand-navy)]/65 leading-[1.6] mb-10">
              Broaden your search with posts, videos, and articles highlighting career paths you might not have considered.
            </p>
            <h3 className="text-[32px] font-[700] text-[var(--color-brand-navy)] leading-[1.15]">
              Personalized job recs
            </h3>
          </div>
          <div className="relative flex justify-center">
            <div className="absolute -top-4 right-8 z-10"><Asterisk /></div>
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ── Pink+yellow: Connect with trainers ───────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#EC4899' }}>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 1440 160" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="w-full" preserveAspectRatio="none">
            <path d="M-100 160 C300 20 1100 20 1540 160 L1540 160 L-100 160 Z" fill="#FFC93C" />
          </svg>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-[40px] md:text-[52px] font-[700] text-[var(--color-brand-navy)] leading-[1.1] mb-5">
              Connect with trainers &amp; recruiters
            </h2>
            <p className="text-[16px] text-[var(--color-brand-navy)]/65 leading-[1.6]">
              Broaden your search with posts, videos, and articles highlighting career paths you might not have considered
            </p>
          </div>
          <div className="relative flex justify-center">
            <div className="absolute -top-4 right-8 z-10"><Asterisk /></div>
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ── Cyan testimonials ─────────────────────────────────────────────────── */}
      <section className="relative py-16 px-6 md:px-12 bg-[var(--color-brand-cyan)] overflow-hidden">
        {/* Yellow arrow doodles */}
        <svg className="absolute top-6 left-6 opacity-70" width="48" height="64" viewBox="0 0 48 64" fill="none">
          <path d="M16 58 Q24 16 40 8" stroke="#FFC93C" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M40 8 L33 17" stroke="#FFC93C" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M40 8 L44 19" stroke="#FFC93C" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <svg className="absolute top-6 right-6 opacity-70" width="48" height="64" viewBox="0 0 48 64" fill="none">
          <path d="M32 58 Q24 16 8 8" stroke="#FFC93C" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M8 8 L15 17" stroke="#FFC93C" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M8 8 L4 19" stroke="#FFC93C" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map(({ name, company, quote, bg, nameColor, textColor }) => (
            <div key={name} className={`${bg} rounded-[20px] p-6 flex flex-col gap-4`}>
              {/* Avatar placeholder */}
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[28px]">
                {name[0]}
              </div>
              <h3 className={`text-[28px] font-[700] ${nameColor}`}>{name}</h3>
              <p className={`text-[14px] leading-[1.6] ${textColor} flex-1`}>{quote}</p>
              <p className={`text-[13px] font-[600] ${textColor} opacity-60`}>{company}</p>
            </div>
          ))}
        </div>

        {/* Wave to white */}
        <div className="relative h-16 mt-12 overflow-hidden">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0 0 C480 64 960 64 1440 0 L1440 64 L0 64 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── Role cards ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 md:px-12 bg-[var(--color-brand-navy)]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            { role: 'Talents', headline: 'Find your next job', bg: 'bg-[var(--color-brand-cyan)]', href: '/signup?role=talent' },
            { role: 'Employers', headline: 'Hire top talent', bg: 'bg-[#183040]', href: '/signup?role=employer' },
            { role: 'Trainers', headline: 'Train the next talents', bg: 'bg-[#183040]', href: '/signup?role=trainer' },
          ].map(({ role, headline, bg, href }) => (
            <a key={role} href={href}
              className={`${bg} rounded-[20px] p-6 min-h-[180px] flex flex-col justify-between hover:opacity-90 transition-opacity`}>
              <span className="text-[13px] font-[500] text-white/60">{role}</span>
              <h3 className="text-[24px] font-[700] text-white leading-[1.2]">{headline}</h3>
            </a>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[36px] font-[700] text-[var(--color-brand-navy)] text-center mb-3">
            Frequently asked questions
          </h2>
          <p className="text-center text-[var(--color-text-secondary)] mb-12">
            Everything you need to know about the product and billing.
          </p>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div key={q} className="rounded-[16px] overflow-hidden transition-all"
                style={openFaq === i ? {
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(white,white),linear-gradient(135deg,#0CC0DF,#FF8A3D,#FFC93C,#EC4899,#7C5CFF,#0CC0DF)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box,border-box',
                } : { border: '1.5px solid var(--color-border)' }}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-[var(--color-bg-secondary)] transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-[16px] font-[600] text-[var(--color-brand-navy)]">{q}</span>
                  {openFaq === i
                    ? <Minus className="w-5 h-5 text-[var(--color-text-secondary)] shrink-0" />
                    : <Plus className="w-5 h-5 text-[var(--color-text-secondary)] shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 bg-white">
                    <p className="text-[15px] text-[var(--color-text-secondary)] leading-[1.65]">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Launch CTA ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 bg-[var(--color-brand-cyan)] text-white text-center">
        <h2 className="text-[40px] font-[700] mb-4 leading-[1.1]">Launch your career</h2>
        <p className="text-white/80 text-[16px] mb-10">
          Sign up to Climbr and never miss a message, training or job
        </p>
        <div className="flex items-center max-w-sm mx-auto bg-white rounded-full overflow-hidden shadow-lg">
          <input type="email" placeholder="Type email here"
            className="flex-1 px-5 py-3.5 text-[14px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]" />
          <a href="/signup"
            className="shrink-0 m-1 inline-flex items-center h-10 px-5 rounded-full bg-[var(--color-brand-orange)] text-white text-[13px] font-[600] hover:opacity-90 transition-opacity">
            Sign up
          </a>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="bg-[var(--color-brand-navy)] px-6 md:px-12 pt-14 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-1">
              <span className="text-[18px] font-[700] text-[var(--color-brand-cyan)]">Climbr</span>
              <p className="text-[13px] text-white/50 mt-3 leading-[1.6] max-w-[200px]">
                The career platform built for young African talent.
              </p>
            </div>
            {[
              { head: 'STUDENTS', links: ['How it works', "Who's hiring", 'Career tips', 'Job roles'] },
              { head: 'EMPLOYERS', links: ['Solutions', 'Resources', 'Pricing'] },
              { head: 'TRAINERS', links: ['Solutions', 'Resources', 'Blog', 'Pricing'] },
              { head: 'COMPANY', links: ['About', 'Blog', 'Contact us', 'Privacy policies'] },
            ].map(({ head, links }) => (
              <div key={head}>
                <p className="text-[11px] font-[600] text-white/40 uppercase tracking-widest mb-4">{head}</p>
                <ul className="space-y-3">
                  {links.map((l) => (
                    <li key={l}><a href="#" className="text-[14px] text-white/60 hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[13px] text-white/30">© 2025 Climbr. All rights reserved</p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Facebook" className="text-white/40 hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-white/40 hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
