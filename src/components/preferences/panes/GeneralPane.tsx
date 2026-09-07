import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { locale } from '@tauri-apps/plugin-os'
import { Palette } from 'lucide-react'
import {
  disable as disableAutostart,
  enable as enableAutostart,
  isEnabled as isAutostartEnabled,
} from '@tauri-apps/plugin-autostart'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShortcutPicker } from '../ShortcutPicker'
import { SettingsField, SettingsSection } from '../shared/SettingsComponents'
import { usePreferences, useSavePreferences } from '@/services/preferences'
import { commands } from '@/lib/tauri-bindings'
import { availableLanguages } from '@/i18n'
import { logger } from '@/lib/logger'
import { useTheme } from '@/hooks/use-theme'
import type { Accent, Theme } from '@/lib/theme-context'
import { cn } from '@/lib/utils'

// Language display names (native names)
const languageNames: Record<string, string> = {
  en: 'English',
  'pt-BR': 'Português (Brasil)',
}

const accentOptions: {
  value: Accent
  swatchClassName: string
}[] = [
  { value: 'blue', swatchClassName: 'bg-[var(--axis-blue-500)]' },
  { value: 'purple', swatchClassName: 'bg-[var(--axis-purple-500)]' },
  { value: 'red', swatchClassName: 'bg-[var(--axis-red-500)]' },
]

const themeOptions: { value: Theme }[] = [
  { value: 'light' },
  { value: 'dark' },
  { value: 'cream' },
  { value: 'system' },
]

type PreviewTheme = Exclude<Theme, 'system'>

function ThemePreview({
  theme,
  className,
}: {
  theme: PreviewTheme
  className?: string
}) {
  return (
    <span
      className={cn(
        theme,
        'flex h-24 overflow-hidden rounded-[0.65rem] border border-border bg-background p-2 text-foreground',
        className
      )}
      aria-hidden="true"
    >
      <span className="flex w-[28%] flex-col gap-1.5 rounded-md bg-surface-elevated p-1.5 shadow-neu-raised-sm">
        <span className="size-2 rounded-full bg-primary" />
        <span className="h-1 w-full rounded-full bg-foreground-muted/55" />
        <span className="h-1 w-3/4 rounded-full bg-foreground-muted/35" />
        <span className="mt-auto size-2 rounded-full bg-foreground-muted/35" />
      </span>
      <span className="ml-2 flex min-w-0 flex-1 flex-col gap-2 rounded-md bg-surface p-2 shadow-neu-pressed">
        <span className="h-1.5 w-2/3 rounded-full bg-foreground-muted/55" />
        <span className="grid flex-1 grid-cols-2 gap-1.5">
          <span className="rounded-sm bg-surface-elevated shadow-neu-raised-sm" />
          <span className="rounded-sm bg-surface-elevated shadow-neu-raised-sm" />
        </span>
        <span className="h-1 w-1/2 rounded-full bg-foreground-muted/30" />
      </span>
    </span>
  )
}

