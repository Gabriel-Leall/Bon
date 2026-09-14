import { useTranslation } from 'react-i18next'
import './app-intro.css'

const MINI_BONS = Array.from({ length: 9 }, (_, index) => index + 1)

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
          {MINI_BONS.map(position => (
            <span
              className={`app-intro__mini app-intro__mini--${position}`}
              key={position}
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
