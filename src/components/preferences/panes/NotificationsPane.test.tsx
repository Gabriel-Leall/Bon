import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n/config'
import { usePreferences, useSavePreferences } from '@/services/preferences'
import { render, screen } from '@/test/test-utils'
import { NotificationsPane } from './NotificationsPane'

vi.mock('@/services/preferences', () => ({
  usePreferences: vi.fn(),
  useSavePreferences: vi.fn(),
}))

const savePreferences = vi.fn()
const preferences = {
  theme: 'cream',
  accent: 'purple',
  quick_pane_shortcut: null,
  language: 'pt-BR',
  minimize_to_tray: true,
  start_of_week: 'monday',
  daily_reset_time: '00:00',
  adaptive_dashboard_mode: 'full',
  notes_vault_path: null,
  daily_wrap_up_reminder_enabled: false,
  daily_wrap_up_reminder_time: '18:00',
}

describe('NotificationsPane', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('pt-BR')
    vi.mocked(usePreferences).mockReturnValue({ data: preferences } as never)
    vi.mocked(useSavePreferences).mockReturnValue({
      mutate: savePreferences,
      isPending: false,
    } as never)
  })

  it('persists opt-in for the daily wrap-up reminder', async () => {
    const user = userEvent.setup()
    render(<NotificationsPane />)

    await user.click(
      screen.getByRole('switch', { name: 'Lembrete para encerrar o dia' })
    )

    expect(savePreferences).toHaveBeenCalledWith(
      expect.objectContaining({ daily_wrap_up_reminder_enabled: true })
    )
  })
})
