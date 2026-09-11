import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger)

export function useGsapLandingMotion(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const context = gsap.context(() => {
      if (!reduceMotion) {
        const sections = gsap.utils.toArray<HTMLElement>(
          'section:not(.hero-section), footer',
          root
        )

        sections.forEach(section => {
          gsap.fromTo(
            section,
            { autoAlpha: 0, y: 36 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              ease: 'power3.out',
              clearProps: 'transform,opacity,visibility',
              scrollTrigger: {
                trigger: section,
                start: 'top 86%',
                once: true,
              },
            }
          )
        })
      }
    }, root)

    const handleAnchorClick = (event: MouseEvent) => {
      const anchor = (
        event.target as Element | null
      )?.closest<HTMLAnchorElement>('a[href^="#"]')
      const targetId = anchor?.hash
      if (!anchor || !targetId || targetId === '#') return

      const target = document.querySelector<HTMLElement>(targetId)
      if (!target) return

      event.preventDefault()

      if (reduceMotion) {
        target.scrollIntoView()
      } else {
        gsap.to(window, {
          scrollTo: { y: target, offsetY: 20 },
          duration: 0.9,
          ease: 'power3.inOut',
          overwrite: 'auto',
        })
      }

      window.history.replaceState(null, '', targetId)
    }

    root.addEventListener('click', handleAnchorClick)

    return () => {
      root.removeEventListener('click', handleAnchorClick)
      context.revert()
    }
  }, [rootRef])
}
