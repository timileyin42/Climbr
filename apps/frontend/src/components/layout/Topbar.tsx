import { Bell, Moon, Sun, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MobileNav } from './MobileNav'
import { useAuthStore } from '@/lib/auth/store'

export function Topbar() {
  const { theme, setTheme, toggleSidebar } = useAuthStore()

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] shrink-0">
      <div className="flex items-center gap-2">
        {/* Mobile: slide-out drawer */}
        <MobileNav />
        {/* Desktop: collapse sidebar */}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden lg:flex">
          <PanelLeft className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
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
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </Button>
      </div>
    </header>
  )
}