function SystemThemePreview() {
  return (
    <span
      className="grid h-24 grid-cols-2 overflow-hidden rounded-[0.65rem] border border-border"
      aria-hidden="true"
    >
      <ThemePreview
        theme="light"
        className="h-full rounded-none border-0 p-1.5"
      />
      <ThemePreview
        theme="dark"
        className="h-full rounded-none border-0 p-1.5"
      />
    </span>
  )
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

  // Load preferences for keyboard shortcuts
  const { data: defaultShortcut } = useQuery({
    queryKey: ['default-quick-pane-shortcut'],
    queryFn: async () => {
      return await commands.getDefaultQuickPaneShortcut()
    },
    staleTime: Infinity,
  })

  useEffect(() => {
    const loadAutostartState = async () => {
      try {
        const enabled = await isAutostartEnabled()
        setAutostartState({ enabled, loading: false })
      } catch (error) {
        logger.warn('Failed to load autostart state', { error })
        setAutostartState(prev => ({ ...prev, loading: false }))
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
        const langCode = systemLocale?.split('-')[0]?.toLowerCase() ?? 'en'
        const targetLang = langCode === 'pt' ? 'pt-BR' : langCode
        const resolvedLang = availableLanguages.includes(targetLang)
          ? targetLang
          : 'en'
        await i18n.changeLanguage(resolvedLang)
      }
    } catch (error) {
      logger.error('Failed to change language', { error })
      toast.error(t('toast.error.generic'))
      return
    }

    if (preferences) {
      savePreferences.mutate({ ...preferences, language })
    }
  }

  const handleThemeChange = (value: Theme) => {
    // Update the theme provider immediately for instant UI feedback
    setTheme(value)

    // Persist the theme preference to disk, preserving other preferences
    if (preferences) {
      savePreferences.mutate({ ...preferences, theme: value })
    }
  }

  const handleAccentChange = (value: Accent) => {
    setAccent(value)

    if (preferences) {
      savePreferences.mutate({ ...preferences, accent: value })
    }
  }

  const handleAutostartChange = async (enabled: boolean) => {
    setAutostartState(prev => ({ ...prev, loading: true }))
    try {
      if (enabled) {
        await enableAutostart()
      } else {
        await disableAutostart()
      }
      setAutostartState({ enabled, loading: false })
      toast.success(
        enabled
          ? t('toast.success.autostartEnabled')
          : t('toast.success.autostartDisabled')
      )
    } catch (error) {
      logger.error('Failed to update autostart state', { error, enabled })
      toast.error(t('toast.error.autostartFailed'))
      setAutostartState(prev => ({ ...prev, loading: false }))
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSection title={t('preferences.appearance')}>
        <div className="rounded-2xl border border-border-strong bg-surface p-5 shadow-neu-raised">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t('preferences.appearance.theme')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('preferences.appearance.colorThemeDescription')}
            </p>

            <RadioGroup
              value={theme}
              onValueChange={handleThemeChange}
              disabled={savePreferences.isPending}
              aria-label={t('preferences.appearance.theme')}
              className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {themeOptions.map(option => {
                const label = t(`preferences.appearance.theme.${option.value}`)

                return (
                  <Label
                    key={option.value}
                    htmlFor={`theme-${option.value}`}
                    className="group/theme block min-w-0 cursor-pointer"
                  >
                    <RadioGroupItem
                      id={`theme-${option.value}`}
                      value={option.value}
                      aria-label={label}
                      className="peer sr-only"
                    />
                    <span
                      data-testid={`theme-preview-${option.value}`}
                      className="block rounded-xl border border-border-strong bg-surface-elevated p-1.5 shadow-neu-raised-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/60 peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-neu-pressed peer-focus-visible:border-primary peer-focus-visible:shadow-focus-ring motion-reduce:transform-none"
                    >
                      {option.value === 'system' ? (
                        <SystemThemePreview />
                      ) : (
                        <ThemePreview theme={option.value} />
                      )}
                    </span>
                    <span className="mt-2 block text-center text-xs font-medium text-muted-foreground transition-colors peer-data-[state=checked]:text-primary">
                      {label}
                    </span>
                  </Label>
                )
              })}
            </RadioGroup>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface shadow-neu-raised-sm">
                <Palette className="size-4 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t('preferences.appearance.accentColor')}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t('preferences.appearance.accentColorDescription')}
                </p>
              </div>
            </div>

            <RadioGroup
              value={accent}
              onValueChange={handleAccentChange}
              disabled={savePreferences.isPending}
              aria-label={t('preferences.appearance.accentColor')}
              className="flex shrink-0 gap-3"
            >
              {accentOptions.map(option => {
                const label = t(`preferences.appearance.accent.${option.value}`)

                return (
                  <RadioGroupItem
                    key={option.value}
                    value={option.value}
                    aria-label={label}
                    title={label}
                    className={cn(
                      option.swatchClassName,
                      'size-8 border-2 border-surface-elevated text-white shadow-neu-raised-sm data-[state=checked]:border-foreground data-[state=checked]:shadow-neu-pressed'
                    )}
                  />
                )
              })}
            </RadioGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SettingsField
            label={t('preferences.appearance.language')}
            description={t('preferences.appearance.languageDescription')}
          >
            <Select
              value={preferences?.language ?? 'system'}
              onValueChange={handleLanguageChange}
              disabled={savePreferences.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="system">
                    {t('preferences.appearance.language.system')}
                  </SelectItem>
                  {availableLanguages.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {languageNames[lang] ?? lang}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </SettingsField>

          <SettingsField
            label={t('preferences.appearance.dashboardAdaptation')}
            description={t(
              'preferences.appearance.dashboardAdaptationDescription'
            )}
          >
            <Select
              value={preferences?.adaptive_dashboard_mode ?? 'full'}
              onValueChange={value => {
                if (preferences) {
                  savePreferences.mutate({
                    ...preferences,
                    adaptive_dashboard_mode: value as
                      | 'full'
                      | 'reduced'
                      | 'off',
                  })
                }
              }}
              disabled={!preferences || savePreferences.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="full">
                    {t('preferences.appearance.dashboardAdaptation.full')}
                  </SelectItem>
                  <SelectItem value="reduced">
                    {t('preferences.appearance.dashboardAdaptation.reduced')}
                  </SelectItem>
                  <SelectItem value="off">
                    {t('preferences.appearance.dashboardAdaptation.off')}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </SettingsField>
        </div>
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
              onCheckedChange={handleAutostartChange}
              disabled={autostartState.loading}
            />
            <Label htmlFor="launch-at-startup" className="text-sm">
              {autostartState.enabled
                ? t('common.enabled')
                : t('common.disabled')}
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
              {(preferences?.minimize_to_tray ?? false)
                ? t('common.enabled')
                : t('common.disabled')}
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
