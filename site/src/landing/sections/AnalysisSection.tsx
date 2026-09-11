import {
  Activity,
  ArrowUpRight,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Focus,
  Gauge,
  MoonStar,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const signalRows = ['focusTime', 'tasksCompleted', 'focusSessions', 'activeDays'] as const
const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const taskActivity = [
  { day: 'mon', created: 2, completed: 3 },
  { day: 'tue', created: 1, completed: 4 },
  { day: 'wed', created: 3, completed: 3 },
  { day: 'thu', created: 2, completed: 5 },
  { day: 'fri', created: 2, completed: 4 },
  { day: 'sat', created: 1, completed: 2 },
  { day: 'sun', created: 1, completed: 3 },
] as const

const signalIcons = {
  focusTime: <Clock3 aria-hidden="true" />,
  tasksCompleted: <CheckCircle2 aria-hidden="true" />,
  focusSessions: <Focus aria-hidden="true" />,
  activeDays: <CalendarCheck2 aria-hidden="true" />,
} as const

export function AnalysisSection() {
  const { t } = useTranslation()

  return (
    <section id="analise" className="analytics-section">
      <div className="analytics-rings" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="analytics-heading">
        <h2>{t('landing.analytics.title')}</h2>
        <p>{t('landing.analytics.subtitle')}</p>
        <a className="analytics-link" href="#recursos">
          <span>{t('landing.analytics.cta')}</span>
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>

      <div className="analytics-stage" aria-label={t('landing.analytics.dashboardAria')}>
        <span className="analytics-demo-note">{t('landing.analytics.demoNote')}</span>
        <article className="metric-card metric-card--rhythm metric-card--side-left">
          <header className="metric-card-header">
            <div>
              <MoonStar aria-hidden="true" />
              <span>{t('landing.analytics.rhythm.title')}</span>
            </div>
            <span>{t('landing.analytics.period')}</span>
          </header>
          <div className="metric-rhythm-grid" aria-hidden="true">
            {Array.from({ length: 42 }, (_, index) => (
              <span
                key={index}
                className={
                  index % 9 === 0 || index % 7 === 3
                    ? 'is-strong'
                    : index % 4 === 0
                      ? 'is-medium'
                      : undefined
                }
              />
            ))}
          </div>
          <div className="metric-card-summary">
            <strong>{t('landing.analytics.rhythm.value')}</strong>
            <span>{t('landing.analytics.rhythm.caption')}</span>
          </div>
        </article>

        <div className="analytics-dashboard">
          <article className="metric-card metric-card--signals">
            <header className="metric-card-header">
              <div>
                <Activity aria-hidden="true" />
                <span>{t('landing.analytics.signals.title')}</span>
              </div>
              <span>{t('landing.analytics.period')}</span>
            </header>
            <dl className="metric-signal-list">
              {signalRows.map(row => (
                <div key={row}>
                  <dt>
                    <span className={`metric-signal-icon metric-signal-icon--${row}`}>
                      {signalIcons[row]}
                    </span>
                    {t(`landing.analytics.signals.rows.${row}.label`)}
                  </dt>
                  <dd>{t(`landing.analytics.signals.rows.${row}.value`)}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="metric-card metric-card--insight">
            <div className="metric-insight-copy">
              <header className="metric-card-header">
                <div>
                  <TrendingUp aria-hidden="true" />
                  <span>{t('landing.analytics.insight.title')}</span>
                </div>
                <span className="metric-insight-status">
                  {t('landing.analytics.insight.status')}
                </span>
              </header>
              <h3>{t('landing.analytics.insight.headline')}</h3>
              <p>{t('landing.analytics.insight.body')}</p>
              <div className="metric-insight-evidence">
                <div>
                  <span>
                    <TrendingUp aria-hidden="true" />
                    {t('landing.analytics.insight.supportedBy')}
                  </span>
                  <strong>{t('landing.analytics.insight.focusDepth')}</strong>
                  <small>{t('landing.analytics.insight.supportValue')}</small>
                </div>
                <div>
                  <span>
                    <TrendingDown aria-hidden="true" />
                    {t('landing.analytics.insight.needsAttention')}
                  </span>
                  <strong>{t('landing.analytics.insight.recovery')}</strong>
                  <small>{t('landing.analytics.insight.attentionValue')}</small>
                </div>
              </div>
            </div>

            <aside className="metric-score-card">
              <div className="metric-score-heading">
                <span>{t('landing.analytics.insight.scoreTitle')}</span>
                <Gauge aria-hidden="true" />
              </div>
              <div className="metric-score-ring">
                <svg
                  viewBox="0 0 140 140"
                  role="img"
                  aria-label={t('landing.analytics.insight.scoreAria')}
                >
                  <circle className="metric-score-track" cx="70" cy="70" r="52" pathLength="100" />
                  <circle className="metric-score-value" cx="70" cy="70" r="52" pathLength="100" />
                </svg>
                <div>
                  <strong>{t('landing.analytics.insight.scoreGrade')}</strong>
                  <span>{t('landing.analytics.insight.scoreValue')}</span>
                </div>
              </div>
              <p>{t('landing.analytics.insight.scoreCaption')}</p>
            </aside>
          </article>

          <article className="metric-card metric-card--activity">
            <header className="metric-card-header">
              <div>
                <CheckCircle2 aria-hidden="true" />
                <span>{t('landing.analytics.activity.title')}</span>
              </div>
              <div className="metric-activity-legend" aria-hidden="true">
                <span>{t('landing.analytics.activity.completed')}</span>
                <span>{t('landing.analytics.activity.created')}</span>
              </div>
            </header>
            <div className="metric-activity-content">
              <div className="metric-activity-chart">
                {taskActivity.map(item => (
                  <div
                    key={item.day}
                    role="img"
                    aria-label={t('landing.analytics.activity.pileAria', {
                      day: t(`landing.analytics.activity.days.${item.day}`),
                      created: item.created,
                      completed: item.completed,
                    })}
                  >
                    <span className="metric-activity-total">{item.created + item.completed}</span>
                    <span className="metric-activity-pile" aria-hidden="true">
                      {Array.from({ length: item.completed }, (_, index) => (
                        <span key={`completed-${index}`} className="is-completed" />
                      ))}
                      {Array.from({ length: item.created }, (_, index) => (
                        <span key={`created-${index}`} className="is-created" />
                      ))}
                    </span>
                    <small>{t(`landing.analytics.activity.days.${item.day}`)}</small>
                  </div>
                ))}
              </div>
              <div className="metric-activity-rate">
                <strong>{t('landing.analytics.activity.rate')}</strong>
                <span>{t('landing.analytics.activity.rateLabel')}</span>
              </div>
            </div>
          </article>

          <article className="metric-card metric-card--adjustment">
            <header className="metric-card-header">
              <div>
                <Target aria-hidden="true" />
                <span>{t('landing.analytics.adjustment.title')}</span>
              </div>
            </header>
            <div className="metric-adjustment-icon" aria-hidden="true">
              <MoonStar />
            </div>
            <p>{t('landing.analytics.adjustment.body')}</p>
            <span>{t('landing.analytics.adjustment.basis')}</span>
          </article>
        </div>

        <article className="metric-card metric-card--week metric-card--side-right">
          <header className="metric-card-header">
            <div>
              <CalendarDays aria-hidden="true" />
              <span>{t('landing.analytics.week.title')}</span>
            </div>
            <span>{t('landing.analytics.period')}</span>
          </header>
          <strong className="metric-week-score">{t('landing.analytics.week.value')}</strong>
          <span className="metric-week-delta">{t('landing.analytics.week.delta')}</span>
          <div className="metric-week-bars">
            {weekDays.map((day, index) => (
              <div key={day}>
                <span className={`metric-week-bar metric-week-bar--${index + 1}`} />
                <small>{t(`landing.analytics.week.days.${day}`)}</small>
              </div>
            ))}
          </div>
          <p>{t('landing.analytics.week.note')}</p>
        </article>
      </div>
    </section>
  )
}
