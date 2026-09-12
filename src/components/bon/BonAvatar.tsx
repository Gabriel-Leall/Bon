import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import type { BonBookMode, BonState } from '@/lib/bon-domain'
import { cn } from '@/lib/utils'
import './bon.css'

interface BonAvatarProps {
  ariaLabel: string
  book?: BonBookMode
  className?: string
  onInteract?: () => void
  reducedMotion?: boolean
  speaking?: boolean
  state: BonState
}

function BonBook({ mode }: { mode: BonBookMode }) {
  if (mode === 'hidden') return null

  return (
    <svg
      className="bon-avatar-overlay bon-book-overlay"
      viewBox="-150 -150 300 300"
      aria-hidden="true"
    >
      {mode === 'open' ? (
        <g className="bon-book-open">
          <path className="bon-book-cover" d="M-92 66L-3 84V137L-98 116Z" />
          <path className="bon-book-cover" d="M92 66L3 84V137L98 116Z" />
          <path className="bon-book-page" d="M-84 57L-2 77V127L-91 108Z" />
          <path className="bon-book-page" d="M84 57L2 77V127L91 108Z" />
          <path className="bon-book-spine" d="M0 77V133" />
          <path className="bon-page-line" d="M-66 78L-22 88M-66 91L-22 101" />
          <path className="bon-page-line" d="M66 78L22 88M66 91L22 101" />
          <path
            className="bon-turning-page"
            d="M4 77C25 66 51 67 75 73C48 84 24 98 4 119Z"
          />
        </g>
      ) : (
        <g className="bon-book-closed">
          <path className="bon-book-cover" d="M-59 91L70 73L77 111L-52 129Z" />
          <path className="bon-book-page" d="M-55 85L67 69L72 101L-50 118Z" />
          <path
            className="bon-book-mark"
            d="M5 76L10 110L20 101L31 107L26 73Z"
          />
        </g>
      )}
    </svg>
  )
}

export function BonAvatar({
  ariaLabel,
  book = 'hidden',
  className,
  onInteract,
  reducedMotion = false,
  speaking = false,
  state,
}: BonAvatarProps) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const [systemReducedMotion, setSystemReducedMotion] = useState(false)
  const shouldReduceMotion = reducedMotion || systemReducedMotion
  const interactive = Boolean(onInteract)

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mediaQuery) return

    const updatePreference = () => setSystemReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener?.('change', updatePreference)
    return () => mediaQuery.removeEventListener?.('change', updatePreference)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root || shouldReduceMotion || !interactive) return

    let removePointerListeners = () => undefined
    const context = gsap.context(() => {
      const visual = root.querySelector<HTMLElement>('.bon-avatar-interaction')
      if (!visual) return

      const moveX = gsap.quickTo(visual, 'x', {
        duration: 0.38,
        ease: 'power3.out',
      })
      const moveY = gsap.quickTo(visual, 'y', {
        duration: 0.38,
        ease: 'power3.out',
      })
      const rotate = gsap.quickTo(visual, 'rotation', {
        duration: 0.42,
        ease: 'power3.out',
        transformOrigin: 'center center',
      })

      const handlePointerMove = (event: PointerEvent) => {
        const bounds = root.getBoundingClientRect()
        const x = (event.clientX - bounds.left) / bounds.width - 0.5
        const y = (event.clientY - bounds.top) / bounds.height - 0.5
        moveX(x * 5)
        moveY(y * 3)
        rotate(x * 2)
      }
      const handlePointerLeave = () => {
        moveX(0)
        moveY(0)
        rotate(0)
      }

      root.addEventListener('pointermove', handlePointerMove)
      root.addEventListener('pointerleave', handlePointerLeave)
      removePointerListeners = () => {
        root.removeEventListener('pointermove', handlePointerMove)
        root.removeEventListener('pointerleave', handlePointerLeave)
      }
    }, root)

    return () => {
      removePointerListeners()
      context.revert()
    }
  }, [interactive, shouldReduceMotion])

  return (
    <button
      ref={rootRef}
      type="button"
      className={cn('bon-avatar', className)}
      data-book={book}
      data-reduced-motion={shouldReduceMotion}
      data-speaking={speaking}
      data-state={state}
      onClick={onInteract}
      disabled={!interactive}
      aria-label={ariaLabel}
    >
      <span className="bon-avatar-interaction" aria-hidden="true">
        <span className="bon-avatar-visual">
          <img
            className="bon-avatar-renderer"
            src="/bon/bon-face-base.png"
            alt=""
            draggable={false}
          />

          <svg
            className="bon-avatar-overlay bon-eyes-overlay"
            viewBox="0 0 1254 1254"
            aria-hidden="true"
          >
            <g className="bon-eyes">
              <path
                className="bon-eye bon-eye-left"
                d="M490 521C460 519 443 561 441 617c-2 58 15 112 49 115 34 4 53-44 53-108 0-61-17-103-53-103Z"
              />
              <path
                className="bon-eye bon-eye-right"
                d="M754 489c-30-3-48 39-47 104 1 61 19 112 54 116 34 4 53-43 52-103-1-65-24-113-59-117Z"
              />
            </g>
          </svg>

          <svg
            className="bon-avatar-overlay bon-mouth-overlay"
            viewBox="-150 -150 300 300"
            aria-hidden="true"
          >
            <ellipse
              className="bon-mouth-opening"
              cx="0"
              cy="45"
              rx="9"
              ry="7"
            />
          </svg>

          <BonBook mode={book} />
        </span>
      </span>
    </button>
  )
}
