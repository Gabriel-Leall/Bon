import { useTranslation } from 'react-i18next'
import { ReleaseDownloads } from '../components/ReleaseDownloads'

const githubUrl = 'https://github.com/Gabriel-Leall/axis-desktop'

export function LandingFooter() {
  const { t } = useTranslation()

  const links = [
    { href: '#produto', key: 'product' },
    { href: '#recursos', key: 'features' },
    { href: '#analise', key: 'analysis' },
    { href: '#privacidade', key: 'privacy' },
  ] as const

  return (
    <footer className="site-footer">
      <div className="footer-cta" aria-labelledby="footer-cta-title">
        <img className="footer-cta-icon" src="/BonIcon.png" alt="" />
        <h2 id="footer-cta-title">{t('landing.footer.title')}</h2>
        <p>{t('landing.footer.copy')}</p>
        <ReleaseDownloads placement="footer" />
      </div>

      <div className="footer-bar">
        <a className="site-brand footer-brand" href="#produto">
          <img className="site-brand-icon" src="/BonIcon.png" alt="" />
          <span>{t('landing.brand')}</span>
        </a>
        <nav className="footer-links" aria-label={t('landing.footer.navAria')}>
          {links.map(link => (
            <a key={link.key} href={link.href}>
              {t(`landing.footer.links.${link.key}`)}
            </a>
          ))}
          <a href={githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
        <span className="footer-meta">{t('landing.footer.meta')}</span>
      </div>
    </footer>
  )
}
