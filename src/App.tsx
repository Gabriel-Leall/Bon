import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { check } from '@tauri-apps/plugin-updater'
import { initializeCommandSystem } from './lib/commands'
import { buildAppMenu, setupMenuLanguageListener } from './lib/menu'
import { initializeLanguage } from './i18n/language-init'
import { logger } from './lib/logger'
import { cleanupOldFiles } from './lib/recovery'
import { commands } from './lib/tauri-bindings'
import { useGoogleStore } from './store/google-store'
import { useOnboardingStore } from './store/onboarding-store'
import { useUIStore } from './store/ui-store'
import { useDailyPlanStore } from './store/daily-plan-store'
import i18n from './i18n/config'
import './App.css'
import { ThemeProvider } from './components/ThemeProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { TooltipProvider } from './components/ui/tooltip'
import { useSquareCornersEffect } from './hooks/useSquareCornersEffect'
import { Toaster } from './components/ui/sonner'
import { notifications } from './lib/notifications'
import { recordProductUsage } from './lib/product-usage'
import { AppIntro } from './components/app-intro/AppIntro'

const MainWindow = lazy(() =>
  import('./components/layout/MainWindow').then(module => ({
    default: module.MainWindow,
  }))
)
const OnboardingPage = lazy(() =>
  import('./pages/onboarding/OnboardingPage').then(module => ({
    default: module.OnboardingPage,
  }))
)

function AppSurfaceReady({
  children,
  onReady,
}: {
  children: ReactNode
  onReady: () => void
}) {
  useEffect(() => {
    onReady()
  }, [onReady])

  return children
}

function App() {
  useSquareCornersEffect()
  const [surfaceReady, setSurfaceReady] = useState(false)
  const [introExiting, setIntroExiting] = useState(false)
  const [introDone, setIntroDone] = useState(false)

  const hasCompletedOnboarding = useOnboardingStore(state => state.hasCompleted)
  const initializeTodayPlan = useDailyPlanStore(
    state => state.initializeTodayPlan
  )
  const syncCurrentDate = useDailyPlanStore(state => state.syncCurrentDate)

  useEffect(() => {
    if (!surfaceReady || introExiting) return

    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )
    let reducedMotionTimer: number | undefined
    const finishWithoutMotion = () => {
      window.clearTimeout(reducedMotionTimer)
      if (motionPreference.matches) {
        reducedMotionTimer = window.setTimeout(() => setIntroExiting(true), 120)
      }
    }

    finishWithoutMotion()
    motionPreference.addEventListener?.('change', finishWithoutMotion)
    const fallbackTimer = window.setTimeout(() => setIntroExiting(true), 6000)

    return () => {
      window.clearTimeout(reducedMotionTimer)
      window.clearTimeout(fallbackTimer)
      motionPreference.removeEventListener?.('change', finishWithoutMotion)
    }
  }, [introExiting, surfaceReady])

  useEffect(() => {
    if (!introExiting) return

    const timer = window.setTimeout(() => setIntroDone(true), 240)
    return () => window.clearTimeout(timer)
  }, [introExiting])

  useEffect(() => {
    if (!introDone || hasCompletedOnboarding) return
    document.getElementById('initial-focus-task')?.focus()
  }, [hasCompletedOnboarding, introDone])

  // Initialize command system and cleanup on app startup
  useEffect(() => {
    logger.info('🚀 Frontend application starting up')
    void recordProductUsage('app_opened')
    initializeCommandSystem()
    logger.debug('Command system initialized')

    // Initialize language based on saved preference or system locale
    const initLanguageAndMenu = async () => {
      try {
        // Load preferences to get saved language
        const result = await commands.loadPreferences()
        const savedLanguage =
          result.status === 'ok' ? result.data.language : null

        // Initialize language (will use system locale if no preference)
        await initializeLanguage(savedLanguage)

        // Build the application menu with the initialized language
        await buildAppMenu()
        logger.debug('Application menu built')
        setupMenuLanguageListener()
      } catch (error) {
        logger.warn('Failed to initialize language or menu', { error })
      }
    }

    initLanguageAndMenu()

    const backgroundStartupTimer = window.setTimeout(() => {
      // Initialize integration stores after the first render path is interactive.
      void useGoogleStore.getState().initialize()

      cleanupOldFiles().catch(error => {
        logger.warn('Failed to cleanup old recovery files', { error })
      })
    }, 1200)

    // Example of logging with context
    logger.info('App environment', {
      isDev: import.meta.env.DEV,
      mode: import.meta.env.MODE,
    })

    // Auto-updater logic - check for updates 5 seconds after app loads
    const checkForUpdates = async () => {
      try {
        const update = await check()
        if (update) {
          logger.info(`Update available: ${update.version}`)
          notifications.info(
            i18n.t('updates.availableTitle'),
            i18n.t('updates.availableDescription', { version: update.version })
          )
          useUIStore.getState().setPreferencesOpen(true, 'updates')
        }
      } catch (checkError) {
        logger.error(`Update check failed: ${String(checkError)}`)
        // Silent fail for update checks - don't bother user with network issues
      }
    }

    // Check for updates 5 seconds after app loads
    const updateTimer = setTimeout(checkForUpdates, 5000)
    return () => {
      clearTimeout(backgroundStartupTimer)
      clearTimeout(updateTimer)
    }
  }, [])

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      return
    }

    void initializeTodayPlan()

    const dateSyncTimer = window.setInterval(() => {
      void syncCurrentDate()
    }, 60_000)

    return () => {
      window.clearInterval(dateSyncTimer)
    }
  }, [hasCompletedOnboarding, initializeTodayPlan, syncCurrentDate])

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider delayDuration={300}>
          <div
            aria-hidden={!introDone}
            className="h-screen w-full"
            inert={!introDone}
          >
            <Suspense fallback={null}>
              <AppSurfaceReady onReady={() => setSurfaceReady(true)}>
                {hasCompletedOnboarding ? <MainWindow /> : <OnboardingPage />}
              </AppSurfaceReady>
            </Suspense>
          </div>
          {!introDone && (
            <AppIntro
              exiting={introExiting}
              onCycleComplete={() => {
                if (surfaceReady) setIntroExiting(true)
              }}
            />
          )}
          <Toaster position="bottom-right" closeButton />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
