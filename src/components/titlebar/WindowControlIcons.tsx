import type { SVGProps } from 'react'

/**
 * Window control icons for all platforms.
 *
 * macOS icons from: https://github.com/agmmnn/tauri-controls
 */

// =============================================================================
// macOS Icons
// =============================================================================

export const MacOSIcons = {
  close: (props: SVGProps<SVGSVGElement>) => (
    <svg
      width="6"
      height="6"
      viewBox="0 0 16 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3 3l10 12M13 3 3 15"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  ),
  minimize: (props: SVGProps<SVGSVGElement>) => (
    <svg
      width="8"
      height="8"
      viewBox="0 0 17 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_20_2051)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1 2h15v3H1Z"
          fill="currentColor"
        />
      </g>
    </svg>
  ),
  fullscreen: (props: SVGProps<SVGSVGElement>) => (
    <svg
      width="6"
      height="6"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_20_2057)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 1h5v5h-2V4.41L9.41 7 8 5.59 10.59 3H9V1ZM6 14H1V9h2v1.59L5.59 8 7 9.41 4.41 12H6v2Z"
          fill="currentColor"
        />
      </g>
    </svg>
  ),
  maximize: (props: SVGProps<SVGSVGElement>) => (
    <svg
      width="8"
      height="8"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_20_2053)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.5 9.8h-5.2V15c0 .4-.3.7-.7.7H7.5c-.4 0-.7-.3-.7-.7V9.8H1.6c-.4 0-.7-.3-.7-.7V6.9c0-.4.3-.7.7-.7h5.2V1.1c0-.4.3-.7.7-.7h2.1c.4 0 .7.3.7.7v5.1h5.2c.4 0 .7.3.7.7v2.2c0 .4-.3.7-.7.7Z"
          fill="currentColor"
        />
      </g>
    </svg>
  ),
}

// =============================================================================
// Windows Icons
// =============================================================================

export const WindowsIcons = {
  minimize: (props: SVGProps<SVGSVGElement>) => (
    <svg
      width="10"
      height="1"
      viewBox="0 0 10 1"
      fill="currentColor"
      {...props}
    >
      <rect width="10" height="1" />
    </svg>
  ),
  maximize: (props: SVGProps<SVGSVGElement>) => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      {...props}
    >
      <rect x="0.5" y="0.5" width="9" height="9" strokeWidth="1" />
    </svg>
  ),
  restore: (props: SVGProps<SVGSVGElement>) => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      {...props}
    >
      {/* Back window */}
      <path d="M2 0.5h7.5v7.5" strokeWidth="1" />
      {/* Front window */}
      <rect x="0.5" y="2.5" width="7" height="7" strokeWidth="1" />
    </svg>
  ),
  close: (props: SVGProps<SVGSVGElement>) => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      {...props}
    >
      <path d="M0 0L10 10M10 0L0 10" strokeWidth="1" />
    </svg>
  ),
}
