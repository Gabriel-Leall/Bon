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
})
