import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { usePreferences, useSavePreferences } from '@/services/preferences'
import { SettingsField, SettingsSection } from '../shared/SettingsComponents'

export function NotificationsPane() {
  const { t } = useTranslation()
  const { data: preferences } = usePreferences()
  const savePreferences = useSavePreferences()
  const reminderEnabled = preferences?.daily_wrap_up_reminder_enabled ?? false

  const persist = (updates: {
    daily_wrap_up_reminder_enabled?: boolean
    daily_wrap_up_reminder_time?: string
  }) => {
    if (!preferences) return
    savePreferences.mutate({ ...preferences, ...updates })
  }

  return (
    <div className="space-y-6">
      <SettingsSection title={t('preferences.notifications.dailyClosure')}>
        <SettingsField
          label={t('preferences.notifications.dailyReminder')}
          description={t('preferences.notifications.dailyReminderDescription')}
        >
          <div className="flex items-center gap-2">
            <Switch
              id="daily-wrap-up-reminder"
              aria-label={t('preferences.notifications.dailyReminder')}
              checked={reminderEnabled}
              onCheckedChange={checked =>
                persist({ daily_wrap_up_reminder_enabled: checked })
              }
              disabled={!preferences || savePreferences.isPending}
            />
            <Label htmlFor="daily-wrap-up-reminder" className="text-sm">
              {reminderEnabled ? t('common.enabled') : t('common.disabled')}
            </Label>
          </div>
        </SettingsField>

        <SettingsField
          label={t('preferences.notifications.dailyReminderTime')}
          description={t(
            'preferences.notifications.dailyReminderTimeDescription'
          )}
        >
          <Input
            type="time"
            className="w-32"
            value={preferences?.daily_wrap_up_reminder_time ?? '18:00'}
            onChange={event =>
              persist({ daily_wrap_up_reminder_time: event.target.value })
            }
            disabled={
              !preferences || !reminderEnabled || savePreferences.isPending
            }
          />
        </SettingsField>
      </SettingsSection>
    </div>
  )
}
