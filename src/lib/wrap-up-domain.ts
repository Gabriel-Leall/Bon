import {
  getEventsForDate,
  getLocalISODate,
  type CalendarEvent,
} from '@/lib/calendar-domain'
import type { Habit, HabitLog } from '@/store/habits-store'
import { selectTodayHabits, selectTodayProgress } from '@/store/habits-store'
import type { PomodoroSession } from '@/store/pomodoro-types'
import type { Task } from '@/store/tasks-store'

export function getTomorrowISO(date = new Date()): string {
  const tomorrow = new Date(date)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yyyy = tomorrow.getFullYear()
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const dd = String(tomorrow.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function timestampMatchesDate(timestamp: string | undefined, dateISO: string) {
  if (!timestamp) return false
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp.startsWith(dateISO)
  return getLocalISODate(date) === dateISO
}

export function splitWrapUpTasks(
  tasks: Task[],
  dateISO?: string,
  focusTaskId: string | null = null
) {
  const completed = tasks.filter(task => {
    const isCompleted = task.status === 'done' || !!task.completed_at
    if (!isCompleted) return false
    return dateISO ? timestampMatchesDate(task.completed_at, dateISO) : true
  })
  const open = tasks.filter(task => {
    if (task.status === 'done' || !!task.completed_at) return false
    if (!dateISO) return true
    return (
      task.id === focusTaskId || (!!task.due_date && task.due_date <= dateISO)
    )
  })

  return { completed, open }
}

export interface WrapUpSnapshot {
  completedTasks: Task[]
  openTasks: Task[]
  tomorrowTasks: Task[]
  todayEvents: CalendarEvent[]
  tomorrowEvents: CalendarEvent[]
  focusSeconds: number
  habitsDone: number
  habitsExpected: number
  todayHabits: Habit[]
}

export function buildWrapUpSnapshot({
  todayISO,
  tomorrowISO,
  focusTaskId,
  tasks,
  events,
  habits,
  habitLogs,
  sessions,
}: {
  todayISO: string
  tomorrowISO: string
  focusTaskId: string | null
  tasks: Task[]
  events: CalendarEvent[]
  habits: Habit[]
  habitLogs: HabitLog[]
  sessions: PomodoroSession[]
}): WrapUpSnapshot {
  const { completed, open } = splitWrapUpTasks(tasks, todayISO, focusTaskId)
  const tomorrowTasks = tasks.filter(
    task =>
      task.status !== 'done' &&
      !task.completed_at &&
      task.due_date === tomorrowISO
  )
  const todayHabits = selectTodayHabits(habits, todayISO)
  const habitProgress = selectTodayProgress(
    todayHabits,
    habitLogs.filter(log => log.completed_date === todayISO)
  )

  return {
    completedTasks: completed,
    openTasks: open,
    tomorrowTasks,
    todayEvents: getEventsForDate(events, todayISO),
    tomorrowEvents: getEventsForDate(events, tomorrowISO),
    focusSeconds: sessions
      .filter(session => session.completed && session.session_type === 'focus')
      .reduce((total, session) => total + session.duration_seconds, 0),
    habitsDone: habitProgress.done,
    habitsExpected: habitProgress.total,
    todayHabits,
  }
}

export function buildTomorrowFocusCandidates(
  tomorrowTasks: Task[],
  carryOverTasks: Task[]
): Task[] {
  const seen = new Set<string>()
  return [...tomorrowTasks, ...carryOverTasks].filter(task => {
    if (seen.has(task.id)) return false
    seen.add(task.id)
    return true
  })
}
