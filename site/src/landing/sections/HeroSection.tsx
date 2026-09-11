import {
  ArrowDownRight,
  CalendarDays,
  Check,
  CirclePause,
  Clock3,
  Coffee,
  HardDrive,
  Laptop2,
  Play,
  ShieldCheck,
  TimerReset,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ReleaseDownloads } from '../components/ReleaseDownloads'
import { useMotionPresence } from '../useMotionPresence'

const timelineItems = [
  { timeKey: 'planning.time', labelKey: 'planning.label', icon: CalendarDays },
  { timeKey: 'focus.time', labelKey: 'focus.label', icon: Play },
  { timeKey: 'pause.time', labelKey: 'pause.label', icon: Coffee },
  { timeKey: 'meeting.time', labelKey: 'meeting.label', icon: Clock3 },
  { timeKey: 'review.time', labelKey: 'review.label', icon: Check },
] as const

const sessionRows = [
  { key: 'active', icon: CirclePause, active: true },
  { key: 'next', icon: TimerReset, active: false },
  { key: 'completed', icon: Check, active: false },
] as const

const trustItems = [
  { key: 'local', icon: HardDrive },
  { key: 'private', icon: ShieldCheck },
  { key: 'desktop', icon: Laptop2 },
] as const

export function HeroSection() {
  const { t } = useTranslation()
  const { ref: productRef, isMotionActive } =
    useMotionPresence<HTMLDivElement>()

  return (
    <section id="produto" className="hero-section">
      <div className="hero-copy">
        <h1 className="hero-title">
          <span>{t('landing.hero.titleLineOne')}</span>
          <span>{t('landing.hero.titleLineTwo')}</span>
        </h1>
        <p className="hero-subtitle">{t('landing.hero.subtitle')}</p>
        <div className="hero-actions">
          <ReleaseDownloads />
          <a className="site-button site-button--quiet" href="#analise">
            <span>{t('landing.hero.secondaryCta')}</span>
            <ArrowDownRight aria-hidden="true" />
          </a>
        </div>
      </div>

      <div
        ref={productRef}
        className={`hero-product${isMotionActive ? ' is-motion-active' : ''}`}
        aria-label={t('landing.hero.proofAria')}
      >
        <aside className="hero-timeline">
          <div className="hero-timeline-header">
            <span className="hero-timeline-mark" aria-hidden="true">
              <CalendarDays />
            </span>
            <div>
              <strong>{t('landing.hero.timeline.title')}</strong>
              <span>{t('landing.hero.timeline.date')}</span>
            </div>
            <span className="hero-timeline-now">
              {t('landing.hero.timeline.now')}
            </span>
          </div>
          <ol className="hero-timeline-list">
            {timelineItems.map(item => {
              const Icon = item.icon
              return (
                <li key={item.timeKey} className="hero-timeline-item">
                  <time>
                    {t(`landing.hero.timeline.items.${item.timeKey}`)}
                  </time>
                  <span className="hero-timeline-node" aria-hidden="true">
                    <Icon />
                  </span>
                  <span>
                    {t(`landing.hero.timeline.items.${item.labelKey}`)}
                  </span>
                </li>
              )
            })}
          </ol>
        </aside>

        <div className="hero-session-stack">
          {sessionRows.map(row => {
            const Icon = row.icon
            return (
              <article
                key={row.key}
                className={`hero-session-card hero-session-card--${row.key}${row.active ? ' is-active' : ''}`}
              >
                <span className="hero-session-icon" aria-hidden="true">
                  <Icon />
                </span>
                <div className="hero-session-copy">
                  <strong>{t(`landing.hero.sessions.${row.key}.title`)}</strong>
                  <span>{t(`landing.hero.sessions.${row.key}.meta`)}</span>
                </div>
                <span className="hero-session-duration">
                  {t(`landing.hero.sessions.${row.key}.duration`)}
                </span>
                <span className="hero-session-status">
                  {t(`landing.hero.sessions.${row.key}.status`)}
                </span>
              </article>
            )
          })}
        </div>

        <aside
          className="hero-code"
          aria-label={t('landing.hero.code.ariaLabel')}
        >
          <div className="hero-code-header">
            <span className="hero-code-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>{t('landing.hero.code.file')}</span>
          </div>
          <code className="hero-code-body">
            <span className="hero-code-line">
              <b>{t('landing.hero.code.sessionLabel')}</b> {'{'}
            </span>
            <span className="hero-code-line hero-code-line--indent">
              {t('landing.hero.code.intentKey')}:{' '}
              <em>{t('landing.hero.code.intentValue')}</em>,
            </span>
            <span className="hero-code-line hero-code-line--indent">
              {t('landing.hero.code.modeKey')}:{' '}
              <em>{t('landing.hero.code.modeValue')}</em>,
            </span>
            <span className="hero-code-line hero-code-line--indent">
              {t('landing.hero.code.durationKey')}: <strong>50</strong>,
            </span>
            <span className="hero-code-line hero-code-line--indent">
              {t('landing.hero.code.storageKey')}:{' '}
              <em>{t('landing.hero.code.storageValue')}</em>
            </span>
            <span className="hero-code-line">{'}'}</span>
          </code>
          <p className="hero-code-note">
            <ShieldCheck aria-hidden="true" />
            <span>{t('landing.hero.code.note')}</span>
          </p>
        </aside>
      </div>

      <div className="hero-trust-list">
        {trustItems.map(item => {
          const Icon = item.icon
          return (
            <span key={item.key} className="hero-trust-item">
              <Icon aria-hidden="true" />
              {t(`landing.hero.trust.${item.key}`)}
            </span>
          )
        })}
      </div>
    </section>
  )
}
