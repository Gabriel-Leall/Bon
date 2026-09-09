import { describe, expect, it } from 'vitest'
import { shouldSendDailyWrapUpReminder } from './daily-wrap-up-reminder-domain'

const base = {
  now: new Date(2026, 8, 8, 18, 0),
  enabled: true,
  reminderTime: '18:00',
  planDate: '2026-09-08',
  planStatus: 'open',
  lastNotifiedDate: null,
}

describe('daily wrap-up reminder policy', () => {
  it('sends once the configured local time is reached', () => {
    expect(shouldSendDailyWrapUpReminder(base)).toBe(true)
    expect(
      shouldSendDailyWrapUpReminder({
        ...base,
        now: new Date(2026, 8, 8, 17, 59),
      })
    ).toBe(false)
  })

  it('does not send when disabled, already wrapped up, or already sent today', () => {
    expect(shouldSendDailyWrapUpReminder({ ...base, enabled: false })).toBe(
      false
    )
    expect(
      shouldSendDailyWrapUpReminder({ ...base, planStatus: 'wrapped_up' })
    ).toBe(false)
    expect(
      shouldSendDailyWrapUpReminder({
        ...base,
        lastNotifiedDate: '2026-09-08',
      })
    ).toBe(false)
  })

  it('rejects stale plans and malformed times', () => {
    expect(
      shouldSendDailyWrapUpReminder({
        ...base,
        planDate: '2026-09-07',
      })
    ).toBe(false)
    expect(
      shouldSendDailyWrapUpReminder({ ...base, reminderTime: '25:00' })
    ).toBe(false)
  })
})
