import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold text-[13px] leading-[1.3] transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-cyan)] focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-brand-cyan)] text-white hover:bg-[var(--color-brand-cyan-dark)] rounded-[var(--radius-pill)]',
        dark:
          'bg-[var(--color-brand-navy)] text-white hover:opacity-90 rounded-[var(--radius-pill)]',
        outline:
          'border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:border-[var(--color-brand-cyan)] rounded-[var(--radius-pill)]',
        ghost:
          'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] rounded-[var(--radius-md)]',
        destructive:
          'text-[var(--color-brand-pink)] hover:text-[var(--color-brand-hot-pink)] bg-transparent',
      },
      size: {
        sm: 'h-9 px-4 text-[12px]',
        default: 'h-12 px-6',
        lg: 'h-14 px-8 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
