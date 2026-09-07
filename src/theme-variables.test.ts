import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf-8')

const themeVariables = readSource('src/theme-variables.css')
const appStyles = readSource('src/App.css')

describe('Axis theme variables', () => {
  it('contains every approved neutral and accent scale', () => {
    expect(themeVariables.match(/--axis-alabaster-\d+:/g)).toHaveLength(11)
    expect(themeVariables.match(/--axis-woodsmoke-\d+:/g)).toHaveLength(11)
    expect(themeVariables.match(/--axis-blue-\d+:/g)).toHaveLength(11)
    expect(themeVariables.match(/--axis-purple-\d+:/g)).toHaveLength(11)
    expect(themeVariables.match(/--axis-red-\d+:/g)).toHaveLength(11)

    expect(themeVariables).toContain(
      '--axis-alabaster-50: oklch(0.982 0.002 247.8);'
    )
    expect(themeVariables).toContain('--axis-woodsmoke-950: oklch(0.178 0 0);')
    expect(themeVariables).toContain(
      '--axis-blue-500: oklch(0.585 0.182 253.3);'
    )
    expect(themeVariables).toContain(
      '--axis-purple-500: oklch(0.639 0.134 300.3);'
    )
    expect(themeVariables).toContain('--axis-red-500: oklch(0.598 0.225 32.3);')
  })

  it('keeps surface theme and accent as independent axes', () => {
    expect(themeVariables).toContain(":root[data-axis-accent='blue']")
    expect(themeVariables).toContain(":root[data-axis-accent='purple']")
    expect(themeVariables).toContain(":root[data-axis-accent='red']")
    expect(themeVariables).toContain(':root,\n.light {')
    expect(themeVariables).toContain('.dark {')
    expect(themeVariables).not.toContain('.entardecer')
    expect(themeVariables).toContain('.cream {')

    expect(themeVariables).toContain('--primary: var(--axis-accent-600);')
    expect(themeVariables).toContain('--primary: var(--axis-accent-400);')
    expect(themeVariables).toContain('--ring: var(--axis-accent-500);')
    expect(themeVariables).toContain('--ring: var(--axis-accent-400);')
  })

  it('keeps semantic states independent from the selected accent', () => {
    for (const token of ['success', 'warning', 'destructive', 'info']) {
      expect(themeVariables).not.toMatch(
        new RegExp(`--${token}:\\s*var\\(--axis-accent-`)
      )
    }

    expect(themeVariables).toContain('--success: var(--axis-green-700);')
    expect(themeVariables).toContain('--warning: var(--axis-amber-700);')
    expect(themeVariables).toContain('--destructive: var(--axis-danger-500);')
    expect(themeVariables).toContain('--info: var(--axis-info-700);')
  })

  it('exposes the semantic foundation through one Tailwind bridge', () => {
    for (const mapping of [
      '--color-background: var(--background);',
      '--color-surface: var(--surface);',
      '--color-surface-elevated: var(--surface-elevated);',
      '--color-surface-sunken: var(--surface-sunken);',
      '--color-foreground: var(--foreground);',
      '--color-border: var(--border);',
      '--color-primary: var(--primary);',
      '--color-success: var(--success);',
      '--color-warning: var(--warning);',
      '--color-destructive: var(--destructive);',
      '--color-danger: var(--danger);',
      '--color-info: var(--info);',
      '--color-text: var(--text);',
      '--color-text-muted: var(--text-muted);',
    ]) {
      expect(themeVariables).toContain(mapping)
    }

    expect(themeVariables.match(/@theme inline/g)).toHaveLength(1)
    expect(appStyles).not.toContain('@theme inline')
  })

  it('defines theme-aware neumorphic depth without colored shadows', () => {
    expect(themeVariables.match(/--axis-shadow-neu-raised:/g)).toHaveLength(3)
    expect(themeVariables.match(/--axis-shadow-neu-raised-sm:/g)).toHaveLength(
      3
    )
    expect(themeVariables.match(/--axis-shadow-neu-pressed:/g)).toHaveLength(3)

    for (const mapping of [
      '--shadow-neu-raised: var(--axis-shadow-neu-raised);',
      '--shadow-neu-raised-sm: var(--axis-shadow-neu-raised-sm);',
      '--shadow-neu-pressed: var(--axis-shadow-neu-pressed);',
    ]) {
      expect(themeVariables).toContain(mapping)
    }

    expect(themeVariables).not.toMatch(
      /--axis-shadow-neu-[^:]+:[^;]*(?:axis-blue|axis-purple|axis-red|primary)/
    )
  })

  it('lights raised surfaces from the top and casts depth downward', () => {
    const raisedShadows = [
      ...themeVariables.matchAll(
        /--axis-shadow-neu-raised(?:-sm)?:([\s\S]*?);/g
      ),
    ].map(([, value]) => value)

    expect(raisedShadows).toHaveLength(6)
    for (const shadow of raisedShadows) {
      expect(shadow).toMatch(/0 -(?:1|2)px 0/)
      expect(shadow).not.toMatch(/-\d+px -\d+px/)
    }

    expect(themeVariables).toContain(
      '0 4px 8px oklch(0.176 0.005 248.1 / 0.14)'
    )
    expect(themeVariables).toContain('0 4px 8px oklch(0.05 0 0 / 0.64)')
    expect(themeVariables).toContain('0 4px 8px oklch(0.3 0.025 72 / 0.15)')
  })

  it('defines every custom property referenced by the token file', () => {
    const definitions = new Set(
      [...themeVariables.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map(
        ([, property]) => property
      )
    )
    const references = [...themeVariables.matchAll(/var\((--[\w-]+)/g)].map(
      ([, property]) => property
    )
    const undefinedReferences = [
      ...new Set(references.filter(property => !definitions.has(property))),
    ]

    expect(undefinedReferences).toEqual([])
    expect(themeVariables).not.toContain('var(----')
  })

  it('removes decorative gradients and old shared theme overrides', () => {
    expect(themeVariables).not.toContain('linear-gradient')
    expect(appStyles).not.toContain('--gradient-mistral')
    expect(appStyles).not.toContain('--shadow-warm')
    expect(appStyles).not.toContain('--hover-glass')
    expect(appStyles).not.toContain('--text-glow')
  })
})
