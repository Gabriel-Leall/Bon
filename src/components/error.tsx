import React from 'react'

const ErrorIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm.75 4v5h-1.5V4h1.5ZM8 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
    />
  </svg>
)

const ErrorLinkIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 3h5v5h-1.5V5.56L7.53 9.53 6.47 8.47l3.97-3.97H8V3ZM4 4.5h2V6H4.5v5.5H10V10h1.5v2a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z"
    />
  </svg>
)

interface Error {
  message: string
  action: string
  link: string
}

interface ErrorProps {
  error?: Error
  label?: string
  size?: 'small' | 'medium' | 'large'
  children?: React.ReactNode
}

export const Error = ({
  error,
  label,
  size = 'medium',
  children,
}: ErrorProps) => {
  return (
    <div
      className={`flex items-center gap-2 text-red-900 fill-red-900 font-sans
      ${
        {
          small: 'text-[13px] leading-5',
          medium: 'text-sm',
          large: 'text-base',
        }[size]
      }`}
      // @ts-expect-error -- CSS custom properties exist but are not in React.CSSProperties
      style={{ '--geist-link-color': 'var(--ds-red-900)' }}
    >
      <ErrorIcon />
      {error ? (
        <>
          {error.message}
          <a
            className="font-medium flex items-center gap-0.5 -ml-1 hover:no-underline hover:opacity-60 transition-opacity duration-150 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-px after:bg-red-900"
            href={error.link}
            target="_blank"
            rel="noreferrer noopener"
          >
            {error.action}
            <ErrorLinkIcon />
          </a>
        </>
      ) : (
        <>
          {label && <span className="font-medium">{label}:</span>}
          {children}
        </>
      )}
    </div>
  )
}
