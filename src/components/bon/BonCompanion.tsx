import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BonBookMode, BonState } from '@/lib/bon-domain'
import { cn } from '@/lib/utils'
import { usePreferences } from '@/services/preferences'
import { BonAvatar } from './BonAvatar'
import { playBonSound } from './bon-sound'

export type BonVariant = 'compact' | 'focus' | 'habitat' | 'wrap-up'

interface BonCompanionProps {
  actionLabel?: string
  book?: BonBookMode
  className?: string
  message?: string
  messageKey?: string
  onAction?: () => void
  state: BonState
  urgent?: boolean
  variant: BonVariant
}

const MICRO_STATES: BonState[] = ['curious', 'playful', 'happy']

export function BonCompanion({
  actionLabel,
  book,
  className,
  message,
  messageKey,
  onAction,
  state,
  urgent = false,
  variant,
}: BonCompanionProps) {
  const { t } = useTranslation()
  const { data: preferences } = usePreferences()
  const [dismissedKey, setDismissedKey] = useState<string | null>(null)
  const [inactiveNap, setInactiveNap] = useState(false)
  const [microState, setMicroState] = useState<BonState | null>(null)
  const [microMessage, setMicroMessage] = useState<string | null>(null)
  const interactionCount = useRef(0)
  const interactionTimer = useRef<number | null>(null)
  const previousSound = useRef<string | null>(null)

  const enabled = preferences?.buddy_enabled ?? true
  const proactiveMessages =
    preferences?.buddy_proactive_messages_enabled ?? true
  const reducedMotion = preferences?.buddy_reduced_motion ?? false
  const soundEnabled = preferences?.buddy_sound_enabled ?? false
  const effectiveState =
    microState ?? (inactiveNap && state === 'idle' ? 'napping' : state)
  const currentMessageKey = messageKey ?? message ?? null
  const contextualMessage =
    proactiveMessages && currentMessageKey !== dismissedKey ? message : null
  const visibleMessage = microMessage ?? contextualMessage

  useEffect(() => {
    if (!visibleMessage || urgent || microMessage) return
    const timer = window.setTimeout(() => {
      if (currentMessageKey) setDismissedKey(currentMessageKey)
    }, 7000)
    return () => window.clearTimeout(timer)
  }, [currentMessageKey, microMessage, urgent, visibleMessage])

  useEffect(() => {
    if (!enabled || !soundEnabled) return
    const sound = urgent
      ? 'urgent'
      : effectiveState === 'celebrate'
        ? 'celebrate'
        : null
    if (!sound) {
      previousSound.current = null
      return
    }
    if (previousSound.current === sound) return
    previousSound.current = sound
    playBonSound(sound)
  }, [effectiveState, enabled, soundEnabled, urgent])

  useEffect(() => {
    if (!enabled || urgent || state !== 'idle') {
      return
    }

    let inactivityTimer: number | null = null
    let wakeTimer: number | null = null
    const clearTimers = () => {
      if (inactivityTimer !== null) window.clearTimeout(inactivityTimer)
      if (wakeTimer !== null) window.clearTimeout(wakeTimer)
    }
    const scheduleNap = () => {
      clearTimers()
      inactivityTimer = window.setTimeout(() => {
        setInactiveNap(true)
        wakeTimer = window.setTimeout(() => {
          setInactiveNap(false)
          scheduleNap()
        }, 18_000)
      }, 180_000)
    }
    const handleActivity = () => {
      setInactiveNap(false)
      scheduleNap()
    }

    window.addEventListener('keydown', handleActivity)
    window.addEventListener('pointerdown', handleActivity)
    window.addEventListener('pointermove', handleActivity)
    scheduleNap()

    return () => {
      clearTimers()
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('pointerdown', handleActivity)
      window.removeEventListener('pointermove', handleActivity)
    }
  }, [enabled, state, urgent])

  useEffect(
    () => () => {
      if (interactionTimer.current !== null) {
        window.clearTimeout(interactionTimer.current)
      }
    },
    []
  )

  if (!enabled) return null

  const handleInteract = () => {
    interactionCount.current += 1
    const repeated = interactionCount.current >= 4
    setMicroState(
      repeated
        ? 'listening'
        : (MICRO_STATES[(interactionCount.current - 1) % MICRO_STATES.length] ??
            'curious')
    )
    setMicroMessage(repeated ? t('bon.interaction.understood') : null)

    if (interactionTimer.current !== null) {
      window.clearTimeout(interactionTimer.current)
    }
    interactionTimer.current = window.setTimeout(
      () => {
        setMicroState(null)
        setMicroMessage(null)
        interactionCount.current = 0
      },
      repeated ? 1800 : 1100
    )
  }

  return (
    <section
      className={cn('bon-companion', className)}
      data-urgent={urgent}
      data-variant={variant}
      aria-label={t('bon.regionLabel')}
    >
      <div className="bon-companion-stage">
        <BonAvatar
          ariaLabel={t('bon.interact')}
          book={book}
          onInteract={variant === 'focus' ? undefined : handleInteract}
          reducedMotion={reducedMotion}
          speaking={Boolean(visibleMessage)}
          state={effectiveState}
        />
      </div>

      {visibleMessage ? (
        <div
          className="bon-speech"
          role={urgent ? 'alert' : 'status'}
          aria-live={urgent ? 'assertive' : 'polite'}
        >
          <button
            type="button"
            className="bon-speech-dismiss"
            onClick={() => {
              setMicroMessage(null)
              if (currentMessageKey) setDismissedKey(currentMessageKey)
            }}
            aria-label={t('bon.dismiss')}
          >
            <X aria-hidden="true" />
          </button>
          <p>{visibleMessage}</p>
          {actionLabel && onAction && !microMessage ? (
            <button
              type="button"
              className="bon-speech-action"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
