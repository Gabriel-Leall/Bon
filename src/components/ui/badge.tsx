import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium outline-none transition-[background-color,color,border-color,box-shadow] focus-visible:shadow-focus-ring aria-invalid:border-destructive aria-invalid:shadow-error-input [&>svg]:pointer-events-none [&>svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default:
          'border-primary bg-primary text-primary-foreground [a&]:hover:bg-primary-hover',
        secondary:
          'border-border-subtle bg-secondary text-secondary-foreground [a&]:hover:border-border-strong [a&]:hover:bg-accent',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive [a&]:hover:bg-destructive/15 [a&]:focus-visible:shadow-error-input',
        success:
          'border-success/30 bg-success/10 text-success [a&]:hover:bg-success/15',
        warning:
          'border-warning/30 bg-warning/10 text-warning [a&]:hover:bg-warning/15',
        info: 'border-info/30 bg-info/10 text-info [a&]:hover:bg-info/15',
        outline:
          'border-border-strong bg-surface text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge }
