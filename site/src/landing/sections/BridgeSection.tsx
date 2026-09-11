import {
  Bell,
  CalendarDays,
  CalendarClock,
  Check,
  ChevronDown,
  Command,
  Focus,
  GitPullRequest,
  HardDrive,
  ListChecks,
  NotebookPen,
  PlugZap,
  Plus,
  ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMotionPresence } from '../useMotionPresence'

const benefits: { key: string; icon: LucideIcon }[] = [
  { key: 'device', icon: HardDrive },
  { key: 'shortcuts', icon: Command },
  { key: 'integrations', icon: PlugZap },
]

const reminderOptions = ['atTime', 'tenMinutes', 'oneHour'] as const
const integrationRows: { key: string; icon: LucideIcon }[] = [
  { key: 'calendar', icon: CalendarDays },
  { key: 'github', icon: GitPullRequest },
  { key: 'axis', icon: Focus },
]
const localRows: { key: string; icon: LucideIcon }[] = [
  { key: 'task', icon: ListChecks },
  { key: 'focus', icon: Focus },
  { key: 'note', icon: NotebookPen },
]

export function BridgeSection() {
  const { t } = useTranslation()
  const { ref, isMotionActive } = useMotionPresence<HTMLElement>()

  return (
    <>
      <section className="ownership-intro">
        <div className="ownership-copy">
          <h2>{t('landing.ownership.title')}</h2>
          <a className="ownership-link" href="#privacidade">
            <span>{t('landing.ownership.cta')}</span>
            <Plus aria-hidden="true" />
          </a>
        </div>
        <p>{t('landing.ownership.copy')}</p>
      </section>

      <section
        ref={ref}
        id="privacidade"
        className={`control-section${isMotionActive ? ' is-motion-active' : ''}`}
        aria-labelledby="config-title"
      >
        <div className="config-stage">
          <div className="config-scene config-scene--capture">
            <article className="config-dialog">
              <header className="config-dialog-header">
                <div>
                  <span className="config-dialog-icon" aria-hidden="true">
                    <Plus />
                  </span>
                  <div>
                    <h2 id="config-title">{t('landing.config.title')}</h2>
                    <p>{t('landing.config.subtitle')}</p>
                  </div>
                </div>
                <span className="config-dialog-status">
                  <ShieldCheck aria-hidden="true" />
                  {t('landing.config.local')}
                </span>
              </header>

              <div className="config-form">
                <label className="config-field config-field--wide">
                  <span>{t('landing.config.fields.action')}</span>
                  <span
                    className="config-input"
                    role="textbox"
                    aria-label={t('landing.config.fields.action')}
                    aria-readonly="true"
                  >
                    <span className="config-typewriter">{t('landing.config.values.action')}</span>
                    <span className="config-caret" aria-hidden="true" />
                  </span>
                </label>
                <label className="config-field">
                  <span>{t('landing.config.fields.type')}</span>
                  <span className="config-select">
                    {t('landing.config.values.type')}
                    <ChevronDown aria-hidden="true" />
                  </span>
                </label>
                <label className="config-field">
                  <span>{t('landing.config.fields.when')}</span>
                  <span className="config-select">
                    {t('landing.config.values.when')}
                    <CalendarClock aria-hidden="true" />
                  </span>
                </label>
                <label className="config-field">
                  <span>{t('landing.config.fields.duration')}</span>
                  <span className="config-select">
                    {t('landing.config.values.duration')}
                    <ChevronDown aria-hidden="true" />
                  </span>
                </label>
              </div>

              <div className="config-dialog-footer">
                <span className="config-reminder-trigger">
                  <Bell aria-hidden="true" />
                  {t('landing.config.reminder.trigger')}
                </span>
                <div className="config-dialog-actions">
                  <span>{t('landing.config.cancel')}</span>
                  <span className="site-button site-button--primary">
                    <Check aria-hidden="true" />
                    {t('landing.config.create')}
                  </span>
                </div>
              </div>
            </article>

            <aside className="config-popover" aria-label={t('landing.config.reminder.ariaLabel')}>
              <header>
                <Bell aria-hidden="true" />
                <div>
                  <strong>{t('landing.config.reminder.title')}</strong>
                  <span>{t('landing.config.reminder.subtitle')}</span>
                </div>
              </header>
              <ul>
                {reminderOptions.map(option => (
                  <li key={option} className={option === 'tenMinutes' ? 'is-selected' : undefined}>
                    <span>{t(`landing.config.reminder.options.${option}`)}</span>
                    {option === 'tenMinutes' ? <Check aria-hidden="true" /> : null}
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          <article className="config-scene config-scene--integrations" aria-hidden="true">
            <div className="config-data-panel">
              <header className="config-data-title">
                <span>
                  <PlugZap />
                  {t('landing.config.scenes.integrations.title')}
                </span>
                <strong>{t('landing.config.scenes.integrations.status')}</strong>
              </header>
              <div className="config-data-columns" aria-hidden="true">
                <span>{t('landing.config.scenes.integrations.columns.event')}</span>
                <span>{t('landing.config.scenes.integrations.columns.source')}</span>
                <span>{t('landing.config.scenes.integrations.columns.time')}</span>
                <span>{t('landing.config.scenes.integrations.columns.state')}</span>
              </div>
              <ol className="config-data-list">
                {integrationRows.map(({ key, icon: Icon }) => (
                  <li key={key} className={`config-data-row config-data-row--${key}`}>
                    <span className="config-data-event">
                      <Icon aria-hidden="true" />
                      {t(`landing.config.scenes.integrations.rows.${key}.event`)}
                    </span>
                    <span>{t(`landing.config.scenes.integrations.rows.${key}.source`)}</span>
                    <time>{t(`landing.config.scenes.integrations.rows.${key}.time`)}</time>
                    <strong>{t(`landing.config.scenes.integrations.rows.${key}.state`)}</strong>
                  </li>
                ))}
              </ol>
            </div>
          </article>

          <article className="config-scene config-scene--local" aria-hidden="true">
            <div className="config-local-panel">
              <header className="config-data-title">
                <span>
                  <HardDrive />
                  {t('landing.config.scenes.local.title')}
                </span>
                <strong>{t('landing.config.scenes.local.status')}</strong>
              </header>
              <ol className="config-record-list">
                {localRows.map(({ key, icon: Icon }) => (
                  <li key={key}>
                    <span className="config-record-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{t(`landing.config.scenes.local.rows.${key}.title`)}</strong>
                      <span>{t(`landing.config.scenes.local.rows.${key}.meta`)}</span>
                    </div>
                    <time>{t(`landing.config.scenes.local.rows.${key}.time`)}</time>
                    <span className="config-record-state">
                      <ShieldCheck aria-hidden="true" />
                      {t('landing.config.scenes.local.saved')}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </article>

        </div>

        <div className="benefit-grid">
          {benefits.map(benefit => {
            const Icon = benefit.icon
            return (
              <article key={benefit.key} className={`benefit-card benefit-card--${benefit.key}`}>
                <div className="benefit-heading">
                  <Icon aria-hidden="true" />
                  <h3>{t(`landing.benefits.${benefit.key}.title`)}</h3>
                </div>
                <p>{t(`landing.benefits.${benefit.key}.description`)}</p>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
