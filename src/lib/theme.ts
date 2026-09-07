import { setTheme as setAppTheme } from '@tauri-apps/api/app'
import type { Theme as TauriTheme } from '@tauri-apps/api/window'
import type { Accent, Theme } from '@/lib/theme-context'
import { logger } from '@/lib/logger'

export type ResolvedTheme = 'light' | 'dark' | 'cream'

export interface AppearancePreferences {
  theme: Theme
  accent: Accent
}

export const THEME_STORAGE_KEY = 'ui-theme'
export const ACCENT_STORAGE_KEY = 'ui-accent'
export const APPEARANCE_CHANGED_EVENT = 'appearance-changed'

const THEMES: readonly Theme[] = ['light', 'dark', 'cream', 'system']
const ACCENTS: readonly Accent[] = ['blue', 'purple', 'red']

export function normalizeThemePreference(value: unknown): Theme {
  if (value === 'entardecer') return 'dark'
  return THEMES.includes(value as Theme) ? (value as Theme) : 'system'
}

export function normalizeAccentPreference(value: unknown): Accent {
  return ACCENTS.includes(value as Accent) ? (value as Accent) : 'blue'
}

export function normalizeAppearancePreferences(
  value?: { theme?: unknown; accent?: unknown } | null
): AppearancePreferences {
  return {
    theme: normalizeThemePreference(value?.theme),
    accent: normalizeAccentPreference(value?.accent),
  }
}

export function readStoredAppearance(
  storage: Pick<Storage, 'getItem'> = window.localStorage,
  themeStorageKey = THEME_STORAGE_KEY,
  accentStorageKey = ACCENT_STORAGE_KEY
): AppearancePreferences {
  return normalizeAppearancePreferences({
    theme: storage.getItem(themeStorageKey),
    accent: storage.getItem(accentStorageKey),
  })
}

export function persistStoredAppearance(
  appearance: AppearancePreferences,
  storage: Pick<Storage, 'setItem'> = window.localStorage,
  themeStorageKey = THEME_STORAGE_KEY,
  accentStorageKey = ACCENT_STORAGE_KEY
): void {
  storage.setItem(themeStorageKey, appearance.theme)
  storage.setItem(accentStorageKey, appearance.accent)
}

export function resolveThemePreference(
  theme: Theme,
  prefersDark: boolean
): ResolvedTheme {
  if (theme === 'system') {
    return prefersDark ? 'dark' : 'light'
  }

  return theme
}

export function toTauriAppTheme(theme: Theme): TauriTheme | null {
  if (theme === 'cream') return 'light'
  return theme === 'system' ? null : theme
}

/**
 * Applies theme classes to the current document root and returns the resolved mode.
 */
export function applyDocumentTheme(themeValue: unknown): ResolvedTheme {
  const theme = normalizeThemePreference(themeValue)
  const root = window.document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolvedTheme = resolveThemePreference(theme, prefersDark)

  root.classList.remove('light', 'dark', 'entardecer', 'cream')
  root.classList.add(resolvedTheme)
  root.dataset.axisThemeMode = resolvedTheme

  return resolvedTheme
}

/** Applies the selected identity color independently from the surface theme. */
export function applyDocumentAccent(accentValue: unknown): Accent {
  const accent = normalizeAccentPreference(accentValue)
  window.document.documentElement.dataset.axisAccent = accent
  return accent
}

export function applyDocumentAppearance(
  value?: { theme?: unknown; accent?: unknown } | null
): AppearancePreferences & { resolvedTheme: ResolvedTheme } {
  const appearance = normalizeAppearancePreferences(value)

  return {
    ...appearance,
    resolvedTheme: applyDocumentTheme(appearance.theme),
    accent: applyDocumentAccent(appearance.accent),
  }
}

export function applyStoredDocumentAppearance(): AppearancePreferences & {
  resolvedTheme: ResolvedTheme
} {
  const appearance = readStoredAppearance()
  persistStoredAppearance(appearance)
  return applyDocumentAppearance(appearance)
}

/**
 * Sync native app chrome (titlebar/window controls) with current preference.
 */
export async function syncNativeAppTheme(themeValue: unknown): Promise<void> {
  const theme = normalizeThemePreference(themeValue)

  try {
    await setAppTheme(toTauriAppTheme(theme))
  } catch (error) {
    // Safe fallback for unsupported platforms or non-Tauri test environments.
    logger.debug('Native theme sync unavailable', { error, theme })
  }
}
