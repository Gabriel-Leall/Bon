import {
  BellRing,
  CalendarDays,
  Check,
  CirclePause,
  Clock3,
  Coffee,
  Flame,
  Focus,
  PanelTopOpen,
  Play,
  Plus,
  RotateCcw,
  SunMedium,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const planningRows = ['focus', 'meeting', 'break', 'review'] as const
const habitRows = ['planning', 'water', 'reading'] as const
const eventRows = ['focus', 'reminder', 'habit', 'closure'] as const
const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export function WidgetsSection() {
  const { t } = useTranslation()

  return (
    <section
      id="recursos"
      className="capability-section"
      aria-label={t('landing.capabilities.ariaLabel')}
    >
      <div className="capability-row capability-row--top">
        <article className="capability-card capability-card--planning">
          <h2>{t('landing.capabilities.planning.title')}</h2>
          <div className="capability-planner">
            <header className="capability-planner-header">
              <div>
                <SunMedium aria-hidden="true" />
                <span>{t('landing.capabilities.planning.today')}</span>
              </div>
              <strong>{t('landing.capabilities.planning.date')}</strong>
              <span>{t('landing.capabilities.planning.load')}</span>
            </header>
            <ol className="capability-planner-list">
              {planningRows.map((row, index) => (
                <li key={row} className={`capability-planner-item capability-planner-item--${row}`}>
                  <time>{t(`landing.capabilities.planning.rows.${row}.time`)}</time>
                  <span className="capability-planner-track" aria-hidden="true" />
                  <div>
                    <strong>{t(`landing.capabilities.planning.rows.${row}.label`)}</strong>
                    <span>{t(`landing.capabilities.planning.rows.${row}.meta`)}</span>
                  </div>
                  {index === 0 ? <span className="capability-live-dot" aria-hidden="true" /> : null}
                </li>
              ))}
            </ol>
            <span className="capability-planner-add">
              <Plus aria-hidden="true" />
              {t('landing.capabilities.planning.add')}
            </span>
          </div>

          <aside
            className="capability-quick-capture"
            aria-label={t('landing.capabilities.planning.captureAria')}
          >
            <header>
              <span>
                <PanelTopOpen aria-hidden="true" />
                {t('landing.capabilities.planning.captureTitle')}
              </span>
              <kbd>{t('landing.capabilities.planning.captureShortcut')}</kbd>
            </header>
            <p>{t('landing.capabilities.planning.captureText')}</p>
            <footer>
              <span>{t('landing.capabilities.planning.captureType')}</span>
              <strong>
                <Check aria-hidden="true" />
                {t('landing.capabilities.planning.captureAction')}
              </strong>
            </footer>
          </aside>
        </article>

        <article className="capability-card capability-card--focus">
          <h2>{t('landing.capabilities.focus.title')}</h2>
          <div className="capability-focus-panel">
            <div className="capability-focus-header">
              <span>
                <Focus aria-hidden="true" />
                {t('landing.capabilities.focus.session')}
              </span>
              <span className="capability-focus-live">{t('landing.capabilities.focus.live')}</span>
            </div>
            <p>{t('landing.capabilities.focus.intent')}</p>
            <strong className="capability-focus-time">{t('landing.capabilities.focus.time')}</strong>
            <span className="capability-focus-cycle">{t('landing.capabilities.focus.cycle')}</span>
            <div className="capability-focus-controls" aria-hidden="true">
              <span><RotateCcw /></span>
              <span className="is-primary"><CirclePause /></span>
              <span><Play /></span>
            </div>
            <div className="capability-focus-context">
              <Clock3 aria-hidden="true" />
              <span>{t('landing.capabilities.focus.context')}</span>
            </div>
          </div>
        </article>
      </div>

      <div className="capability-row capability-row--bottom">
        <article className="capability-card capability-card--habits">
          <h2>{t('landing.capabilities.habits.title')}</h2>
          <div className="capability-habit-panel">
            <header>
              <span>
                <Flame aria-hidden="true" />
                {t('landing.capabilities.habits.week')}
              </span>
              <strong>{t('landing.capabilities.habits.progress')}</strong>
            </header>
            <div className="capability-habit-days" aria-hidden="true">
              {weekDays.map(day => (
                <span key={day}>{t(`landing.capabilities.habits.days.${day}`)}</span>
              ))}
            </div>
            <ul className="capability-habit-list">
              {habitRows.map((row, rowIndex) => (
                <li key={row}>
                  <div>
                    <span className={`capability-habit-marker capability-habit-marker--${row}`} aria-hidden="true" />
                    <strong>{t(`landing.capabilities.habits.rows.${row}.label`)}</strong>
                  </div>
                  <div className="capability-habit-checks" aria-hidden="true">
                    {Array.from({ length: 7 }, (_, dayIndex) => (
                      <span
                        key={dayIndex}
                        className={dayIndex < 5 - rowIndex || dayIndex === 6 ? 'is-done' : undefined}
                      >
                        {dayIndex < 5 - rowIndex || dayIndex === 6 ? <Check /> : null}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <p>
              <Coffee aria-hidden="true" />
              <span>{t('landing.capabilities.habits.note')}</span>
            </p>
          </div>
        </article>

        <article className="capability-card capability-card--events">
          <h2>{t('landing.capabilities.events.title')}</h2>
          <div className="capability-event-panel">
            <header className="capability-event-header">
              <span>{t('landing.capabilities.events.event')}</span>
              <span>{t('landing.capabilities.events.source')}</span>
              <span>{t('landing.capabilities.events.time')}</span>
              <span className="capability-event-status">
                <BellRing aria-hidden="true" />
                {t('landing.capabilities.events.live')}
              </span>
            </header>
            <ul className="capability-event-list">
              {eventRows.map(row => (
                <li key={row}>
                  <span className={`capability-event-icon capability-event-icon--${row}`} aria-hidden="true">
                    {row === 'focus' ? <Focus /> : row === 'reminder' ? <BellRing /> : row === 'habit' ? <Flame /> : <CalendarDays />}
                  </span>
                  <strong>{t(`landing.capabilities.events.rows.${row}.label`)}</strong>
                  <span>{t(`landing.capabilities.events.rows.${row}.source`)}</span>
                  <time>{t(`landing.capabilities.events.rows.${row}.time`)}</time>
                  <span className="capability-event-state">{t(`landing.capabilities.events.rows.${row}.state`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  )
}
