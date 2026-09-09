import React, { useId } from 'react'
import { Error } from '@/components/error'
import clsx from 'clsx'

const selectSizes = {
  withoutPrefix: {
    xsmall: 'h-6 text-xs pl-1.5 pr-[22px]',
    small: 'h-8 text-sm pl-3 pr-9',
    medium: 'h-10 text-sm pl-3 pr-9',
    large: 'h-12 text-base pl-3 pr-9 rounded-lg',
  },
  withPrefix: {
    xsmall: 'h-6 text-xs px-[22px]',
    small: 'h-8 text-sm px-9',
    medium: 'h-10 text-sm px-9',
    large: 'h-12 text-base px-9 rounded-lg',
  },
} as const

type Variant = 'default' | 'ghost'

export interface Option {
  value: string
  label: string
}

interface SelectProps {
  variant?: Variant
  options?: Option[]
  label?: string
  value?: string
  placeholder?: string
  size?: keyof typeof selectSizes.withoutPrefix
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  disabled?: boolean
  error?: string
  onChange?: React.ChangeEventHandler<HTMLSelectElement>
}

const ArrowBottom = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m2 5 6 6 6-6-1-1-5 5-5-5-1 1Z"
    />
  </svg>
)

function getSelectClass({
  prefix,
  size,
  disabled,
  variant,
  error,
}: {
  prefix: boolean
  size: NonNullable<SelectProps['size']>
  disabled: boolean
  variant: Variant
  error?: string
}) {
  return clsx(
    'font-sans appearance-none w-full border rounded-[5px] duration-200 outline-none',
    (prefix ? selectSizes.withPrefix : selectSizes.withoutPrefix)[size],
    disabled
      ? 'cursor-not-allowed bg-gray-100 text-gray-700'
      : variant === 'default'
        ? 'text-gray-1000 bg-background-100 cursor-pointer'
        : 'bg-transparent text-accents-5',
    error
      ? 'border-error ring-red-900-alpha-160 ring-opacity-100 ring-[3px]'
      : `ring-gray-alpha-500 ring-opacity-100 focus:ring-[3px] ${variant === 'default' ? 'border-gray-alpha-400' : 'border-transparent ring-none'}`
  )
}

function SelectAffix({
  children,
  side,
  size,
}: {
  children: React.ReactNode
  side: 'prefix' | 'suffix'
  size: NonNullable<SelectProps['size']>
}) {
  return (
    <span
      className={clsx(
        `inline-flex absolute pointer-events-none duration-150 ${size}IconContainer`,
        size === 'xsmall'
          ? side === 'prefix'
            ? 'left-1.25'
            : 'right-1.25'
          : side === 'prefix'
            ? 'left-3'
            : 'right-3'
      )}
    >
      {children}
    </span>
  )
}

export const Select = ({
  variant = 'default',
  options,
  label,
  value,
  placeholder,
  size = 'medium',
  suffix,
  prefix,
  disabled = false,
  error,
  onChange,
}: SelectProps) => {
  const selectId = useId()

  return (
    <div>
      {label && (
        <label
          htmlFor={selectId}
          className="cursor-text block font-sans text-[13px] text-gray-900 capitalize mb-2"
        >
          {label}
        </label>
      )}
      <div
        className={clsx(
          'relative flex items-center',
          disabled
            ? 'fill-[#8f8f8f]'
            : 'fill-[#666666] dark:fill-[#a1a1a1] hover:fill-[#171717] hover:dark:fill-[#ededed]'
        )}
      >
        <style>
          {`
          .xsmallIconContainer svg {
              width: 16px;
              height: 12px;
          }
          .smallIconContainer, .mediumIconContainer, .largeIconContainer svg {
              width: 16px;
              height: 16px;
          }
        `}
        </style>
        <select
          id={selectId}
          disabled={disabled}
          value={value}
          onChange={onChange}
          className={getSelectClass({
            prefix: Boolean(prefix),
            size,
            disabled,
            variant,
            error,
          })}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options &&
            options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>
        {prefix && (
          <SelectAffix side="prefix" size={size}>
            {prefix}
          </SelectAffix>
        )}
        <SelectAffix side="suffix" size={size}>
          {suffix ?? <ArrowBottom />}
        </SelectAffix>
      </div>
      {error && (
        <div className="mt-2">
          <Error size={size === 'large' ? 'large' : 'small'}>{error}</Error>
        </div>
      )}
    </div>
  )
}
