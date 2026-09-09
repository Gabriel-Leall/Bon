export type CalendarNotificationOwner = 'axis' | 'external'

/**
 * Axis owns notifications for local events. Connected providers remain the
 * notification owner unless the user explicitly opts in to Axis reminders.
 */
export function shouldAxisNotifyForCalendarEvent(
  owner: CalendarNotificationOwner,
  externalNotificationsEnabled: boolean
) {
  return owner === 'axis' || externalNotificationsEnabled
}
