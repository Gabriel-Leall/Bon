import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('DailyAxisBanner surface contract', () => {
  it('uses the active theme surface without decorative gradients', () => {
    const source = readFileSync(
      resolve('src/components/daily-axis/DailyAxisBanner.tsx'),
      'utf8'
    )

    expect(source).not.toContain('bg-gradient')
    expect(source).not.toContain('border-amber')
    expect(source).toContain('bg-surface-elevated')
  })
})
