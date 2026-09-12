import { describe, expect, it } from 'vitest'
import type { CalendarEvent } from '@/lib/calendar-domain'
import {
  findUrgentFocusEvent,
  getAnalysisBonState,
  getTodayBonState,
  getWrapUpBonState,
} from './bon-domain'

function event(id: string, startDate: string, allDay = false): CalendarEvent {
  return {
    id,
    title: id,
    description: null,
    start_date: startDate,
    end_date: new Date(
      new Date(startDate).getTime() + 30 * 60_000
    ).toISOString(),
    all_day: allDay,
    color: null,
    created_at: startDate,
    updated_at: startDate,
  }
}

describe('Bon domain', () => {
  it('maps analysis evidence to restrained emotional states', () => {
    expect(getAnalysisBonState('strong', false)).toBe('proud')
    expect(getAnalysisBonState('uneven', false)).toBe('listening')
    expect(getAnalysisBonState('low', false)).toBe('concerned')
    expect(getAnalysisBonState('strong', true)).toBe('thinking')
  })

  it('sleeps after wrap-up and becomes drowsy near the configured time', () => {
    const now = new Date('2026-09-11T17:30:00')
    expect(
      getTodayBonState({
        introSeen: true,
        lastSeenDate: '2026-09-11',
        now,
        planWrappedUp: true,
        todayISO: '2026-09-11',
        wrapUpTime: '18:00',
      })
    ).toBe('sleeping')
    expect(
      getTodayBonState({
        introSeen: true,
        lastSeenDate: '2026-09-11',
        now,
        planWrappedUp: false,
        todayISO: '2026-09-11',
        wrapUpTime: '18:00',
      })
    ).toBe('drowsy')
  })

  it('wakes on the first encounter and on the first use of a new day', () => {
    const input = {
      now: new Date('2026-09-11T09:00:00'),
      planWrappedUp: false,
      todayISO: '2026-09-11',
      wrapUpTime: '18:00',
    }
    expect(
      getTodayBonState({ ...input, introSeen: false, lastSeenDate: null })
    ).toBe('waking')
    expect(
      getTodayBonState({
        ...input,
        introSeen: true,
        lastSeenDate: '2026-09-10',
      })
    ).toBe('waking')
  })

  it('keeps wrap-up reactions firm without punitive states', () => {
    expect(
      getWrapUpBonState({
        completedCount: 3,
        essentialDone: true,
        habitsDone: 1,
        habitsExpected: 2,
        openCount: 2,
      })
    ).toBe('proud')
    expect(
      getWrapUpBonState({
        completedCount: 0,
        essentialDone: false,
        habitsDone: 0,
        habitsExpected: 2,
        openCount: 6,
      })
    ).toBe('tired')
  })

  it('interrupts focus only for a timed event within five minutes', () => {
    const now = new Date('2026-09-11T12:00:00.000Z')
    const urgent = event('urgent', '2026-09-11T12:04:00.000Z')
    const later = event('later', '2026-09-11T12:10:00.000Z')
    const allDay = event('all-day', '2026-09-11T12:01:00.000Z', true)

    expect(findUrgentFocusEvent([later, allDay, urgent], now)?.id).toBe(
      'urgent'
    )
    expect(findUrgentFocusEvent([later, allDay], now)).toBeNull()
  })
})
