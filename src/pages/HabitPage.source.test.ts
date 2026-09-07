import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('HabitPage visual contract', () => {
  it('uses solid semantic surfaces and small habit identity markers', () => {
    const source = readFileSync(resolve('src/pages/HabitPage.tsx'), 'utf8')

    expect(source).not.toContain('radial-gradient')
    expect(source).not.toContain('backdrop-blur')
    expect(source).not.toContain('backgroundColor: coveredToday')
    expect(source).not.toContain('borderColor: `color-mix')
    expect(source).toContain('bg-surface shadow-neu-raised')
    expect(source).toContain('style={{ backgroundColor: habit.color }}')
  })

  it('keeps the focused habit concise and moves state explanations into help', () => {
    const source = readFileSync(resolve('src/pages/HabitPage.tsx'), 'utf8')
    const focusAside = source.slice(
      source.indexOf('function HabitFocusAside'),
      source.indexOf('function HabitOverviewPanel')
    )

    expect(source).toContain('<DialogTrigger asChild>')
    expect(source).toContain("t('habits.guide.open')")
    expect(source).toContain('HABIT_GUIDE_STATES.map')
    expect(focusAside).not.toContain('habits.quickSummary')
    expect(focusAside).not.toContain('habits.focusHabit.hint')
    expect(focusAside).not.toContain('heatMapStateLabels[state]')
    expect(focusAside).not.toContain('w-full justify-start')
    expect(focusAside).toContain('size="xs"')
  })
})
