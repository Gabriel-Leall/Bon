import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { emit } from '@tauri-apps/api/event'
import {
  ThemeProviderContext,
  type Accent,
  type Theme,
} from '@/lib/theme-context'
import type { AppearancePreferences, ResolvedTheme } from '@/lib/theme'
import { usePreferences } from '@/services/preferences'
import {
  ACCENT_STORAGE_KEY,
  APPEARANCE_CHANGED_EVENT,
  applyDocumentAppearance,
  normalizeAccentPreference,
  normalizeAppearancePreferences,
  normalizeThemePreference,
  persistStoredAppearance,
  resolveThemePreference,
  syncNativeAppTheme,
  THEME_STORAGE_KEY,
} from '@/lib/theme'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultAccent?: Accent
  storageKey?: string
  accentStorageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultAccent = 'blue',
  storageKey = THEME_STORAGE_KEY,
  accentStorageKey = ACCENT_STORAGE_KEY,
  ...props
}: ThemeProviderProps) {
  const [appearance, setAppearance] = useState<AppearancePreferences>(() =>
    normalizeAppearancePreferences({
      theme: localStorage.getItem(storageKey) ?? defaultTheme,
      accent: localStorage.getItem(accentStorageKey) ?? defaultAccent,
    })
  )
  const appearanceRef = useRef(appearance)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveThemePreference(
      appearance.theme,
      window.matchMedia('(prefers-color-scheme: dark)').matches
    )
  )

  const { data: preferences } = usePreferences()
  const hasSyncedPreferences = useRef(false)

  const commitAppearance = (nextAppearance: AppearancePreferences) => {
    appearanceRef.current = nextAppearance
    const appliedAppearance = applyDocumentAppearance(nextAppearance)
    persistStoredAppearance(
      nextAppearance,
      localStorage,
      storageKey,
      accentStorageKey
    )
    setResolvedTheme(appliedAppearance.resolvedTheme)
    setAppearance(nextAppearance)
    void emit(APPEARANCE_CHANGED_EVENT, nextAppearance)
  }

  // Persistent preferences are authoritative once their first load completes.
  useLayoutEffect(() => {
    if (!preferences || hasSyncedPreferences.current) return

    hasSyncedPreferences.current = true
    const nextAppearance = normalizeAppearancePreferences(preferences)
    appearanceRef.current = nextAppearance
    applyDocumentAppearance(nextAppearance)
    persistStoredAppearance(
      nextAppearance,
      localStorage,
      storageKey,
      accentStorageKey
    )
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time synchronization with persisted preferences
    setAppearance(nextAppearance)
    void emit(APPEARANCE_CHANGED_EVENT, nextAppearance)
  }, [accentStorageKey, preferences, storageKey])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyAppearance = () => {
      const appliedAppearance = applyDocumentAppearance(appearance)
      setResolvedTheme(appliedAppearance.resolvedTheme)
    }

    applyAppearance()

    if (appearance.theme !== 'system') return

    const handleChange = () => applyAppearance()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [appearance])

  useEffect(() => {
    void syncNativeAppTheme(appearance.theme)
  }, [appearance.theme])

  const value = {
    theme: appearance.theme,
    accent: appearance.accent,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      commitAppearance({
        ...appearanceRef.current,
        theme: normalizeThemePreference(theme),
      })
    },
    setAccent: (accent: Accent) => {
      commitAppearance({
        ...appearanceRef.current,
        accent: normalizeAccentPreference(accent),
      })
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
