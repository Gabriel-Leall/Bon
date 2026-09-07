import type { Variants } from 'motion/react'

export const motionDurations = {
  instant: 0.08,
  fast: 0.14,
  normal: 0.22,
  slow: 0.32,
  deliberate: 0.44,
} as const

export const transitions = {
  enter: { type: 'spring', stiffness: 400, damping: 30 },
  layout: { type: 'spring', stiffness: 300, damping: 35 },
  snap: { type: 'spring', stiffness: 600, damping: 40 },
  fade: { duration: motionDurations.fast, ease: 'easeOut' },
} as const

export const listItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * motionDurations.instant * 0.5,
      duration: motionDurations.normal,
      ease: 'easeOut',
    },
  }),
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: motionDurations.fast, ease: 'easeIn' },
  },
} satisfies Variants

export const pageVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDurations.normal, ease: 'easeOut' },
  },
} satisfies Variants
