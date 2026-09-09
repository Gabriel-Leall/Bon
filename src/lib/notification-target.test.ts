import { beforeEach, describe, expect, it } from 'vitest'
import { useCalendarStore } from '@/store/calendar-store'
import { useUIStore } from '@/store/ui-store'
import {
  decodeAxisNotificationTarget,
  encodeAxisNotificationTarget,
  routeAxisNotificationTarget,
} from './notification-target'

describe('notification targets', () => {
  beforeEach(() => {
    useUIStore.setState({
      activePage: 'today',
      activePageData: {},
      wrapUpOpen: false,
    })
    useCalendarStore.setState({
      selectedDate: null,
      selectedEventId: null,
    })
  })

  it('round-trips a typed notification target and rejects malformed payloads', () => {
    const target = {
      kind: 'calendar-event' as const,
      id: 'event-42',
      dateISO: '2026-09-09',
      owner: 'axis' as const,
    }

    expect(
      decodeAxisNotificationTarget(encodeAxisNotificationTarget(target))
    ).toEqual(target)
    expect(decodeAxisNotificationTarget({ axisTarget: '{not-json' })).toBeNull()
    expect(
      decodeAxisNotificationTarget({
        axisTarget: JSON.stringify({ kind: 'calendar-event', id: 'event-42' }),
      })
    ).toBeNull()
  })

  it('opens the daily wrap-up directly', () => {
    routeAxisNotificationTarget({ kind: 'wrap-up' })

    expect(useUIStore.getState().wrapUpOpen).toBe(true)
  })

  it('routes calendar notifications to the event context', () => {
    routeAxisNotificationTarget({
      kind: 'calendar-event',
      id: 'event-42',
      dateISO: '2026-09-09',
      owner: 'axis',
    })

    expect(useCalendarStore.getState().selectedEventId).toBe('event-42')
    expect(useCalendarStore.getState().selectedDate).toBe('2026-09-09')
    expect(useUIStore.getState().activePage).toBe('calendar')
    expect(useUIStore.getState().activePageData).toEqual({
      selectedEventId: 'event-42',
      selectedDate: '2026-09-09',
    })
  })
})
