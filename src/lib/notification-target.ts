import { getCurrentWindow } from '@tauri-apps/api/window'
import { useCalendarStore } from '@/store/calendar-store'
import { useHabitsStore } from '@/store/habits-store'
import { useTasksStore } from '@/store/tasks-store'
import { useUIStore } from '@/store/ui-store'
import type { CalendarNotificationOwner } from './calendar-notification-policy'

export const AXIS_NOTIFICATION_TARGET_KEY = 'axisTarget'

export type AxisNotificationTarget =
  | { kind: 'wrap-up' }
  | { kind: 'focus' }
  | { kind: 'task'; id: string }
  | { kind: 'note'; id: string }
  | { kind: 'habit'; id: string }
  | {
      kind: 'calendar-event'
      id: string
      dateISO: string
      owner: CalendarNotificationOwner
    }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseTargetValue(value: unknown): unknown {
  if (typeof value !== 'string') return value

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function isValidTarget(value: unknown): value is AxisNotificationTarget {
  if (!isRecord(value) || typeof value['kind'] !== 'string') return false

  switch (value['kind']) {
    case 'wrap-up':
    case 'focus':
      return true
    case 'task':
    case 'note':
    case 'habit':
      return typeof value['id'] === 'string' && value['id'].length > 0
    case 'calendar-event':
      return (
        typeof value['id'] === 'string' &&
        value['id'].length > 0 &&
        typeof value['dateISO'] === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(value['dateISO']) &&
        (value['owner'] === 'axis' || value['owner'] === 'external')
      )
    default:
      return false
  }
}

export function encodeAxisNotificationTarget(
  target: AxisNotificationTarget
): Record<string, unknown> {
  return {
    [AXIS_NOTIFICATION_TARGET_KEY]: JSON.stringify(target),
  }
}

export function decodeAxisNotificationTarget(
  extra: Record<string, unknown> | undefined
): AxisNotificationTarget | null {
  const parsed = parseTargetValue(extra?.[AXIS_NOTIFICATION_TARGET_KEY])
  return isValidTarget(parsed) ? parsed : null
}

export function routeAxisNotificationTarget(target: AxisNotificationTarget) {
  const ui = useUIStore.getState()

  switch (target.kind) {
    case 'wrap-up':
      ui.setWrapUpOpen(true)
      return
    case 'focus':
      ui.navigateTo('focus')
      return
    case 'task':
      useTasksStore.getState().setSelectedTask(target.id)
      ui.navigateTo('tasks', { selectedTaskId: target.id })
      return
    case 'note':
      ui.navigateTo('notes', { selectedNoteId: target.id })
      return
    case 'habit':
      useHabitsStore.getState().setSelectedHabit(target.id)
      ui.navigateTo('habits', { selectedHabitId: target.id })
      return
    case 'calendar-event':
      useCalendarStore.getState().setSelectedDate(target.dateISO)
      useCalendarStore.getState().setSelectedEvent(target.id)
      ui.navigateTo('calendar', {
        selectedEventId: target.id,
        selectedDate: target.dateISO,
      })
  }
}

export async function revealMainWindow() {
  const mainWindow = getCurrentWindow()
  await mainWindow.show()
  if (await mainWindow.isMinimized()) {
    await mainWindow.unminimize()
  }
  await mainWindow.setFocus()
}
