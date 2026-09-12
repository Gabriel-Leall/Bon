import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { locale } from '@tauri-apps/plugin-os'
import {
  disable as disableAutostart,
  enable as enableAutostart,
  isEnabled as isAutostartEnabled,
} from '@tauri-apps/plugin-autostart'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/hooks/use-theme'
import { availableLanguages } from '@/i18n'
import { commands, type AppPreferences } from '@/lib/tauri-bindings'
import { logger } from '@/lib/logger'
import type { Accent, Theme } from '@/lib/theme-context'
import { usePreferences, useSavePreferences } from '@/services/preferences'
import { ShortcutPicker } from '../ShortcutPicker'
import { SettingsField, SettingsSection } from '../shared/SettingsComponents'
import {
  GeneralAppearanceSettings,
  type AdaptiveMode,
} from './GeneralAppearanceSettings'

function getAdaptiveMode(value: string | null | undefined): AdaptiveMode {
  return value === 'reduced' || value === 'off' ? value : 'full'
}

export function GeneralPane() {
  const { t, i18n } = useTranslation()
  const { theme, accent, setTheme, setAccent } = useTheme()
  const { data: preferences } = usePreferences()
  const savePreferences = useSavePreferences()
  const [autostartState, setAutostartState] = useState({
    enabled: false,
    loading: true,
  })

  const { data: defaultShortcut } = useQuery({
    queryKey: ['default-quick-pane-shortcut'],
    queryFn: () => commands.getDefaultQuickPaneShortcut(),
    staleTime: Infinity,
  })

  useEffect(() => {
    const loadAutostartState = async () => {
      try {
        const enabled = await isAutostartEnabled()
        setAutostartState({ enabled, loading: false })
      } catch (error) {
        logger.warn('Failed to load autostart state', { error })
        setAutostartState(previous => ({ ...previous, loading: false }))
      }
    }
    void loadAutostartState()
  }, [])

  const handleShortcutChange = async (newShortcut: string | null) => {
    if (!preferences) return
    const oldShortcut = preferences.quick_pane_shortcut
    const result = await commands.updateQuickPaneShortcut(newShortcut)
    if (result.status === 'error') {
      toast.error(t('toast.error.shortcutFailed'), {
        description: result.error,
      })
      return
    }

    try {
      await savePreferences.mutateAsync({
        ...preferences,
        quick_pane_shortcut: newShortcut,
      })
    } catch {
      await commands.updateQuickPaneShortcut(oldShortcut)
    }
  }

  const handleLanguageChange = async (value: string) => {
    const language = value === 'system' ? null : value
    try {
      if (language) {
        await i18n.changeLanguage(language)
      } else {
        const systemLocale = await locale()
        const languageCode = systemLocale?.split('-')[0]?.toLowerCase() ?? 'en'
        const targetLanguage = languageCode === 'pt' ? 'pt-BR' : languageCode
        await i18n.changeLanguage(
          availableLanguages.includes(targetLanguage) ? targetLanguage : 'en'
        )
      }
    } catch (error) {
      logger.error('Failed to change language', { error })
      toast.error(t('toast.error.generic'))
      return
    }
    if (preferences) savePreferences.mutate({ ...preferences, language })
  }

  const handleThemeChange = (value: Theme) => {
    setTheme(value)
    if (preferences) savePreferences.mutate({ ...preferences, theme: value })
  }

  const handleAccentChange = (value: Accent) => {
    setAccent(value)
    if (preferences) savePreferences.mutate({ ...preferences, accent: value })
  }

  const handleAutostartChange = async (enabled: boolean) => {
    setAutostartState(previous => ({ ...previous, loading: true }))
    try {
      await (enabled ? enableAutostart() : disableAutostart())
      setAutostartState({ enabled, loading: false })
      toast.success(
        t(
          enabled
            ? 'toast.success.autostartEnabled'
            : 'toast.success.autostartDisabled'
        )
      )
    } catch (error) {
      logger.error('Failed to update autostart state', { error, enabled })
      toast.error(t('toast.error.autostartFailed'))
      setAutostartState(previous => ({ ...previous, loading: false }))
    }
  }

  const persistBuddyPreference = (
    updates: Partial<
      Pick<
        AppPreferences,
        | 'buddy_enabled'
        | 'buddy_proactive_messages_enabled'
        | 'buddy_reduced_motion'
        | 'buddy_sound_enabled'
      >
    >
  ) => {
    if (preferences) savePreferences.mutate({ ...preferences, ...updates })
  }

  return (
    <div className="space-y-6">
      <GeneralAppearanceSettings
        theme={theme}
        accent={accent}
        language={preferences?.language ?? null}
        adaptiveMode={getAdaptiveMode(preferences?.adaptive_dashboard_mode)}
        pending={savePreferences.isPending}
        ready={Boolean(preferences)}
        onThemeChange={handleThemeChange}
        onAccentChange={handleAccentChange}
        onLanguageChange={value => void handleLanguageChange(value)}
        onAdaptiveModeChange={adaptiveDashboardMode => {
          if (preferences) {
            savePreferences.mutate({
              ...preferences,
              adaptive_dashboard_mode: adaptiveDashboardMode,
            })
          }
        }}
      />

      <SettingsSection title={t('preferences.bon.title')}>
        <SettingsField
          label={t('preferences.bon.visible')}
          description={t('preferences.bon.visibleDescription')}
        >
          <div className="flex items-center gap-2">
            <Switch
              id="bon-visible"
              aria-label={t('preferences.bon.visible')}
              checked={preferences?.buddy_enabled ?? true}
              onCheckedChange={buddyEnabled =>
                persistBuddyPreference({ buddy_enabled: buddyEnabled })
              }
              disabled={!preferences || savePreferences.isPending}
            />
            <Label htmlFor="bon-visible" className="text-sm">
              {t(
                preferences?.buddy_enabled === false
                  ? 'common.disabled'
                  : 'common.enabled'
              )}
            </Label>
          </div>
        </SettingsField>

        <SettingsField
          label={t('preferences.bon.proactive')}
          description={t('preferences.bon.proactiveDescription')}
        >
          <div className="flex items-center gap-2">
            <Switch
              id="bon-proactive"
              aria-label={t('preferences.bon.proactive')}
              checked={preferences?.buddy_proactive_messages_enabled ?? true}
              onCheckedChange={enabled =>
                persistBuddyPreference({
                  buddy_proactive_messages_enabled: enabled,
                })
              }
              disabled={!preferences || savePreferences.isPending}
            />
            <Label htmlFor="bon-proactive" className="text-sm">
              {t(
                preferences?.buddy_proactive_messages_enabled === false
                  ? 'common.disabled'
                  : 'common.enabled'
              )}
            </Label>
          </div>
        </SettingsField>

        <SettingsField
          label={t('preferences.bon.reducedMotion')}
          description={t('preferences.bon.reducedMotionDescription')}
        >
          <div className="flex items-center gap-2">
            <Switch
              id="bon-reduced-motion"
              aria-label={t('preferences.bon.reducedMotion')}
              checked={preferences?.buddy_reduced_motion ?? false}
              onCheckedChange={enabled =>
                persistBuddyPreference({ buddy_reduced_motion: enabled })
              }
              disabled={!preferences || savePreferences.isPending}
            />
            <Label htmlFor="bon-reduced-motion" className="text-sm">
              {t(
                preferences?.buddy_reduced_motion
                  ? 'common.enabled'
                  : 'common.disabled'
              )}
            </Label>
          </div>
        </SettingsField>

        <SettingsField
          label={t('preferences.bon.sound')}
          description={t('preferences.bon.soundDescription')}
        >
          <div className="flex items-center gap-2">
            <Switch
              id="bon-sound"
              aria-label={t('preferences.bon.sound')}
              checked={preferences?.buddy_sound_enabled ?? false}
              onCheckedChange={enabled =>
                persistBuddyPreference({ buddy_sound_enabled: enabled })
              }
              disabled={!preferences || savePreferences.isPending}
            />
            <Label htmlFor="bon-sound" className="text-sm">
              {t(
                preferences?.buddy_sound_enabled
                  ? 'common.enabled'
                  : 'common.disabled'
              )}
            </Label>
          </div>
        </SettingsField>
      </SettingsSection>

      <SettingsSection title={t('preferences.advanced.startup')}>
        <SettingsField
          label={t('preferences.advanced.launchAtStartup')}
          description={t('preferences.advanced.launchAtStartupDescription')}
        >
          <div className="flex items-center gap-2">
            <Switch
              id="launch-at-startup"
              checked={autostartState.enabled}
              onCheckedChange={value => void handleAutostartChange(value)}
              disabled={autostartState.loading}
            />
            <Label htmlFor="launch-at-startup" className="text-sm">
              {t(autostartState.enabled ? 'common.enabled' : 'common.disabled')}
            </Label>
          </div>
        </SettingsField>
      </SettingsSection>

      <SettingsSection title={t('preferences.general.systemBehavior')}>
        <SettingsField
          label={t('preferences.general.minimizeToTray')}
          description={t('preferences.general.minimizeToTrayDescription')}
        >
          <div className="flex items-center gap-2">
            <Switch
              id="minimize-to-tray"
              checked={preferences?.minimize_to_tray ?? false}
              onCheckedChange={checked => {
                if (preferences) {
                  savePreferences.mutate({
                    ...preferences,
                    minimize_to_tray: checked,
                  })
                }
              }}
              disabled={savePreferences.isPending}
            />
            <Label htmlFor="minimize-to-tray" className="text-sm">
              {t(
                preferences?.minimize_to_tray
                  ? 'common.enabled'
                  : 'common.disabled'
              )}
            </Label>
          </div>
        </SettingsField>
      </SettingsSection>

      <SettingsSection title={t('preferences.general.keyboardShortcuts')}>
        <SettingsField
          label={t('preferences.general.quickPaneShortcut')}
          description={t('preferences.general.quickPaneShortcutDescription')}
        >
          <ShortcutPicker
            value={preferences?.quick_pane_shortcut ?? null}
            defaultValue={defaultShortcut ?? 'CommandOrControl+Shift+.'}
            onChange={handleShortcutChange}
            disabled={!preferences || savePreferences.isPending}
          />
        </SettingsField>
      </SettingsSection>
    </div>
  )
}
