import { Component as ReactComponent } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { Button } from '@/components/ui/button'

interface Props  { children: ReactNode; fallback?: ReactNode }
interface State  { hasError: boolean; message: string }

export class ErrorBoundary extends ReactComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(_error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback)  return this.props.fallback

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-bg-primary)]">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-brand-pink)]/10 flex items-center justify-center mx-auto mb-5">
            <span className="text-[28px]">⚠️</span>
          </div>
          <h1 className="text-[22px] font-[700] text-[var(--color-text-primary)] mb-2">Something went wrong</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
            An unexpected error occurred. Please reload the page.
          </p>
          {this.state.message && (
            <p className="text-[12px] text-[var(--color-text-tertiary)] font-mono mb-6 bg-[var(--color-bg-secondary)] rounded-[var(--radius-md)] p-3">
              {this.state.message}
            </p>
          )}
          <Button onClick={() => window.location.reload()} style={{ background: 'var(--color-brand-cyan)' }}>
            Reload page
          </Button>
        </div>
      </div>
    )
  }
}
