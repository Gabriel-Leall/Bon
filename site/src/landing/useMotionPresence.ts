import { useEffect, useRef, useState } from 'react'

export function useMotionPresence<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [isMotionActive, setIsMotionActive] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let isIntersecting = false
    const syncMotion = () =>
      setIsMotionActive(isIntersecting && document.visibilityState === 'visible')

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting
        syncMotion()
      },
      { threshold: 0.12 }
    )

    observer.observe(element)
    document.addEventListener('visibilitychange', syncMotion)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', syncMotion)
    }
  }, [])

  return { ref, isMotionActive }
}
