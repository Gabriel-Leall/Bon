import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-border bg-surface-sunken placeholder:text-muted-foreground shadow-neu-pressed flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-sm outline-none transition-[background-color,color,border-color,box-shadow] hover:border-border-strong focus-visible:border-border-strong focus-visible:shadow-focus-input disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-sunken disabled:text-foreground-disabled disabled:opacity-100 disabled:placeholder:text-foreground-disabled aria-invalid:border-destructive aria-invalid:shadow-error-input aria-invalid:hover:shadow-error-input-hover',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
