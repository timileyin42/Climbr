import { useState, useRef, useEffect } from 'react'
import { Bell, Moon, Sun, PanelLeft, Check, CheckCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MobileNav } from './MobileNav'
import { useAuthStore } from '@/lib/auth/store'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/lib/api/queries/useMessages'
import { cn } from '@/lib/utils'

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (d < 1)  return 'just now'
  if (d < 60) return `${d}m ago`
  const h = Math.floor(d / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { data, isLoading } = useNotifications()
  const markOne  = useMarkNotificationRead()
  const markAll  = useMarkAllNotificationsRead()

  const items       = data?.items ?? []
  const unreadCount = data?.unread_count ?? 0

  return (
    <div className="absolute right-0 top-full mt-2 w-[340px] bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-[700] text-[var(--color-text-primary)]">Notifications</p>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-[700] bg-[var(--color-brand-cyan)] text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="flex items-center gap-1 text-[11px] font-[600] text-[var(--color-brand-cyan)] hover:underline px-2 py-1"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-[360px]">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[var(--color-bg-tertiary)] rounded w-3/4" />
                  <div className="h-2.5 bg-[var(--color-bg-tertiary)] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <Bell className="w-8 h-8 text-[var(--color-text-tertiary)] mb-3" />
            <p className="text-[13px] font-[600] text-[var(--color-text-primary)] mb-1">All caught up</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)] text-center">
              You have no notifications right now.
            </p>
          </div>
        ) : (
          items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => { if (!n.is_read) markOne.mutate(n.id) }}
              className={cn(
                'w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] last:border-0',
                !n.is_read && 'bg-[var(--color-brand-cyan-soft)]'
              )}
            >
              {/* Unread dot */}
              <div className="mt-1 shrink-0">
                {n.is_read
                  ? <div className="w-2 h-2 rounded-full bg-transparent" />
                  : <div className="w-2 h-2 rounded-full bg-[var(--color-brand-cyan)]" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-[13px] leading-snug',
                  n.is_read ? 'font-[400] text-[var(--color-text-secondary)]' : 'font-[600] text-[var(--color-text-primary)]'
                )}>
                  {n.title}
                </p>
                {n.body && (
                  <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 line-clamp-2">{n.body}</p>
                )}
                <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">{timeAgo(n.created_at)}</p>
              </div>
              {n.is_read && (
                <Check className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] shrink-0 mt-0.5" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export function Topbar() {
  const { theme, setTheme, toggleSidebar } = useAuthStore()
  const { data: notifData } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifData?.unread_count ?? 0

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] shrink-0">
      <div className="flex items-center gap-2">
        <MobileNav />
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden lg:flex">
          <PanelLeft className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun className="w-5 h-5 text-[var(--color-text-secondary)]" />
            : <Moon className="w-5 h-5 text-[var(--color-text-secondary)]" />
          }
        </Button>

        {/* Notification bell */}
        <div ref={ref} className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            onClick={() => setOpen((p) => !p)}
            className="relative"
          >
            <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-[700] flex items-center justify-center leading-none">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </Button>

          {open && <NotificationPanel onClose={() => setOpen(false)} />}
        </div>
      </div>
    </header>
  )
}
