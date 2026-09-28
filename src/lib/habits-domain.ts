export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom'
export type HabitLogState = 'done' | 'minimal' | 'paused' | 'recovered'

export function getLocalISODate(date = new Date()): string {
  return date.toLocaleDateString('en-CA')
}

function parseWeekdayList(daysJson: string | null): number[] {
  if (!daysJson) return []
  try {
    const parsed = JSON.parse(daysJson)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (value): value is number =>
        typeof value === 'number' && value >= 0 && value <= 6
    )
  } catch {
    return []
  }
}

export function shouldDoOnDate(
  frequency: HabitFrequency,
  frequencyDays: string | null,
  dateISO: string
): boolean {
  const day = new Date(`${dateISO}T12:00:00`).getDay()
  if (frequency === 'daily') return true
  if (frequency === 'weekdays') return day >= 1 && day <= 5
  if (frequency === 'weekends') return day === 0 || day === 6
  if (frequency === 'custom') {
    return parseWeekdayList(frequencyDays).includes(day)
  }
  return false
}

export function calculateStreakFromDates(
  completedDates: string[],
  todayISO: string,
  frequency: HabitFrequency = 'daily',
  frequencyDays: string | null = null
): number {
  const validDates = [...new Set(completedDates)]
    .filter(
      date =>
        date <= todayISO &&
        Number.isFinite(new Date(`${date}T12:00:00`).getTime())
    )
    .sort()
  if (validDates.length === 0) return 0

  const completedSet = new Set(validDates)
  const cursor = new Date(`${validDates[0]}T12:00:00`)
  const today = new Date(`${todayISO}T12:00:00`)
  let streak = 0

  while (cursor <= today) {
    const dateISO = getLocalISODate(cursor)
    if (
      shouldDoOnDate(frequency, frequencyDays, dateISO) &&
      !(dateISO === todayISO && !completedSet.has(dateISO))
    ) {
      if (completedSet.has(dateISO)) {
        streak += 1
      } else {
        streak = 0
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return streak
}

export function completionRate(done: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((done / total) * 100)
}

export function buildDateRange(days: number, endDate = new Date()): string[] {
  const dates: string[] = []
  const end = new Date(endDate)
  end.setHours(12, 0, 0, 0)

  for (let i = 0; i < days; i += 1) {
    const step = new Date(end)
    step.setDate(end.getDate() - (days - 1 - i))
    dates.push(getLocalISODate(step))
  }

  return dates
}

export function getRecoverableHabitDates(
  frequency: HabitFrequency,
  frequencyDays: string | null,
  existingDates: string[],
  todayISO: string,
  maxDays = 3
): string[] {
  const existing = new Set(existingDates)
  const dates: string[] = []
  const today = new Date(`${todayISO}T12:00:00`)

  for (let offset = 1; offset <= maxDays; offset += 1) {
    const candidate = new Date(today)
    candidate.setDate(today.getDate() - offset)
    const dateISO = getLocalISODate(candidate)
    if (!shouldDoOnDate(frequency, frequencyDays, dateISO)) {
      continue
    }
    if (existing.has(dateISO)) {
      continue
    }
    dates.push(dateISO)
  }

  return dates
}

export function bestHistoricalStreak(
  completedDates: string[],
  frequency: HabitFrequency = 'daily',
  frequencyDays: string | null = null
): number {
  const uniqueSorted = [...new Set(completedDates)]
    .filter(date => Number.isFinite(new Date(`${date}T12:00:00`).getTime()))
    .sort()
  if (uniqueSorted.length === 0) return 0

  const completedSet = new Set(uniqueSorted)
  const cursor = new Date(`${uniqueSorted[0]}T12:00:00`)
  const lastDate = new Date(`${uniqueSorted[uniqueSorted.length - 1]}T12:00:00`)
  let best = 0
  let current = 0

  while (cursor <= lastDate) {
    const dateISO = getLocalISODate(cursor)
    if (shouldDoOnDate(frequency, frequencyDays, dateISO)) {
      if (completedSet.has(dateISO)) {
        current += 1
        best = Math.max(best, current)
      } else {
        current = 0
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return best
}

export function topCompletionWeekday(completedDates: string[]): number | null {
  if (completedDates.length === 0) return null
  const counts = new Array<number>(7).fill(0)
  for (const date of completedDates) {
    const weekday = new Date(`${date}T12:00:00`).getDay()
    counts[weekday] = (counts[weekday] ?? 0) + 1
  }

  let maxDay = 0
  let maxCount = counts[0] ?? 0
  for (let day = 1; day < counts.length; day += 1) {
    if ((counts[day] ?? 0) > maxCount) {
      maxCount = counts[day] ?? 0
      maxDay = day
    }
  }
  return maxDay
}
