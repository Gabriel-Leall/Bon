import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { PageWrapper } from './PageWrapper'

const motionState = vi.hoisted(() => ({ reduceMotion: false }))

vi.mock('motion/react', () => ({
  domAnimation: {},
  LazyMotion: ({ children }: { children: React.ReactNode }) => children,
  useReducedMotion: () => motionState.reduceMotion,
  m: {
    div: ({
      children,
      initial,
      animate,
      className,
    }: {
      children: React.ReactNode
      initial: string | false
      animate: string
      className: string
    }) => (
      <div
        className={className}
        data-animate={animate}
        data-initial={initial === false ? 'false' : initial}
      >
        {children}
      </div>
    ),
  },
}))

describe('PageWrapper', () => {
  beforeEach(() => {
    motionState.reduceMotion = false
  })

  it('animates page entry by default', () => {
    render(<PageWrapper>Page content</PageWrapper>)

    expect(screen.getByText('Page content')).toHaveAttribute(
      'data-initial',
      'hidden'
    )
  })

  it('skips the entry animation when reduced motion is preferred', () => {
    motionState.reduceMotion = true

    render(<PageWrapper>Page content</PageWrapper>)

    expect(screen.getByText('Page content')).toHaveAttribute(
      'data-initial',
      'false'
    )
  })
})
