import { Link } from 'react-router-dom'

const sections = [
  { title: '1. Acceptance of Terms', body: 'By accessing or using Climbr, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.' },
  { title: '2. Use of Service', body: 'Climbr grants you a limited, non-exclusive, non-transferable licence to access and use the platform for its intended purposes. You may not use the platform for any illegal, harmful, or unauthorised purpose.' },
  { title: '3. User Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate and complete information when registering.' },
  { title: '4. Employer and Trainer Responsibilities', body: 'Employers and trainers are solely responsible for the accuracy and legality of job and training listings they post. Climbr reserves the right to remove any listing that violates these terms or our community standards.' },
  { title: '5. Payments and Credits', body: 'Certain features require the purchase of credits. All payments are processed securely via Paystack. Credits are non-refundable except as required by applicable law. Pricing is subject to change with reasonable notice.' },
  { title: '6. Intellectual Property', body: 'All content on Climbr, including text, graphics, and code, is owned by or licensed to Climbr and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.' },
  { title: '7. Termination', body: 'Climbr may suspend or terminate your account at any time for violation of these terms. You may delete your account at any time from your account settings. Termination does not relieve you of obligations incurred prior to termination.' },
  { title: '8. Limitation of Liability', body: 'To the maximum extent permitted by law, Climbr is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you paid to us in the twelve months preceding the claim.' },
  { title: '9. Governing Law', body: 'These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.' },
  { title: '10. Contact', body: 'For questions about these Terms of Service, contact us at legal@climbr.com or write to Climbr, Lagos, Nigeria.' },
]

export function Component() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[14px] font-[700]">Climbr</Link>
          <div className="flex items-center gap-4 text-[14px] font-[500] text-[var(--color-text-secondary)]">
            <Link to="/privacy" className="hover:text-[var(--color-text-primary)]">Privacy Policy</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="text-[36px] font-[700] text-[var(--color-brand-navy)] mb-2">Terms of Service</h1>
        <p className="text-[13px] text-[var(--color-text-tertiary)] mb-12">Last updated: January 2025</p>

        <p className="text-[15px] text-[var(--color-text-secondary)] mb-10 leading-relaxed">
          These Terms of Service govern your access to and use of the Climbr platform. Please read them carefully before using our services.
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
