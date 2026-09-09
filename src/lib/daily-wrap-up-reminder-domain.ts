import { getLocalISODate } from './calendar-domain'

export const DAILY_WRAP_UP_REMINDER_STORAGE_KEY =
  'axis:daily-wrap-up-reminder:v1:last-date'

function parseTimeOfDay(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null

  return { hour, minute }
}

export function shouldSendDailyWrapUpReminder({
  now,
  enabled,
  reminderTime,
  planDate,
  planStatus,
  lastNotifiedDate,
}: {
  now: Date
  enabled: boolean
  reminderTime: string
  planDate: string | null
  planStatus: string | null
  lastNotifiedDate: string | null
}) {
  if (!enabled || planStatus === 'wrapped_up') return false

  const time = parseTimeOfDay(reminderTime)
  if (!time) return false

  const todayISO = getLocalISODate(now)
  if (planDate !== todayISO || lastNotifiedDate === todayISO) return false

  const reminderAt = new Date(now)
  reminderAt.setHours(time.hour, time.minute, 0, 0)

  return now.getTime() >= reminderAt.getTime()
}

export function readLastDailyWrapUpReminderDate() {
  try {
    return window.localStorage.getItem(DAILY_WRAP_UP_REMINDER_STORAGE_KEY)
  } catch {
    return null
  }
}

export function rememberDailyWrapUpReminderDate(dateISO: string) {
  try {
    window.localStorage.setItem(DAILY_WRAP_UP_REMINDER_STORAGE_KEY, dateISO)
  } catch {
    // The in-memory scheduler still prevents overlapping sends in this session.
  }
}
