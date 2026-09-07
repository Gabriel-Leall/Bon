import { act, render, screen, waitFor } from '@testing-library/react'
import { emit } from '@tauri-apps/api/event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from '@/hooks/use-theme'
import { usePreferences } from '@/services/preferences'
import { APPEARANCE_CHANGED_EVENT } from '@/lib/theme'
import { ThemeProvider } from './ThemeProvider'

vi.mock('@/services/preferences', () => ({
  usePreferences: vi.fn(),
}))

function AppearanceProbe() {
  const { accent, resolvedTheme, setAccent, setTheme, theme } = useTheme()

  return (
    <div>
      <output data-testid="appearance">
        {theme}/{accent}/{resolvedTheme}
      </output>
      <button type="button" onClick={() => setTheme('dark')}>
        dark
      </button>
      <button type="button" onClick={() => setAccent('red')}>
        red
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('light', 'dark', 'cream')
    delete document.documentElement.dataset.axisThemeMode
    delete document.documentElement.dataset.axisAccent
    vi.mocked(usePreferences).mockReturnValue({ data: undefined } as never)
  })

  it('bootstraps a normalized legacy preference without exposing the old theme', async () => {
    localStorage.setItem('ui-theme', 'entardecer')

    render(
      <ThemeProvider>
        <AppearanceProbe />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('appearance')).toHaveTextContent(
        'dark/blue/dark'
      )
    })
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('entardecer')).toBe(
      false
    )
  })

  it('treats persisted preferences as authoritative and emits both axes', async () => {
    vi.mocked(usePreferences).mockReturnValue({
      data: { theme: 'cream', accent: 'purple' },
    } as never)

    render(
      <ThemeProvider>
        <AppearanceProbe />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('appearance')).toHaveTextContent(
        'cream/purple/cream'
      )
    })
    expect(localStorage.getItem('ui-theme')).toBe('cream')
    expect(localStorage.getItem('ui-accent')).toBe('purple')
    expect(emit).toHaveBeenCalledWith(APPEARANCE_CHANGED_EVENT, {
      theme: 'cream',
      accent: 'purple',
    })
  })

  it('updates and broadcasts theme and accent independently', async () => {
    render(
      <ThemeProvider>
        <AppearanceProbe />
      </ThemeProvider>
    )

    await act(async () => {
      screen.getByRole('button', { name: 'dark' }).click()
      screen.getByRole('button', { name: 'red' }).click()
    })

    expect(screen.getByTestId('appearance')).toHaveTextContent('dark/red/dark')
    expect(localStorage.getItem('ui-theme')).toBe('dark')
    expect(localStorage.getItem('ui-accent')).toBe('red')
    expect(emit).toHaveBeenCalledWith(APPEARANCE_CHANGED_EVENT, {
      theme: 'dark',
      accent: 'red',
    })
  })
})
