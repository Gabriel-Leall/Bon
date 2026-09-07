import * as React from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

interface SegmentedControlOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

interface SegmentedControlProps extends Omit<
  React.ComponentProps<typeof ToggleGroup>,
  'children' | 'defaultValue' | 'onValueChange' | 'type' | 'value' | 'variant'
> {
  options: readonly SegmentedControlOption[]
  value: string
  onValueChange: (value: string) => void
  'aria-label': string
}

function SegmentedControl({
  className,
  options,
  value,
  onValueChange,
  'aria-label': ariaLabel,
  ...props
}: SegmentedControlProps) {
  return (
    <ToggleGroup
      type="single"
      variant="segmented"
      value={value}
      onValueChange={nextValue => {
        if (nextValue) onValueChange(nextValue)
      }}
      aria-label={ariaLabel}
      className={cn('max-w-full', className)}
      {...props}
    >
      {options.map(option => {
        const Icon = option.icon

        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            aria-label={
              typeof option.label === 'string' ? option.label : undefined
            }
          >
            {Icon ? <Icon aria-hidden="true" data-icon="inline-start" /> : null}
            <span className="truncate">{option.label}</span>
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}

export { SegmentedControl, type SegmentedControlOption }
