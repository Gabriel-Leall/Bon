import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { commands, type AppPreferences } from '@/lib/tauri-bindings'
import { normalizeAppearancePreferences } from '@/lib/theme'

// Query keys for preferences
export const preferencesQueryKeys = {
  all: ['preferences'] as const,
  preferences: () => [...preferencesQueryKeys.all] as const,
}

export function normalizeAppPreferences(
  preferences: AppPreferences
): AppPreferences {
  const appearance = normalizeAppearancePreferences(preferences)

  return {
    ...preferences,
    ...appearance,
    daily_wrap_up_reminder_enabled:
      preferences.daily_wrap_up_reminder_enabled ?? false,
    daily_wrap_up_reminder_time:
      preferences.daily_wrap_up_reminder_time ?? '18:00',
  }
}

// TanStack Query hooks following the architectural patterns
export function usePreferences() {
  return useQuery({
    queryKey: preferencesQueryKeys.preferences(),
    queryFn: async (): Promise<AppPreferences> => {
      logger.debug('Loading preferences from backend')
      const result = await commands.loadPreferences()

      if (result.status === 'error') {
        // Return defaults if preferences file doesn't exist yet
        logger.warn('Failed to load preferences, using defaults', {
          error: result.error,
        })
        return {
          theme: 'system',
          accent: 'blue',
          quick_pane_shortcut: null,
          language: null,
          minimize_to_tray: false,
          start_of_week: 'sunday',
          daily_reset_time: '00:00',
          adaptive_dashboard_mode: 'full',
          notes_vault_path: null,
          daily_wrap_up_reminder_enabled: false,
          daily_wrap_up_reminder_time: '18:00',
        }
      }

      logger.info('Preferences loaded successfully', {
        preferences: result.data,
      })
      return normalizeAppPreferences(result.data)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useSavePreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (preferences: AppPreferences) => {
      const normalizedPreferences = normalizeAppPreferences(preferences)
      logger.debug('Saving preferences to backend', {
        preferences: normalizedPreferences,
      })
      const result = await commands.savePreferences(normalizedPreferences)

      if (result.status === 'error') {
        logger.error('Failed to save preferences', {
          error: result.error,
          preferences: normalizedPreferences,
        })
        toast.error('Failed to save preferences', { description: result.error })
        throw new Error(result.error)
      }

      logger.info('Preferences saved successfully')
      return normalizedPreferences
    },
    onSuccess: preferences => {
      // Update the cache with the new preferences
      queryClient.setQueryData(preferencesQueryKeys.preferences(), preferences)
      logger.info('Preferences cache updated')
      toast.success('Preferences saved')
    },
  })
}
