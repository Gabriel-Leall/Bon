import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import './app-intro.css'

const MINI_BONS = [
  [-42, -42],
  [0, -42],
  [42, -42],
  [-42, 0],
  [0, 0],
  [42, 0],
  [-42, 42],
  [0, 42],
  [42, 42],
] as const

export function AppIntro({
  exiting,
  onCycleComplete,
}: {
  exiting: boolean
  onCycleComplete: () => void
}) {
  const { t } = useTranslation()

  return (
    <div
      aria-label={t('app.opening')}
      className="app-intro"
      data-exiting={exiting}
      role="status"
    >
      <div className="app-intro__content">
        <div className="app-intro__stage" aria-hidden="true">
          <img
            className="app-intro__bon"
            src="/bon/bon-approved.png"
            alt=""
            draggable={false}
            onAnimationIteration={onCycleComplete}
          />
          {MINI_BONS.map(([x, y], index) => (
            <span
              className="app-intro__mini"
              key={`${x}-${y}`}
              style={
                {
                  '--mini-x': `${x}px`,
                  '--mini-y': `${y}px`,
                  '--mini-delay': `${index * -73}ms`,
                } as CSSProperties
              }
            >
              <img src="/bon/bon-approved.png" alt="" draggable={false} />
            </span>
          ))}
        </div>
        <p className="app-intro__name">Bon</p>
      </div>
    </div>
  )
}
