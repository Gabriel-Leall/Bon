import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer border-border-strong bg-surface shadow-neu-raised-sm data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-neu-pressed size-5 shrink-0 rounded-sm border outline-none transition-[background-color,color,border-color,box-shadow,transform] hover:border-primary active:scale-95 active:shadow-neu-pressed focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-sunken disabled:text-foreground-disabled disabled:opacity-100 disabled:shadow-none disabled:active:scale-100 aria-invalid:border-destructive aria-invalid:shadow-error-input aria-invalid:data-[state=checked]:border-destructive aria-invalid:data-[state=checked]:bg-destructive motion-reduce:transform-none',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
