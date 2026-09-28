import {
  ChevronDown,
  Download,
  ExternalLink,
  Laptop2,
  Loader2,
} from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { releasesApiUrl, releasesUrl } from '../data'

type Platform = 'windows' | 'macos' | 'linux'

interface GitHubReleaseAsset {
  name: string
  browser_download_url: string
}

interface GitHubRelease {
  id: number
  name: string | null
  tag_name: string
  html_url: string
  assets: GitHubReleaseAsset[]
}

interface DownloadOption {
  platform: Platform
  label: string
  href: string | null
  assetName?: string
}

const platformLabels: Record<Platform, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
}

const assetMatchers: Record<Platform, RegExp[]> = {
  windows: [/\.exe$/i, /\.msi$/i],
  macos: [/\.dmg$/i, /\.pkg$/i, /\.app\.tar\.gz$/i, /\.app\.zip$/i],
  linux: [/\.appimage$/i, /\.deb$/i, /\.rpm$/i],
}

let releaseCache: GitHubRelease | null = null
let releaseRequest: Promise<GitHubRelease> | null = null
let releaseFetchedAt = 0
const releaseCacheTtl = 5 * 60 * 1000
interface ReleaseSnapshot {
  release: GitHubRelease | null
  status: 'loading' | 'ready' | 'error'
}
let releaseSnapshot: ReleaseSnapshot = { release: null, status: 'loading' }
const releaseListeners = new Set<() => void>()

async function fetchLatestRelease() {
  if (releaseRequest) {
    return releaseRequest
  }

  releaseRequest = fetch(releasesApiUrl, {
    cache: 'no-store',
    headers: { Accept: 'application/vnd.github+json' },
  })
    .then(async response => {
      if (!response.ok) {
        throw new Error(`GitHub releases request failed: ${response.status}`)
      }

      releaseCache = (await response.json()) as GitHubRelease
      releaseFetchedAt = Date.now()
      return releaseCache
    })
    .finally(() => {
      releaseRequest = null
    })

  return releaseRequest
}

function publishReleaseSnapshot(snapshot: ReleaseSnapshot) {
  releaseSnapshot = snapshot
  releaseListeners.forEach(listener => listener())
}

function loadLatestRelease() {
  if (releaseRequest) {
    return
  }

  if (releaseCache && Date.now() - releaseFetchedAt < releaseCacheTtl) {
    return
  }

  if (!releaseCache) {
    publishReleaseSnapshot({ release: null, status: 'loading' })
  }

  void fetchLatestRelease()
    .then(release => publishReleaseSnapshot({ release, status: 'ready' }))
    .catch(error => {
      console.error(error)
      if (releaseCache) {
        publishReleaseSnapshot({ release: releaseCache, status: 'ready' })
      } else {
        publishReleaseSnapshot({ release: null, status: 'error' })
      }
    })
}

function refreshLatestReleaseWhenVisible() {
  if (document.visibilityState === 'visible') {
    loadLatestRelease()
  }
}

function subscribeToRelease(listener: () => void) {
  releaseListeners.add(listener)
  if (releaseListeners.size === 1) {
    window.addEventListener('focus', refreshLatestReleaseWhenVisible)
    document.addEventListener(
      'visibilitychange',
      refreshLatestReleaseWhenVisible
    )
  }

  loadLatestRelease()

  return () => {
    releaseListeners.delete(listener)
    if (releaseListeners.size === 0) {
      window.removeEventListener('focus', refreshLatestReleaseWhenVisible)
      document.removeEventListener(
        'visibilitychange',
        refreshLatestReleaseWhenVisible
      )
    }
  }
}

function getReleaseSnapshot() {
  return releaseSnapshot
}

function WindowsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 4.6 10.6 3.5v8H3V4.6Zm8.7-1.25L21 2v9.5h-9.3V3.35ZM3 12.55h7.6v7.95L3 19.42v-6.87Zm8.7 0H21V22l-9.3-1.32v-8.13Z" />
    </svg>
  )
}

function LinuxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.1c-2.05 0-3.65 1.74-3.65 4 0 1.13.3 2.03.63 2.86-.7.76-1.1 1.82-1.36 3.08l-1.2 5.95c-.25 1.2.66 2.32 1.88 2.32h7.4c1.22 0 2.13-1.12 1.88-2.32l-1.2-5.95c-.26-1.26-.66-2.32-1.36-3.08.33-.83.63-1.73.63-2.86 0-2.26-1.6-4-3.65-4Zm-1.28 4.08c0-.45.32-.82.72-.82s.72.37.72.82-.32.82-.72.82-.72-.37-.72-.82Zm2.56 0c0-.45.32-.82.72-.82s.72.37.72.82-.32.82-.72.82-.72-.37-.72-.82ZM9.76 10.7c.58.4 1.3.61 2.24.61s1.66-.21 2.24-.61c.36.5.6 1.15.77 2.02l.95 4.68H8.04l.95-4.68c.17-.87.41-1.52.77-2.02Zm.62 4.08h3.24c.31 0 .56.25.56.56s-.25.56-.56.56h-3.24a.56.56 0 0 1 0-1.12Z" />
    </svg>
  )
}

function findAsset(release: GitHubRelease, platform: Platform) {
  for (const matcher of assetMatchers[platform]) {
    const asset = release.assets.find(item => matcher.test(item.name))
    if (asset) {
      return asset
    }
  }

  return undefined
}

function getDownloadOptions(release: GitHubRelease): DownloadOption[] {
  return (['windows', 'macos', 'linux'] as const).map(platform => {
    const asset = findAsset(release, platform)

    return {
      platform,
      label: platformLabels[platform],
      href: asset?.browser_download_url ?? null,
      assetName: asset?.name,
    }
  })
}

export function ReleaseDownloads({
  id,
  placement = 'hero',
}: {
  id?: string
  placement?: 'hero' | 'footer'
}) {
  const { t } = useTranslation()
  const { release, status } = useSyncExternalStore(
    subscribeToRelease,
    getReleaseSnapshot,
    getReleaseSnapshot
  )

  return (
    <div
      className={`release-downloads release-downloads--${placement}`}
      id={id}
    >
      {status === 'loading' ? (
        <div
          className="release-downloads-trigger is-loading"
          aria-live="polite"
        >
          <Loader2 className="release-downloads-spinner" aria-hidden="true" />
          {t('landing.downloads.loading')}
        </div>
      ) : status === 'error' || !release ? (
        <a className="release-downloads-trigger" href={releasesUrl}>
          <ExternalLink aria-hidden="true" />
          {t('landing.downloads.fallback')}
        </a>
      ) : (
        <details className="release-downloads-menu">
          <summary
            className="release-downloads-trigger"
            aria-label={t('landing.downloads.downloadLatestAria', {
              version: release.tag_name,
            })}
          >
            <Download aria-hidden="true" />
            <span className="release-downloads-copy">
              <strong>{t('landing.downloads.trigger')}</strong>
              <small>
                {t('landing.downloads.latestVersion', {
                  version: release.tag_name,
                })}
              </small>
            </span>
            <ChevronDown
              className="release-downloads-chevron"
              aria-hidden="true"
            />
          </summary>
          <div className="release-downloads-options">
            {getDownloadOptions(release).map(option => {
              const content = (
                <>
                  <span className="release-platform-icon">
                    {option.platform === 'windows' ? (
                      <WindowsIcon />
                    ) : option.platform === 'macos' ? (
                      <Laptop2 aria-hidden="true" />
                    ) : (
                      <LinuxIcon />
                    )}
                  </span>
                  <span>
                    <strong>{option.label}</strong>
                    <small>
                      {option.href
                        ? t(`landing.downloads.platforms.${option.platform}`)
                        : t('landing.downloads.unavailable', {
                            platform: option.label,
                          })}
                    </small>
                  </span>
                  {option.href ? (
                    <Download aria-hidden="true" />
                  ) : (
                    <span className="release-platform-unavailable-mark" aria-hidden="true">
                      —
                    </span>
                  )}
                </>
              )

              return option.href ? (
                <a
                  key={option.platform}
                  className="release-platform"
                  href={option.href}
                  title={option.assetName}
                  aria-label={t('landing.downloads.downloadAria', {
                    platform: option.label,
                    release: release.tag_name,
                  })}
                >
                  {content}
                </a>
              ) : (
                <div
                  key={option.platform}
                  className="release-platform is-unavailable"
                  title={t('landing.downloads.unavailable', {
                    platform: option.label,
                  })}
                  role="group"
                  aria-disabled="true"
                >
                  {content}
                </div>
              )
            })}
          </div>
        </details>
      )}
    </div>
  )
}
