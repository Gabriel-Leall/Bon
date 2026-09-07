import { LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react'
import { pageVariants } from '@/lib/motion-tokens'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        variants={pageVariants}
        initial={reduceMotion ? false : 'hidden'}
        animate="visible"
        className="axis-page h-full w-full"
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}
