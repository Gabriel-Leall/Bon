import {
  BarChart3,
  CalendarDays,
  CheckSquare2,
  Clock3,
  Focus,
  NotebookPen,
  Repeat2,
  SunMedium,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const productSignals = [
  { key: 'today', icon: SunMedium },
  { key: 'tasks', icon: CheckSquare2 },
  { key: 'calendar', icon: CalendarDays },
  { key: 'focus', icon: Focus },
  { key: 'habits', icon: Repeat2 },
  { key: 'analysis', icon: BarChart3 },
  { key: 'notes', icon: NotebookPen },
  { key: 'closure', icon: Clock3 },
] as const

export function ClaritySection() {
  const { t } = useTranslation()

  return (
    <section className="proof-section" aria-labelledby="proof-title">
      <div className="proof-divider">
        <div className="proof-divider-bridge">
          <svg
            viewBox="0 0 420 48"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 47.5c24 0 30-46 62-46h296c32 0 38 46 62 46" />
          </svg>
          <h2 id="proof-title" className="proof-label">
            {t('landing.proof.title')}
          </h2>
        </div>
      </div>
      <div className="proof-grid">
        {productSignals.map(signal => {
          const Icon = signal.icon
          return (
            <div key={signal.key} className="proof-mark">
              <Icon aria-hidden="true" />
              <span>{t(`landing.proof.items.${signal.key}`)}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
