import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Code2,
  Download,
  Focus,
  GitFork,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const githubUrl = 'https://github.com/Gabriel-Leall/axis-desktop'
const releasesUrl = `${githubUrl}/releases`

const navigation = [
  { href: '#privacidade', labelKey: 'landing.nav.privacy', external: false },
  { href: githubUrl, labelKey: 'landing.nav.github', external: true },
  { href: releasesUrl, labelKey: 'landing.nav.free', external: true },
] as const

export function LandingHeader() {
  const { t } = useTranslation()

  return (
    <header className="site-header">
      <a className="site-brand" href="#produto" aria-label={t('landing.brandAria')}>
        <img className="site-brand-icon" src="/BonIcon.png" alt="" />
        <span className="site-brand-name">{t('landing.brand')}</span>
      </a>

      <nav className="site-nav" aria-label={t('landing.nav.ariaLabel')}>
        <div className="site-nav-menu">
          <a className="site-nav-link" href="#produto" aria-haspopup="true">
            {t('landing.nav.product')}
            <ChevronDown aria-hidden="true" />
          </a>

          <div className="site-nav-mega site-nav-mega--product">
            <a className="nav-product-preview" href="#produto">
              <span className="nav-preview-heading">
                <CalendarDays aria-hidden="true" />
                <span>
                  <strong>{t('landing.megaMenu.product.day.title')}</strong>
                  <small>{t('landing.megaMenu.product.day.copy')}</small>
                </span>
              </span>
              <span className="nav-day-preview" aria-hidden="true">
                <i><b>09:00</b><span>{t('landing.megaMenu.product.day.focus')}</span></i>
                <i><b>11:30</b><span>{t('landing.megaMenu.product.day.meeting')}</span></i>
                <i><b>17:30</b><span>{t('landing.megaMenu.product.day.review')}</span></i>
              </span>
            </a>

            <a className="nav-product-preview" href="#recursos">
              <span className="nav-preview-heading">
                <Focus aria-hidden="true" />
                <span>
                  <strong>{t('landing.megaMenu.product.focus.title')}</strong>
                  <small>{t('landing.megaMenu.product.focus.copy')}</small>
                </span>
              </span>
              <span className="nav-focus-preview" aria-hidden="true">
                <span>42:18</span>
                <i><b /><b className="is-active" /><b /></i>
              </span>
            </a>

            <a className="nav-product-preview" href="#analise">
              <span className="nav-preview-heading">
                <BarChart3 aria-hidden="true" />
                <span>
                  <strong>{t('landing.megaMenu.product.analytics.title')}</strong>
                  <small>{t('landing.megaMenu.product.analytics.copy')}</small>
                </span>
              </span>
              <span className="nav-analytics-preview" aria-hidden="true">
                <i /><i /><i /><i /><i /><i /><i />
              </span>
            </a>
          </div>
        </div>

        <div className="site-nav-menu">
          <a className="site-nav-link" href="#recursos" aria-haspopup="true">
            {t('landing.nav.resources')}
            <ChevronDown aria-hidden="true" />
          </a>

          <div className="site-nav-mega site-nav-mega--resources">
            <a className="nav-resource-feature" href={githubUrl} target="_blank" rel="noreferrer">
              <Code2 aria-hidden="true" />
              <strong>{t('landing.megaMenu.resources.source.title')}</strong>
              <span>{t('landing.megaMenu.resources.source.copy')}</span>
              <code>github.com/Gabriel-Leall/axis-desktop</code>
            </a>
            <a
              className="nav-resource-feature"
              href={releasesUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Download aria-hidden="true" />
              <strong>{t('landing.megaMenu.resources.releases.title')}</strong>
              <span>{t('landing.megaMenu.resources.releases.copy')}</span>
              <span className="nav-release-preview">
                <Sparkles aria-hidden="true" />
                {t('landing.megaMenu.resources.releases.badge')}
              </span>
            </a>
            <div className="nav-resource-list">
              <span>{t('landing.megaMenu.resources.explore')}</span>
              <a href="#privacidade">
                <ShieldCheck aria-hidden="true" />
                <span>
                  <strong>{t('landing.megaMenu.resources.privacy.title')}</strong>
                  <small>{t('landing.megaMenu.resources.privacy.copy')}</small>
                </span>
              </a>
              <a href="#recursos">
                <Focus aria-hidden="true" />
                <span>
                  <strong>{t('landing.megaMenu.resources.features.title')}</strong>
                  <small>{t('landing.megaMenu.resources.features.copy')}</small>
                </span>
              </a>
            </div>
          </div>
        </div>

        {navigation.map(item => (
          <a
            key={`${item.href}-${item.labelKey}`}
            className="site-nav-link"
            href={item.href}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noreferrer' : undefined}
          >
            {t(item.labelKey)}
          </a>
        ))}
      </nav>

      <div className="site-actions">
        <a className="site-button site-button--github" href={githubUrl} target="_blank" rel="noreferrer">
          <GitFork aria-hidden="true" />
          <span>{t('landing.actions.github')}</span>
        </a>
        <a className="site-button site-button--download" href={releasesUrl} target="_blank" rel="noreferrer">
          <Download aria-hidden="true" />
          <span>{t('landing.actions.download')}</span>
        </a>
      </div>
    </header>
  )
}
