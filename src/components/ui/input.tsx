import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-border bg-surface-sunken placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground shadow-neu-pressed h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm outline-none transition-[background-color,color,border-color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-border-strong focus-visible:border-border-strong focus-visible:shadow-focus-input disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-sunken disabled:text-foreground-disabled disabled:opacity-100 disabled:placeholder:text-foreground-disabled',
        'aria-invalid:border-destructive aria-invalid:shadow-error-input aria-invalid:hover:shadow-error-input-hover',
        className
      )}
      {...props}
    />
  )
}

export { Input }
