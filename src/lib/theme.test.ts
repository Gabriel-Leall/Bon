import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tauri-apps/api/app', () => ({
  setTheme: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

const { setTheme } = await import('@tauri-apps/api/app')
const { logger } = await import('@/lib/logger')
const {
  ACCENT_STORAGE_KEY,
  THEME_STORAGE_KEY,
  applyDocumentAppearance,
  applyStoredDocumentAppearance,
  normalizeAccentPreference,
  normalizeAppearancePreferences,
  normalizeThemePreference,
  persistStoredAppearance,
  readStoredAppearance,
  resolveThemePreference,
  syncNativeAppTheme,
  toTauriAppTheme,
} = await import('./theme')

describe('theme utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove(
      'light',
      'dark',
      'cream',
      'entardecer'
    )
    delete document.documentElement.dataset.axisThemeMode
    delete document.documentElement.dataset.axisAccent

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  it('normalizes current, legacy, and invalid appearance preferences', () => {
    for (const theme of ['light', 'dark', 'cream', 'system'] as const) {
      expect(normalizeThemePreference(theme)).toBe(theme)
    }
    expect(normalizeThemePreference('entardecer')).toBe('dark')
    expect(normalizeThemePreference('sepia')).toBe('system')
    expect(normalizeThemePreference(null)).toBe('system')

    for (const accent of ['blue', 'purple', 'red'] as const) {
      expect(normalizeAccentPreference(accent)).toBe(accent)
    }
    expect(normalizeAccentPreference('green')).toBe('blue')
    expect(normalizeAccentPreference(undefined)).toBe('blue')
    expect(normalizeAppearancePreferences(null)).toEqual({
      theme: 'system',
      accent: 'blue',
    })
  })

  it('resolves system only between light and dark while preserving cream', () => {
    expect(resolveThemePreference('system', false)).toBe('light')
    expect(resolveThemePreference('system', true)).toBe('dark')
    expect(resolveThemePreference('light', true)).toBe('light')
    expect(resolveThemePreference('dark', false)).toBe('dark')
    expect(resolveThemePreference('cream', true)).toBe('cream')
  })

  it('maps native chrome to light for cream and follows the OS for system', () => {
    expect(toTauriAppTheme('system')).toBeNull()
    expect(toTauriAppTheme('dark')).toBe('dark')
    expect(toTauriAppTheme('light')).toBe('light')
    expect(toTauriAppTheme('cream')).toBe('light')
  })

  it('applies surface theme and accent independently on the document root', () => {
    document.documentElement.classList.add('entardecer')

    const applied = applyDocumentAppearance({
      theme: 'cream',
      accent: 'purple',
    })

    expect(applied).toEqual({
      theme: 'cream',
      accent: 'purple',
      resolvedTheme: 'cream',
    })
    expect(document.documentElement.classList.contains('cream')).toBe(true)
    expect(document.documentElement.classList.contains('entardecer')).toBe(
      false
    )
    expect(document.documentElement.dataset.axisThemeMode).toBe('cream')
    expect(document.documentElement.dataset.axisAccent).toBe('purple')
  })

  it('falls back safely when applying invalid values', () => {
    const applied = applyDocumentAppearance({
      theme: 'sepia',
      accent: 'green',
    })

    expect(applied).toEqual({
      theme: 'system',
      accent: 'blue',
      resolvedTheme: 'light',
    })
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.dataset.axisAccent).toBe('blue')
  })

  it('persists, reads, and applies both appearance axes for window bootstrap', () => {
    persistStoredAppearance({ theme: 'dark', accent: 'red' })

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(localStorage.getItem(ACCENT_STORAGE_KEY)).toBe('red')
    expect(readStoredAppearance()).toEqual({ theme: 'dark', accent: 'red' })

    const applied = applyStoredDocumentAppearance()
    expect(applied.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.dataset.axisAccent).toBe('red')
  })

  it('normalizes legacy values when reading bootstrap storage', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'entardecer')
    localStorage.setItem(ACCENT_STORAGE_KEY, 'orange')

    expect(applyStoredDocumentAppearance()).toMatchObject({
      theme: 'dark',
      accent: 'blue',
    })
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(localStorage.getItem(ACCENT_STORAGE_KEY)).toBe('blue')
  })

  it('syncs native app theme through Tauri API', async () => {
    await syncNativeAppTheme('cream')

    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('fails safely when native theme sync is unavailable', async () => {
    vi.mocked(setTheme).mockRejectedValueOnce(new Error('unsupported'))

    await expect(syncNativeAppTheme('dark')).resolves.toBeUndefined()
    expect(logger.debug).toHaveBeenCalled()
  })
})
