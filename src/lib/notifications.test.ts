import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendTargetedNativeNotification } from './native-notification'
import { notify } from './notifications'

vi.mock('./native-notification', () => ({
  sendTargetedNativeNotification: vi.fn().mockResolvedValue(undefined),
}))

describe('calendar notification ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('suppresses external event notifications unless the caller opts in', async () => {
    const target = {
      kind: 'calendar-event' as const,
      id: 'google-event-1',
      dateISO: '2026-09-09',
      owner: 'external' as const,
    }

    await notify('External event', undefined, {
      native: true,
      target,
    })
    expect(sendTargetedNativeNotification).not.toHaveBeenCalled()

    await notify('External event', undefined, {
      native: true,
      target,
      allowExternalCalendarNotification: true,
    })
    expect(sendTargetedNativeNotification).toHaveBeenCalledOnce()
  })
})
