import { describe, expect, it } from 'vitest'
import {
  addDaysToISO,
  getCalendarRange,
  getDisplayedAllDayEnd,
  getDurationMinutes,
  getMonthDays,
  getStoredAllDayEnd,
  getWeekDays,
  readStoredCalendarView,
  shiftCalendarAnchor,
} from './calendar-page-domain'

describe('calendar-page-domain', () => {
  it('builds a Monday-first week around the anchor', () => {
    const days = getWeekDays(new Date(2026, 8, 8), 1)

    expect(days.map(day => day.dateISO)).toEqual([
      '2026-09-07',
      '2026-09-08',
      '2026-09-09',
      '2026-09-10',
      '2026-09-11',
      '2026-09-12',
      '2026-09-13',
    ])
  })

  it('builds a fixed six-week month grid with adjacent dates', () => {
    const days = getMonthDays(new Date(2026, 8, 8), 1)

    expect(days).toHaveLength(42)
    expect(days[0]?.dateISO).toBe('2026-08-31')
    expect(days.at(-1)?.dateISO).toBe('2026-10-11')
    expect(days[0]?.inCurrentMonth).toBe(false)
    expect(days[8]?.inCurrentMonth).toBe(true)
  })

  it('returns the complete visible range for loading', () => {
    expect(getCalendarRange(new Date(2026, 8, 8), 'week', 1)).toEqual({
      start: '2026-09-07',
      end: '2026-09-13',
    })
    expect(getCalendarRange(new Date(2026, 8, 8), 'month', 1)).toEqual({
      start: '2026-08-31',
      end: '2026-10-11',
    })
  })

  it('moves by one week or one month according to the active view', () => {
    expect(shiftCalendarAnchor(new Date(2026, 8, 8), 'week', 1).getDate()).toBe(
      15
    )
    const previousMonth = shiftCalendarAnchor(new Date(2026, 8, 8), 'month', -1)
    expect(previousMonth.getFullYear()).toBe(2026)
    expect(previousMonth.getMonth()).toBe(7)
    expect(previousMonth.getDate()).toBe(1)
  })

  it('uses an exclusive stored end for all-day events', () => {
    expect(getStoredAllDayEnd('2026-09-08')).toBe('2026-09-09')
    expect(getDisplayedAllDayEnd('2026-09-09')).toBe('2026-09-08')
    expect(addDaysToISO('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('defaults an unknown stored view to week', () => {
    const storage = {
      getItem: () => 'agenda',
    } as Pick<Storage, 'getItem'> as Storage

    expect(readStoredCalendarView(storage)).toBe('week')
  })

  it('keeps timed blocks visible for at least thirty minutes', () => {
    expect(
      getDurationMinutes('2026-09-08T09:00:00.000Z', '2026-09-08T09:15:00.000Z')
    ).toBe(30)
  })
})
