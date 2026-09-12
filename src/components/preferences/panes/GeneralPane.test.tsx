import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n/config'
import { render, screen, waitFor } from '@/test/test-utils'
import { useTheme } from '@/hooks/use-theme'
import { usePreferences, useSavePreferences } from '@/services/preferences'
import { GeneralPane } from './GeneralPane'

const setTheme = vi.fn()
const setAccent = vi.fn()
const savePreferences = vi.fn()

vi.mock('@/hooks/use-theme', () => ({
  useTheme: vi.fn(),
}))

vi.mock('@/services/preferences', () => ({
  usePreferences: vi.fn(),
  useSavePreferences: vi.fn(),
}))

vi.mock('@tauri-apps/plugin-autostart', () => ({
  disable: vi.fn().mockResolvedValue(undefined),
  enable: vi.fn().mockResolvedValue(undefined),
  isEnabled: vi.fn().mockResolvedValue(false),
}))

vi.mock('@/lib/tauri-bindings', () => ({
  commands: {
    getDefaultQuickPaneShortcut: vi
      .fn()
      .mockResolvedValue('CommandOrControl+Shift+.'),
    updateQuickPaneShortcut: vi
      .fn()
      .mockResolvedValue({ status: 'ok', data: null }),
  },
}))

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
})

describe('GeneralPane theme selection', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('pt-BR')
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      accent: 'blue',
      resolvedTheme: 'dark',
      setTheme,
      setAccent,
    })
    vi.mocked(usePreferences).mockReturnValue({
      data: {
        theme: 'dark',
        accent: 'blue',
        quick_pane_shortcut: null,
        language: 'pt-BR',
        minimize_to_tray: false,
        start_of_week: 'monday',
        daily_reset_time: '00:00',
        adaptive_dashboard_mode: 'full',
        notes_vault_path: null,
        daily_wrap_up_reminder_enabled: false,
        daily_wrap_up_reminder_time: '18:00',
        buddy_enabled: true,
        buddy_proactive_messages_enabled: true,
        buddy_reduced_motion: false,
        buddy_sound_enabled: false,
        buddy_intro_seen: true,
        buddy_last_seen_date: '2026-09-11',
      },
    } as never)
    vi.mocked(useSavePreferences).mockReturnValue({
      isPending: false,
      mutate: savePreferences,
      mutateAsync: vi.fn(),
    } as never)
  })

  it('shows visual previews and persists the selected theme', async () => {
    const user = userEvent.setup()
    render(<GeneralPane />)

    expect(screen.getByTestId('theme-preview-light')).toBeInTheDocument()
    expect(screen.getByTestId('theme-preview-dark')).toBeInTheDocument()
    expect(screen.getByTestId('theme-preview-cream')).toBeInTheDocument()
    expect(screen.getByTestId('theme-preview-system')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Claro' }))

    await waitFor(() => {
      expect(setTheme).toHaveBeenCalledWith('light')
      expect(savePreferences).toHaveBeenCalledWith(
        expect.objectContaining({ theme: 'light' })
      )
    })
  })

  it('shows the accent choices and persists the selected accent', async () => {
    const user = userEvent.setup()
    render(<GeneralPane />)

    await user.click(screen.getByRole('radio', { name: 'Roxo' }))

    expect(setAccent).toHaveBeenCalledWith('purple')
    expect(savePreferences).toHaveBeenCalledWith(
      expect.objectContaining({ accent: 'purple' })
    )
  })

  it('lets the user hide Bon without changing the brand', async () => {
    const user = userEvent.setup()
    render(<GeneralPane />)

    await user.click(screen.getByRole('switch', { name: 'Mostrar o Bon' }))

    expect(savePreferences).toHaveBeenCalledWith(
      expect.objectContaining({ buddy_enabled: false })
    )
  })
})
