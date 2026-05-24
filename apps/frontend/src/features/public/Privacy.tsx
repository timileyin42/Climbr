import { Link } from 'react-router-dom'

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly, such as your name, email address, work history, skills, and profile details when you register or update your account. We also collect usage data such as pages visited, features used, and interaction timestamps to improve our services.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to operate and improve the Climbr platform, personalise job and training recommendations, send transactional and service emails, and communicate product updates. We do not use your data for third-party advertising without your explicit consent.',
  },
  {
    title: '3. Information Sharing',
    body: 'We share your profile information with employers and trainers only when you explicitly apply to a listing. We do not sell your personal data. We may share aggregated, anonymised statistics for research purposes.',
  },
  {
    title: '4. Data Security',
    body: 'We implement industry-standard security measures including TLS encryption for data in transit and encrypted storage at rest. Access to user data is restricted to authorised team members on a need-to-know basis.',
  },
  {
    title: '5. Your Rights',
    body: 'You have the right to access, correct, export, or delete your personal data at any time from your account settings. If you wish to exercise these rights or have concerns, contact us at privacy@climbr.com.',
  },
  {
    title: '6. Cookies',
    body: 'We use essential cookies to keep you logged in and remember your preferences. We may use analytics cookies (with your consent) to understand how the platform is used. You can manage cookie preferences in your browser settings.',
  },
  {
    title: '7. Contact Us',
    body: 'If you have questions about this Privacy Policy, contact our Data Protection team at privacy@climbr.com or write to Climbr, Lagos, Nigeria.',
  },
]

export function Component() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[14px] font-[700]">Climbr</Link>
          <div className="flex items-center gap-4 text-[14px] font-[500] text-[var(--color-text-secondary)]">
            <Link to="/terms" className="hover:text-[var(--color-text-primary)]">Terms</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="text-[36px] font-[700] text-[var(--color-brand-navy)] mb-2">Privacy Policy</h1>
        <p className="text-[13px] text-[var(--color-text-tertiary)] mb-12">Last updated: January 2025</p>

        <p className="text-[15px] text-[var(--color-text-secondary)] mb-10 leading-relaxed">
          At Climbr, we take your privacy seriously. This policy explains what data we collect, how we use it, and your rights as a user. By using Climbr, you agree to the practices described here.
        </p>

        <div className="space-y-10">
          {sections.map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-[20px] font-[700] text-[var(--color-brand-navy)] mb-3">{title}</h2>
              <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">{body}</p>
            </section>
          ))}
        </div>
      </div>

      <footer className="py-6 px-5 border-t border-[var(--color-border)] text-center text-[13px] text-[var(--color-text-tertiary)]">
        © Climbr 2025 ·{' '}
        <Link to="/privacy" className="hover:underline">Privacy</Link> ·{' '}
        <Link to="/terms" className="hover:underline">Terms</Link>
      </footer>
    </div>
  )
}
