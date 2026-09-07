import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const componentFiles = [
  'badge.tsx',
  'button.tsx',
  'checkbox.tsx',
  'input-group.tsx',
  'input.tsx',
  'native-select.tsx',
  'radio-group.tsx',
  'segmented-control.tsx',
  'select.tsx',
  'switch.tsx',
  'textarea.tsx',
  'toggle-group.tsx',
  'toggle.tsx',
  'tooltip.tsx',
] as const

describe('shared control source contract', () => {
  it.each(componentFiles)('%s uses semantic theme utilities', fileName => {
    const source = readFileSync(new URL(fileName, import.meta.url), 'utf8')

    expect(source).not.toMatch(/#[\da-f]{3,8}\b/i)
    expect(source).not.toContain('oklch(')
    expect(source).not.toMatch(/\bdark:/)
    expect(source).not.toMatch(/\b(?:bg|text|border)-(?:white|black)\b/)
    expect(source).not.toMatch(/disabled:opacity-(?!100\b)\d+/)
    expect(source).not.toMatch(/data-\[disabled\]:opacity-(?!100\b)\d+/)
  })

  it('keeps settings navigation separated and elevates its active layer', () => {
    const preferencesSource = readFileSync(
      'src/components/preferences/PreferencesDialog.tsx',
      'utf8'
    )
    const sidebarSource = readFileSync('src/components/ui/sidebar.tsx', 'utf8')

    expect(preferencesSource).toContain('<SidebarMenu className="gap-2">')
    expect(preferencesSource).toContain('variant="outline"')
    expect(sidebarSource).toContain('data-[active=true]:shadow-neu-raised')
  })
})
