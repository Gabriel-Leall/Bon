import type { CalendarEvent } from '@/lib/calendar-domain'
import { getEventsForDate } from '@/lib/calendar-domain'
import type { Task } from '@/store/tasks-store'

export type TodayTimelineItem =
  | { kind: 'event'; event: CalendarEvent; sortAt: number }
  | { kind: 'task'; task: Task; sortAt: number }

function eventSortTime(event: CalendarEvent): number {
  if (event.all_day) return Number.NEGATIVE_INFINITY

  const parsed = new Date(event.start_date).getTime()
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed
}

export function selectTodayOpenTasks(tasks: Task[], dateISO: string): Task[] {
  return tasks
    .filter(
      task =>
        task.status !== 'done' &&
        !task.completed_at &&
        (task.due_date === dateISO || !task.due_date)
    )
    .sort((a, b) => a.sort_order - b.sort_order)
}

export function selectTodayEvents(
  events: CalendarEvent[],
  dateISO: string
): CalendarEvent[] {
  return getEventsForDate(events, dateISO).sort(
    (a, b) => eventSortTime(a) - eventSortTime(b)
  )
}

export function selectNextCommitment(
  events: CalendarEvent[],
  dateISO: string,
  now = new Date()
): CalendarEvent | null {
  const todayEvents = selectTodayEvents(events, dateISO)
  const allDayEvent = todayEvents.find(event => event.all_day)
  const nextTimedEvent = todayEvents.find(event => {
    if (event.all_day) return false
    const end = new Date(event.end_date).getTime()
    return !Number.isNaN(end) && end >= now.getTime()
  })

  return nextTimedEvent ?? allDayEvent ?? null
}

export function buildTodayTimeline(
  events: CalendarEvent[],
  tasks: Task[],
  dateISO: string
): TodayTimelineItem[] {
  const eventItems: TodayTimelineItem[] = selectTodayEvents(
    events,
    dateISO
  ).map(event => ({
    kind: 'event',
    event,
    sortAt: eventSortTime(event),
  }))
  const taskItems: TodayTimelineItem[] = selectTodayOpenTasks(
    tasks,
    dateISO
  ).map(task => ({
    kind: 'task',
    task,
    sortAt: Number.POSITIVE_INFINITY,
  }))

  return [...eventItems, ...taskItems]
}
