import { getLocalISODate } from './calendar-domain'

export type CalendarView = 'week' | 'month'

export const CALENDAR_VIEW_STORAGE_KEY = 'axis.calendar.view'
export const CALENDAR_TIMELINE_START_HOUR = 6
export const CALENDAR_TIMELINE_END_HOUR = 22

export interface CalendarDateCell {
  date: Date
  dateISO: string
  inCurrentMonth: boolean
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
}

export function addCalendarDays(value: Date, amount: number): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate() + amount
  )
}

export function addDaysToISO(value: string, amount: number): string {
  return getLocalISODate(addCalendarDays(parseISODate(value), amount))
}

export function startOfCalendarWeek(value: Date, weekStartsOn: 0 | 1): Date {
  const distance = (value.getDay() - weekStartsOn + 7) % 7
  return addCalendarDays(value, -distance)
}

export function getWeekDays(
  anchor: Date,
  weekStartsOn: 0 | 1
): CalendarDateCell[] {
  const start = startOfCalendarWeek(anchor, weekStartsOn)
  return Array.from({ length: 7 }, (_, index) => {
    const date = addCalendarDays(start, index)
    return {
      date,
      dateISO: getLocalISODate(date),
      inCurrentMonth: date.getMonth() === anchor.getMonth(),
    }
  })
}

export function getMonthDays(
  anchor: Date,
  weekStartsOn: 0 | 1
): CalendarDateCell[] {
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const gridStart = startOfCalendarWeek(monthStart, weekStartsOn)

  return Array.from({ length: 42 }, (_, index) => {
    const date = addCalendarDays(gridStart, index)
    return {
      date,
      dateISO: getLocalISODate(date),
      inCurrentMonth: date.getMonth() === anchor.getMonth(),
    }
  })
}

export function getCalendarRange(
  anchor: Date,
  view: CalendarView,
  weekStartsOn: 0 | 1
): { start: string; end: string } {
  const days =
    view === 'week'
      ? getWeekDays(anchor, weekStartsOn)
      : getMonthDays(anchor, weekStartsOn)

  return {
    start: days[0]?.dateISO ?? getLocalISODate(anchor),
    end: days.at(-1)?.dateISO ?? getLocalISODate(anchor),
  }
}

export function shiftCalendarAnchor(
  anchor: Date,
  view: CalendarView,
  direction: -1 | 1
): Date {
  if (view === 'week') return addCalendarDays(anchor, direction * 7)
  return new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1)
}

export function readStoredCalendarView(storage: Storage): CalendarView {
  return storage.getItem(CALENDAR_VIEW_STORAGE_KEY) === 'month'
    ? 'month'
    : 'week'
}

export function getStoredAllDayEnd(inclusiveEnd: string): string {
  return addDaysToISO(inclusiveEnd, 1)
}

export function getDisplayedAllDayEnd(exclusiveEnd: string): string {
  return addDaysToISO(exclusiveEnd, -1)
}

export function toDateTimeLocalValue(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function toStoredDateTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

export function getMinutesIntoDay(value: string): number {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 0
  return date.getHours() * 60 + date.getMinutes()
}

export function getDurationMinutes(start: string, end: string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 60
  }
  return Math.max(30, (endDate.getTime() - startDate.getTime()) / 60_000)
}
