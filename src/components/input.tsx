import React, { useRef, useState } from 'react'
import { Error } from '@/components/error'
import clsx from 'clsx'

const sizes = {
  xSmall: 'h-6 text-xs rounded-md',
  small: 'h-8 text-sm rounded-md',
  mediumSmall: 'h-10 text-sm rounded-md',
  medium: 'h-10 text-sm rounded-md',
  large: 'h-12 text-base rounded-lg',
}

interface InputProps {
  placeholder?: string
  size?: keyof typeof sizes
  prefix?: React.ReactNode | string
  suffix?: React.ReactNode | string
  prefixStyling?: boolean | string
  suffixStyling?: boolean | string
  disabled?: boolean
  error?: string | boolean
  label?: string
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  ref?: React.RefObject<HTMLInputElement | null>
  className?: string
  wrapperClassName?: string
}

function getInputWrapperClass({
  error,
  size,
  disabled,
  className,
}: {
  error: InputProps['error']
  size: NonNullable<InputProps['size']>
  disabled: boolean
  className?: string
}) {
  return clsx(
    'flex items-center duration-150 font-sans',
    error
      ? 'shadow-error-input hover:shadow-error-input-hover'
      : 'border border-gray-alpha-400 hover:border-gray-alpha-500 focus-within:border-transparent focus-within:shadow-focus-input',
    sizes[size],
    disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-background-100',
    className
  )
}

function getInputClass({
  size,
  disabled,
  className,
}: {
  size: NonNullable<InputProps['size']>
  disabled: boolean
  className?: string
}) {
  return clsx(
    'w-full inline-flex appearance-none placeholder:text-zinc-900 placeholder:opacity-70 outline-none',
    size === 'xSmall' || size === 'mediumSmall' ? 'px-2' : 'px-3',
    disabled
      ? 'cursor-not-allowed bg-gray-100 text-gray-700'
      : 'bg-background-100 text-geist-foreground',
    className
  )
}

function InputAffix({
  children,
  styling,
  side,
  size,
}: {
  children: React.ReactNode
  styling: boolean | string
  side: 'prefix' | 'suffix'
  size: NonNullable<InputProps['size']>
}) {
  const isPrefix = side === 'prefix'
  const styledClass = isPrefix
    ? 'bg-background-200 border-r border-gray-alpha-400 px-3'
    : 'bg-background-200 border-l border-gray-alpha-400 px-3'
  const plainClass = isPrefix ? 'pl-3' : 'pr-3'
  const roundedClass = isPrefix
    ? size === 'large'
      ? 'rounded-l-lg'
      : 'rounded-l-md'
    : size === 'large'
      ? 'rounded-r-lg'
      : 'rounded-r-md'

  return (
    <div
      className={clsx(
        'text-gray-700 fill-gray-700 h-full flex items-center justify-center',
        styling === true ? styledClass : plainClass,
        typeof styling === 'string' && styling,
        roundedClass
      )}
    >
      {children}
    </div>
  )
}

export const Input = ({
  placeholder,
  size = 'medium',
  prefix,
  suffix,
  prefixStyling = true,
  suffixStyling = true,
  disabled = false,
  error,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  ref,
  className,
  wrapperClassName,
  ...rest
}: InputProps) => {
  const [_value, set_value] = useState(value || '')
  const internalRef = useRef<HTMLInputElement>(null)
  const _ref = ref || internalRef

  const displayValue = value !== undefined ? value : _value

  const _onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_value(e.target.value)
    onChange?.(e.target.value)
  }

  const focusInput = () => {
    _ref.current?.focus()
  }

  return (
    <div
      className="flex flex-col gap-2"
      onClick={focusInput}
      onKeyDown={e => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        focusInput()
      }}
      role="group"
      tabIndex={-1}
    >
      {label && (
        <div className="capitalize text-[13px] text-zinc-900">{label}</div>
      )}
      <div
        className={getInputWrapperClass({
          error,
          size,
          disabled,
          className: wrapperClassName,
        })}
      >
        {prefix && (
          <InputAffix styling={prefixStyling} side="prefix" size={size}>
            {prefix}
          </InputAffix>
        )}
        <input
          className={getInputClass({ size, disabled, className })}
          placeholder={placeholder}
          disabled={disabled}
          value={displayValue}
          onChange={_onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          ref={_ref}
          {...rest}
        />
        {suffix && (
          <InputAffix styling={suffixStyling} side="suffix" size={size}>
            {suffix}
          </InputAffix>
        )}
      </div>
      {typeof error === 'string' && (
        <Error size={size === 'large' ? 'large' : 'small'}>{error}</Error>
      )}
    </div>
  )
}
