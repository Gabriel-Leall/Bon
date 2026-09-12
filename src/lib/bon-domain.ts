import type { CalendarEvent } from '@/lib/calendar-domain'

export type BonState =
  | 'idle'
  | 'waking'
  | 'sleeping'
  | 'napping'
  | 'drowsy'
  | 'focus'
  | 'listening'
  | 'thinking'
  | 'searching'
  | 'happy'
  | 'curious'
  | 'confused'
  | 'surprised'
  | 'proud'
  | 'concerned'
  | 'tired'
  | 'playful'
  | 'laughing'
  | 'celebrate'

export type BonBookMode = 'open' | 'closed' | 'hidden'

type AnalyticsInsightLevel = 'empty' | 'strong' | 'steady' | 'uneven' | 'low'

interface TodayBonInput {
  introSeen: boolean
  lastSeenDate: string | null
  now: Date
  planWrappedUp: boolean
  todayISO: string
  wrapUpTime: string
}

interface WrapUpBonInput {
  completedCount: number
  essentialDone: boolean
  habitsDone: number
  habitsExpected: number
  openCount: number
}

export function getAnalysisBonState(
  level: AnalyticsInsightLevel,
  isLoading: boolean
): BonState {
  if (isLoading) return 'thinking'

  const states: Record<AnalyticsInsightLevel, BonState> = {
    empty: 'curious',
    strong: 'proud',
    steady: 'happy',
    uneven: 'listening',
    low: 'concerned',
  }

  return states[level]
}

export function getTodayBonState({
  introSeen,
  lastSeenDate,
  now,
  planWrappedUp,
  todayISO,
  wrapUpTime,
}: TodayBonInput): BonState {
  if (planWrappedUp) return 'sleeping'
  if (!introSeen || (lastSeenDate !== null && lastSeenDate !== todayISO)) {
    return 'waking'
  }

  const [hours = Number.NaN, minutes = Number.NaN] = wrapUpTime
    .split(':')
    .map(Number)
  if (Number.isFinite(hours) && Number.isFinite(minutes)) {
    const wrapUp = new Date(now)
    wrapUp.setHours(hours, minutes, 0, 0)
    const minutesUntilWrapUp = (wrapUp.getTime() - now.getTime()) / 60_000
    if (minutesUntilWrapUp >= 0 && minutesUntilWrapUp <= 60) {
      return 'drowsy'
    }
  }

  return 'idle'
}

export function getWrapUpBonState({
  completedCount,
  essentialDone,
  habitsDone,
  habitsExpected,
  openCount,
}: WrapUpBonInput): BonState {
  if (essentialDone && completedCount > 0) return 'proud'
  if (habitsExpected > 0 && habitsDone >= habitsExpected) return 'happy'
  if (completedCount > 0) return 'listening'
  if (openCount >= 4) return 'tired'
  return 'concerned'
}

export function findUrgentFocusEvent(
  events: CalendarEvent[],
  now = new Date(),
  windowMinutes = 5
): CalendarEvent | null {
  const deadline = now.getTime() + windowMinutes * 60_000

  return (
    events
      .filter(event => {
        if (event.all_day) return false
        const startsAt = new Date(event.start_date).getTime()
        return startsAt >= now.getTime() && startsAt <= deadline
      })
      .sort(
        (left, right) =>
          new Date(left.start_date).getTime() -
          new Date(right.start_date).getTime()
      )[0] ?? null
  )
}
