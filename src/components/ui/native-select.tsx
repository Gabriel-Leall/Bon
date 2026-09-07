import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <div
      className="group/native-select relative w-fit"
      data-slot="native-select-wrapper"
    >
      <select
        data-slot="native-select"
        className={cn(
          'border-border bg-surface-sunken placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground shadow-neu-pressed h-9 w-full min-w-0 appearance-none rounded-md border px-3 py-2 pr-9 text-sm outline-none transition-[background-color,color,border-color,box-shadow] hover:border-border-strong disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-sunken disabled:text-foreground-disabled disabled:opacity-100',
          'focus-visible:border-border-strong focus-visible:shadow-focus-input',
          'aria-invalid:border-destructive aria-invalid:shadow-error-input aria-invalid:hover:shadow-error-input-hover',
          className
        )}
        {...props}
      />
      <ChevronDownIcon
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 select-none group-has-[select:disabled]/native-select:text-foreground-disabled"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

function NativeSelectOption({ ...props }: React.ComponentProps<'option'>) {
  return <option data-slot="native-select-option" {...props} />
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn(className)}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
