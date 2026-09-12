import { describe, expect, it } from 'vitest'
import type { AppPreferences } from '@/lib/tauri-bindings'
import { normalizeAppPreferences } from './preferences'

const preferences = (overrides = {}): AppPreferences => ({
  theme: 'system',
  accent: 'blue',
  quick_pane_shortcut: null,
  language: null,
  minimize_to_tray: false,
  start_of_week: 'monday',
  daily_reset_time: '00:00',
  adaptive_dashboard_mode: 'full',
  notes_vault_path: null,
  daily_wrap_up_reminder_enabled: false,
  daily_wrap_up_reminder_time: '18:00',
  buddy_enabled: true,
  buddy_proactive_messages_enabled: true,
  buddy_reduced_motion: false,
  buddy_sound_enabled: false,
  buddy_intro_seen: false,
  buddy_last_seen_date: null,
  ...overrides,
})

describe('normalizeAppPreferences', () => {
  it('migrates legacy theme and missing accent without changing other fields', () => {
    const normalized = normalizeAppPreferences(
      preferences({
        theme: 'entardecer',
        accent: undefined,
        language: 'pt-BR',
      })
    )

    expect(normalized.theme).toBe('dark')
    expect(normalized.accent).toBe('blue')
    expect(normalized.language).toBe('pt-BR')
  })

  it('falls back from invalid appearance values', () => {
    const normalized = normalizeAppPreferences(
      preferences({ theme: 'sepia', accent: 'green' })
    )

    expect(normalized.theme).toBe('system')
    expect(normalized.accent).toBe('blue')
  })

  it('fills reminder defaults when loading legacy preferences', () => {
    const normalized = normalizeAppPreferences(
      preferences({
        daily_wrap_up_reminder_enabled: undefined,
        daily_wrap_up_reminder_time: undefined,
      })
    )

    expect(normalized.daily_wrap_up_reminder_enabled).toBe(false)
    expect(normalized.daily_wrap_up_reminder_time).toBe('18:00')
  })

  it('fills Bon defaults when loading legacy preferences', () => {
    const normalized = normalizeAppPreferences(
      preferences({
        buddy_enabled: undefined,
        buddy_proactive_messages_enabled: undefined,
        buddy_reduced_motion: undefined,
        buddy_sound_enabled: undefined,
        buddy_intro_seen: undefined,
        buddy_last_seen_date: undefined,
      })
    )

    expect(normalized.buddy_enabled).toBe(true)
    expect(normalized.buddy_proactive_messages_enabled).toBe(true)
    expect(normalized.buddy_reduced_motion).toBe(false)
    expect(normalized.buddy_sound_enabled).toBe(false)
    expect(normalized.buddy_intro_seen).toBe(false)
    expect(normalized.buddy_last_seen_date).toBeNull()
  })
})
