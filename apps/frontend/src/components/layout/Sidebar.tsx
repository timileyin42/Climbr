import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, GraduationCap, FileText,
  Settings, Users, BarChart3, CreditCard,
  MessageSquare, ShieldCheck, PenSquare, BookOpen, UserCircle, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore, type UserRole } from '@/lib/auth/store'
import { useLogout } from '@/lib/api/queries/useAuth'

const navConfig: Record<UserRole, { label: string; icon: React.ElementType; to: string }[]> = {
  talent: [
    { label: 'Dashboard',       icon: LayoutDashboard, to: '/dashboard' },
    { label: 'My Profile',      icon: UserCircle,      to: '/profile' },
    { label: 'Job Listings',    icon: Briefcase,       to: '/jobs' },
    { label: 'Trainings',       icon: GraduationCap,   to: '/trainings' },
    { label: 'My Applications', icon: FileText,        to: '/applications' },
    { label: 'Settings',        icon: Settings,        to: '/settings' },
  ],
  employer: [
    { label: 'Dashboard',  icon: LayoutDashboard, to: '/employer/dashboard' },
    { label: 'My Jobs',    icon: Briefcase,       to: '/employer/jobs' },
    { label: 'Applicants', icon: Users,           to: '/employer/applicants' },
    { label: 'Messages',   icon: MessageSquare,   to: '/employer/messages' },
    { label: 'Credits',    icon: CreditCard,      to: '/employer/credits' },
    { label: 'Settings',   icon: Settings,        to: '/employer/settings' },
  ],
  trainer: [
    { label: 'Dashboard',    icon: LayoutDashboard, to: '/trainer/dashboard' },
    { label: 'My Trainings', icon: BookOpen,        to: '/trainer/trainings' },
    { label: 'Applicants',   icon: Users,           to: '/trainer/applicants' },
    { label: 'Messages',     icon: MessageSquare,   to: '/trainer/messages' },
    { label: 'Credits',      icon: CreditCard,      to: '/trainer/credits' },
    { label: 'Settings',     icon: Settings,        to: '/trainer/settings' },
  ],
  admin: [
    { label: 'Dashboard',  icon: LayoutDashboard, to: '/admin/dashboard' },
    { label: 'Users',      icon: Users,           to: '/admin/users' },
    { label: 'Content',    icon: PenSquare,       to: '/admin/content' },
    { label: 'Payments',   icon: CreditCard,      to: '/admin/payments' },
    { label: 'Pricing',    icon: BarChart3,       to: '/admin/pricing' },
    { label: 'Reports',    icon: FileText,        to: '/admin/reports' },
    { label: 'Contact',    icon: MessageSquare,   to: '/admin/contact' },
    { label: 'Admins',     icon: ShieldCheck,     to: '/admin/admins' },
    { label: 'Settings',   icon: Settings,        to: '/admin/settings' },
  ],
}

export function Sidebar() {
  const { user } = useAuthStore()
  const role = user?.role ?? 'talent'
  const items = navConfig[role]
  const logout = useLogout()

  return (
    <aside className="flex flex-col w-64 h-full bg-[var(--color-bg-primary)] border-r border-[var(--color-border)]">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-[var(--color-border)]">
        <span className="text-[22px] font-[700] text-[var(--color-brand-cyan)] tracking-tight">
          Climbr
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {items.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-[14px] font-[500] transition-colors',
                isActive
                  ? 'bg-white text-[var(--color-brand-cyan)] shadow-[var(--shadow-card)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn('w-4 h-4 shrink-0', isActive && 'text-[var(--color-brand-cyan)]')}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile pill + logout */}
      {user && (
        <div className="px-3 pb-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)]">
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-cyan)] flex items-center justify-center text-white text-[12px] font-[700] shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-[600] text-[var(--color-text-primary)] truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-[var(--color-text-tertiary)] truncate capitalize">
                {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[var(--radius-md)] text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </aside>
  )
}
