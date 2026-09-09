import { cva } from 'class-variance-authority'

export const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-medium text-muted-foreground outline-none transition-[background-color,color,border-color,box-shadow,transform] hover:bg-accent hover:text-accent-foreground active:translate-y-px focus-visible:shadow-focus-ring disabled:pointer-events-none disabled:translate-y-0 disabled:border-border-subtle disabled:bg-surface-sunken disabled:text-foreground-disabled disabled:opacity-100 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground aria-invalid:border-destructive aria-invalid:shadow-error-input motion-reduce:transform-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border-border-strong bg-surface shadow-neu-raised-sm hover:bg-accent hover:text-accent-foreground active:shadow-neu-pressed data-[state=on]:shadow-neu-pressed',
        segmented:
          'bg-transparent hover:bg-surface hover:text-foreground data-[state=on]:border-primary/50 data-[state=on]:bg-surface-elevated data-[state=on]:text-foreground data-[state=on]:shadow-neu-raised-sm',
      },
      size: {
        default: 'h-9 min-w-9 px-3',
        sm: 'h-8 min-w-8 px-2.5',
        lg: 'h-10 min-w-10 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
