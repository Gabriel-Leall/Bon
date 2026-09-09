import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppPreferences } from '@/lib/tauri-bindings'
import { DAILY_WRAP_UP_REMINDER_STORAGE_KEY } from '@/lib/daily-wrap-up-reminder-domain'
import { notify } from '@/lib/notifications'
import { usePreferences } from '@/services/preferences'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { act, render } from '@/test/test-utils'
import { useDailyWrapUpReminder } from './useDailyWrapUpReminder'

vi.mock('@/services/preferences', () => ({
  usePreferences: vi.fn(),
}))

vi.mock('@/lib/notifications', () => ({
  notify: vi.fn().mockResolvedValue(undefined),
}))

function ReminderHarness() {
  useDailyWrapUpReminder()
  return null
}

const preferences: AppPreferences = {
  theme: 'light',
  accent: 'blue',
  quick_pane_shortcut: null,
  language: 'en',
  minimize_to_tray: true,
  start_of_week: 'monday',
  daily_reset_time: '00:00',
  adaptive_dashboard_mode: 'full',
  notes_vault_path: null,
  daily_wrap_up_reminder_enabled: true,
  daily_wrap_up_reminder_time: '18:00',
}

describe('useDailyWrapUpReminder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 8, 18, 5))
    window.localStorage.clear()
    vi.mocked(usePreferences).mockReturnValue({ data: preferences } as never)
    useDailyPlanStore.setState({
      activePlan: {
        id: 'plan-1',
        plan_date: '2026-09-08',
        focus_task_id: null,
        status: 'open',
        focus_source: 'manual',
        created_at: '2026-09-08T08:00:00.000Z',
        updated_at: '2026-09-08T08:00:00.000Z',
        completed_at: null,
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sends one targeted reminder and persists the daily deduplication marker', async () => {
    render(<ReminderHarness />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(notify).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        native: true,
        target: { kind: 'wrap-up' },
      })
    )

    window.dispatchEvent(new Event('focus'))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000)
    })

    expect(notify).toHaveBeenCalledTimes(1)
    expect(
      window.localStorage.getItem(DAILY_WRAP_UP_REMINDER_STORAGE_KEY)
    ).toBe('2026-09-08')
  })

  it('does not remind after the plan is wrapped up', () => {
    useDailyPlanStore.setState(state => ({
      activePlan: state.activePlan
        ? { ...state.activePlan, status: 'wrapped_up' }
        : null,
    }))

    render(<ReminderHarness />)

    expect(notify).not.toHaveBeenCalled()
  })
})
