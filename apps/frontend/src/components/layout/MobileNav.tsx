import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X, LayoutDashboard, Briefcase, GraduationCap, FileText, Bookmark, Settings, Users, CreditCard, BarChart3, MessageSquare, ShieldCheck, PenSquare, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore, type UserRole } from '@/lib/auth/store'

const navConfig: Record<UserRole, { label: string; icon: React.ElementType; to: string }[]> = {
  talent: [
    { label: 'Dashboard',      icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Job Listings',   icon: Briefcase,       to: '/jobs' },
    { label: 'Trainings',      icon: GraduationCap,   to: '/trainings' },
    { label: 'Applications',   icon: FileText,        to: '/applications' },
    { label: 'Saved',          icon: Bookmark,        to: '/saved' },
    { label: 'Settings',       icon: Settings,        to: '/settings' },
  ],
  employer: [
    { label: 'Dashboard',  icon: LayoutDashboard, to: '/employer/dashboard' },
    { label: 'My Jobs',    icon: Briefcase,       to: '/employer/jobs' },
    { label: 'Applicants', icon: Users,           to: '/employer/applicants' },
    { label: 'Credits',    icon: CreditCard,      to: '/employer/credits' },
    { label: 'Settings',   icon: Settings,        to: '/employer/settings' },
  ],
  trainer: [
    { label: 'Dashboard',    icon: LayoutDashboard, to: '/trainer/dashboard' },
    { label: 'My Trainings', icon: BookOpen,        to: '/trainer/trainings' },
    { label: 'Applicants',   icon: Users,           to: '/trainer/applicants' },
    { label: 'Credits',      icon: CreditCard,      to: '/trainer/credits' },
    { label: 'Settings',     icon: Settings,        to: '/trainer/settings' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
    { label: 'Users',     icon: Users,           to: '/admin/users' },
    { label: 'Content',   icon: PenSquare,       to: '/admin/content' },
    { label: 'Payments',  icon: CreditCard,      to: '/admin/payments' },
    { label: 'Pricing',   icon: BarChart3,       to: '/admin/pricing' },
    { label: 'Reports',   icon: FileText,        to: '/admin/reports' },
    { label: 'Contact',   icon: MessageSquare,   to: '/admin/contact' },
    { label: 'Admins',    icon: ShieldCheck,     to: '/admin/admins' },
    { label: 'Settings',  icon: Settings,        to: '/admin/settings' },
  ],
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { user } = useAuthStore()
  const role = user?.role ?? 'talent'
  const items = navConfig[role]
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?'

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out drawer */}
      <div className={cn(
        'fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 lg:hidden',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <Link to="/" className="inline-flex items-center px-3 py-1.5 rounded-full bg-[var(--color-brand-navy)] text-white text-[14px] font-[700]">
            Climbr
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-tertiary)]">
            <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-[14px] font-[500] transition-all',
                isActive
                  ? 'bg-white shadow-sm border border-[var(--color-border)] text-[var(--color-brand-cyan)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User pill */}
        <div className="px-4 py-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)]">
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-navy)] flex items-center justify-center text-[12px] font-[700] text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-[600] text-[var(--color-text-primary)] truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[11px] text-[var(--color-text-tertiary)] capitalize">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
