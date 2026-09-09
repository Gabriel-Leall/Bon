import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getLocalISODate } from '@/lib/calendar-domain'
import {
  readLastDailyWrapUpReminderDate,
  rememberDailyWrapUpReminderDate,
  shouldSendDailyWrapUpReminder,
} from '@/lib/daily-wrap-up-reminder-domain'
import { notify } from '@/lib/notifications'
import { usePreferences } from '@/services/preferences'
import { useDailyPlanStore } from '@/store/daily-plan-store'

const REMINDER_CHECK_INTERVAL_MS = 60_000

export function useDailyWrapUpReminder() {
  const { t } = useTranslation()
  const { data: preferences } = usePreferences()
  const planDate = useDailyPlanStore(
    state => state.activePlan?.plan_date ?? null
  )
  const planStatus = useDailyPlanStore(
    state => state.activePlan?.status ?? null
  )
  const enabled = preferences?.daily_wrap_up_reminder_enabled ?? false
  const reminderTime = preferences?.daily_wrap_up_reminder_time ?? '18:00'
  const title = t('wrapUp.reminder.title')
  const body = t('wrapUp.reminder.description')

  useEffect(() => {
    if (!enabled) return

    let notificationInFlight = false

    const evaluateReminder = () => {
      if (notificationInFlight) return

      const now = new Date()
      const shouldSend = shouldSendDailyWrapUpReminder({
        now,
        enabled,
        reminderTime,
        planDate,
        planStatus,
        lastNotifiedDate: readLastDailyWrapUpReminderDate(),
      })

      if (!shouldSend) return

      notificationInFlight = true
      rememberDailyWrapUpReminderDate(getLocalISODate(now))
      void notify(title, body, {
        type: 'info',
        native: true,
        target: { kind: 'wrap-up' },
      }).finally(() => {
        notificationInFlight = false
      })
    }

    const evaluateWhenVisible = () => {
      if (document.visibilityState === 'visible') evaluateReminder()
    }

    evaluateReminder()
    const interval = window.setInterval(
      evaluateReminder,
      REMINDER_CHECK_INTERVAL_MS
    )
    window.addEventListener('focus', evaluateReminder)
    document.addEventListener('visibilitychange', evaluateWhenVisible)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', evaluateReminder)
      document.removeEventListener('visibilitychange', evaluateWhenVisible)
    }
  }, [body, enabled, planDate, planStatus, reminderTime, title])
}
