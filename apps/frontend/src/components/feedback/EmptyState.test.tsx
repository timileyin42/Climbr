import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Briefcase } from 'lucide-react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState icon={Briefcase} title="No jobs" description="Post your first listing." />)
    expect(screen.getByText('No jobs')).toBeInTheDocument()
    expect(screen.getByText('Post your first listing.')).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    const onClick = vi.fn()
    render(
      <EmptyState
        icon={Briefcase}
        title="Empty"
        description="Nothing here."
        action={{ label: 'Add one', onClick }}
      />
    )
    const btn = screen.getByRole('button', { name: 'Add one' })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not render a button when no action is provided', () => {
    render(<EmptyState icon={Briefcase} title="Empty" description="Nothing." />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})
