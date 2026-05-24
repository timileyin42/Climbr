import { useEffect, useState, useCallback } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, Layers, FileText, Bookmark,
  Users, CreditCard, Settings, ShieldCheck,
  Search,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth/store'

interface NavItem { label: string; path: string; icon: React.ElementType; group: string }

const TALENT_NAV: NavItem[] = [
  { label: 'Dashboard',    path: '/dashboard',    icon: LayoutDashboard, group: 'Talent' },
  { label: 'Jobs',         path: '/jobs',         icon: Briefcase,       group: 'Talent' },
  { label: 'Trainings',    path: '/trainings',    icon: Layers,          group: 'Talent' },
  { label: 'Applications', path: '/applications', icon: FileText,        group: 'Talent' },
  { label: 'Saved',        path: '/saved',        icon: Bookmark,        group: 'Talent' },
  { label: 'Profile',      path: '/profile',      icon: Users,           group: 'Talent' },
  { label: 'Settings',     path: '/settings',     icon: Settings,        group: 'Talent' },
]

const EMPLOYER_NAV: NavItem[] = [
  { label: 'Dashboard',    path: '/employer/dashboard', icon: LayoutDashboard, group: 'Employer' },
  { label: 'My Jobs',      path: '/employer/jobs',      icon: Briefcase,       group: 'Employer' },
  { label: 'Post a Job',   path: '/employer/jobs/new',  icon: Briefcase,       group: 'Employer' },
  { label: 'Credits',      path: '/employer/credits',   icon: CreditCard,      group: 'Employer' },
  { label: 'Settings',     path: '/employer/settings',  icon: Settings,        group: 'Employer' },
]

const TRAINER_NAV: NavItem[] = [
  { label: 'Dashboard',    path: '/trainer/dashboard',      icon: LayoutDashboard, group: 'Trainer' },
  { label: 'My Trainings', path: '/trainer/trainings',      icon: Layers,          group: 'Trainer' },
  { label: 'Post Training',path: '/trainer/trainings/new',  icon: Layers,          group: 'Trainer' },
  { label: 'Credits',      path: '/trainer/credits',        icon: CreditCard,      group: 'Trainer' },
  { label: 'Settings',     path: '/trainer/settings',       icon: Settings,        group: 'Trainer' },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, group: 'Admin' },
  { label: 'Users',     path: '/admin/users',     icon: Users,           group: 'Admin' },
  { label: 'Content',   path: '/admin/content',   icon: FileText,        group: 'Admin' },
  { label: 'Payments',  path: '/admin/payments',  icon: CreditCard,      group: 'Admin' },
  { label: 'Pricing',   path: '/admin/pricing',   icon: CreditCard,      group: 'Admin' },
  { label: 'Reports',   path: '/admin/reports',   icon: FileText,        group: 'Admin' },
  { label: 'Admins',    path: '/admin/admins',    icon: ShieldCheck,     group: 'Admin' },
  { label: 'Settings',  path: '/admin/settings',  icon: Settings,        group: 'Admin' },
]

function navForRole(role?: string): NavItem[] {
  if (role === 'employer') return EMPLOYER_NAV
  if (role === 'trainer')  return TRAINER_NAV
  if (role === 'admin')    return ADMIN_NAV
  return TALENT_NAV
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const items = navForRole(role)

  const toggle = useCallback(() => setOpen((o) => !o), [])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggle])

  function select(path: string) {
    navigate(path)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-active)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
            <Search className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
            <Command.Input
              placeholder="Go to…"
              className="flex-1 text-[14px] text-[var(--color-text-primary)] outline-none bg-transparent placeholder:text-[var(--color-text-tertiary)]"
              autoFocus
            />
            <kbd className="text-[11px] text-[var(--color-text-tertiary)] border border-[var(--color-border)] rounded px-1.5 py-0.5 font-mono">ESC</kbd>
          </div>

          <Command.List className="max-h-72 overflow-y-auto py-2">
            <Command.Empty className="px-4 py-8 text-center text-[13px] text-[var(--color-text-secondary)]">
              No results found.
            </Command.Empty>

            {items.map((item) => {
              const Icon = item.icon
              return (
                <Command.Item
                  key={item.path}
                  value={item.label}
                  onSelect={() => select(item.path)}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-[14px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] data-[selected=true]:bg-[var(--color-brand-cyan-soft)] data-[selected=true]:text-[var(--color-brand-cyan)] transition-colors"
                >
                  <Icon className="w-4 h-4 shrink-0 text-[var(--color-text-tertiary)]" />
                  <span className="font-[500]">{item.label}</span>
                  <span className="ml-auto text-[12px] text-[var(--color-text-tertiary)]">{item.group}</span>
                </Command.Item>
              )
            })}
          </Command.List>

          <div className="px-4 py-2 border-t border-[var(--color-border)] flex items-center gap-4 text-[11px] text-[var(--color-text-tertiary)]">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>ESC close</span>
            <span className="ml-auto">⌘K</span>
          </div>
        </Command>
      </div>
    </div>
  )
}
