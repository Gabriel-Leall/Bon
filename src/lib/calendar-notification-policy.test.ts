import { describe, expect, it } from 'vitest'
import { shouldAxisNotifyForCalendarEvent } from './calendar-notification-policy'

describe('calendar notification ownership', () => {
  it('keeps local event notifications owned by Axis', () => {
    expect(shouldAxisNotifyForCalendarEvent('axis', false)).toBe(true)
  })

  it('does not duplicate external provider notifications by default', () => {
    expect(shouldAxisNotifyForCalendarEvent('external', false)).toBe(false)
    expect(shouldAxisNotifyForCalendarEvent('external', true)).toBe(true)
  })
})
