import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-medium outline-none transition-[background-color,color,border-color,box-shadow,transform] active:translate-y-px focus-visible:shadow-focus-ring disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-100 motion-reduce:transform-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 aria-invalid:border-destructive aria-invalid:focus-visible:shadow-error-input",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-neu-raised-sm hover:bg-primary-hover active:bg-primary-active active:shadow-neu-pressed disabled:border-border-subtle disabled:bg-muted disabled:text-foreground-disabled disabled:shadow-none',
        destructive:
          'bg-destructive text-foreground-inverse shadow-neu-raised-sm hover:bg-destructive/90 active:bg-destructive/80 active:shadow-neu-pressed focus-visible:shadow-error-input disabled:border-border-subtle disabled:bg-muted disabled:text-foreground-disabled disabled:shadow-none',
        outline:
          'border-border-strong bg-surface text-foreground shadow-neu-raised-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:shadow-neu-pressed disabled:border-border-subtle disabled:bg-surface-sunken disabled:text-foreground-disabled disabled:shadow-none',
        secondary:
          'bg-secondary text-secondary-foreground shadow-neu-raised-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:shadow-neu-pressed disabled:border-border-subtle disabled:bg-muted disabled:text-foreground-disabled disabled:shadow-none',
        ghost:
          'text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80 disabled:bg-transparent disabled:text-foreground-disabled',
        link: 'text-primary underline-offset-4 hover:underline active:translate-y-0 disabled:bg-transparent disabled:text-foreground-disabled disabled:no-underline',
      },
      size: {
        xs: 'h-7 gap-1.5 px-2.5 text-xs has-[>svg]:px-2',
        default: 'h-9 px-3.5 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-5 has-[>svg]:px-4',
        'icon-xs': 'size-7 p-0',
        icon: 'size-9 p-0',
        'icon-sm': 'size-8 p-0',
        'icon-lg': 'size-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
