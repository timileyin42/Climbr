import { Bell, Moon, Sun, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/auth/store'

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  const { theme, setTheme, toggleSidebar } = useAuthStore()

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        {title && (
          <h1 className="text-[22px] font-[700] text-[var(--color-text-primary)]">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-[var(--color-text-secondary)]" />
          ) : (
            <Moon className="w-5 h-5 text-[var(--color-text-secondary)]" />
          )}
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </Button>
      </div>
    </header>
  )
}
