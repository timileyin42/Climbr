import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useContact } from '@/lib/api/queries/useJobs'

const schema = z.object({
  name:    z.string().min(2, 'At least 2 characters'),
  email:   z.string().email('Enter a valid email'),
  message: z.string().min(10, 'At least 10 characters'),
})
type FormValues = z.infer<typeof schema>

const info = [
  { icon: Mail,   label: 'Email',         value: 'hello@climbr.com' },
  { icon: MapPin, label: 'Location',      value: 'Lagos, Nigeria' },
  { icon: Clock,  label: 'Response time', value: 'Within 24 hours' },
]

export function Component() {
  const contact = useContact()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function onSubmit(v: FormValues) {
    contact.mutate(v, { onSuccess: () => reset() })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--color-brand-navy)] text-white text-[14px] font-[700]">Climbr</Link>
          <div className="flex items-center gap-4 text-[14px] font-[500] text-[var(--color-text-secondary)]">
            <Link to="/faq" className="hover:text-[var(--color-text-primary)]">FAQ</Link>
            <Link to="/login" className="hover:text-[var(--color-text-primary)]">Log in</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left panel */}
          <div className="lg:sticky lg:top-24 bg-[var(--color-brand-navy)] rounded-[var(--radius-xl)] p-10">
            <h1 className="text-[36px] font-[700] text-white mb-3">Get in touch.</h1>
            <p className="text-white/60 text-[15px] mb-10 leading-relaxed">
              Have a question, partnership idea, or just want to say hi? We'd love to hear from you.
            </p>
            <div className="space-y-6">
              {info.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[var(--color-brand-cyan)]" />
                  </div>
                  <div>
                    <p className="text-[12px] text-white/40 uppercase tracking-wide">{label}</p>
                    <p className="text-[15px] text-white font-[500]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right form */}
          <div>
            {contact.isSuccess ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-[var(--color-brand-cyan-soft)] flex items-center justify-center mx-auto mb-5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="text-[24px] font-[700] text-[var(--color-brand-navy)] mb-2">Message sent!</h2>
                <p className="text-[14px] text-[var(--color-text-secondary)]">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Full name</label>
                  <Input placeholder="Ada Obi" {...register('name')} />
                  {errors.name && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Email</label>
                  <Input type="email" placeholder="you@example.com" {...register('email')} />
                  {errors.email && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-1.5">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us what's on your mind…"
                    {...register('message')}
                    className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] bg-white resize-none outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                  />
                  {errors.message && <p className="text-[12px] text-[var(--color-brand-pink)] mt-1">{errors.message.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={contact.isPending}>
                  {contact.isPending ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            )}
          </div>
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
