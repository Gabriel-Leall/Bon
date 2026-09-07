import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { CircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'border-border-strong bg-surface text-primary shadow-neu-raised-sm data-[state=checked]:border-primary data-[state=checked]:shadow-neu-pressed aspect-square size-5 shrink-0 rounded-full border outline-none transition-[background-color,color,border-color,box-shadow,transform] hover:border-primary active:scale-95 active:shadow-neu-pressed focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-sunken disabled:text-foreground-disabled disabled:opacity-100 disabled:shadow-none disabled:active:scale-100 aria-invalid:border-destructive aria-invalid:shadow-error-input motion-reduce:transform-none',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon
          aria-hidden="true"
          className="fill-current absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2"
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
