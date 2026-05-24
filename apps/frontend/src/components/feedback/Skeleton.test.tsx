import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton, JobCardSkeleton, StatCardSkeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders with animate-pulse class', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('merges custom className', () => {
    const { container } = render(<Skeleton className="h-10 w-full" />)
    expect(container.firstChild).toHaveClass('h-10', 'w-full', 'animate-pulse')
  })
})

describe('JobCardSkeleton', () => {
  it('renders without errors', () => {
    const { container } = render(<JobCardSkeleton />)
    expect(container.firstChild).toBeTruthy()
  })
})

describe('StatCardSkeleton', () => {
  it('renders without errors', () => {
    const { container } = render(<StatCardSkeleton />)
    expect(container.firstChild).toBeTruthy()
  })
})
