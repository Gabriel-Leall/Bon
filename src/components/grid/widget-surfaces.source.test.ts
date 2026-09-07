import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')

describe('dashboard widget surfaces', () => {
  it('uses solid semantic theme surfaces instead of fixed-color gradients', () => {
    const gridStyles = readSource('./grid.css')

    expect(gridStyles).toContain('--widget-bg: var(--surface);')
    expect(gridStyles).toContain('--widget-rail-bg: var(--surface-elevated);')
    expect(gridStyles).toContain(
      '--widget-shadow: var(--axis-shadow-neu-raised);'
    )
    expect(gridStyles).not.toContain('linear-gradient')
    expect(gridStyles).not.toContain('.dark')
  })

  it('keeps Brain Dump inside the shared widget surface', () => {
    const source = readSource('./widgets/BrainDumpWidget.tsx')

    expect(source).toContain('<WidgetCard')
    expect(source).not.toContain('notes-paper-widget')
  })

  it('uses the selected accent and neumorphic states for focus and habits', () => {
    const focusSource = readSource('./widgets/PomodoroWidget.tsx')
    const habitSource = readSource('./widgets/HabitWidget.tsx')

    expect(focusSource).toContain(
      'bg-primary text-primary-foreground shadow-neu-raised'
    )
    expect(focusSource).toContain(
      'bg-surface-sunken px-4 py-1.5 shadow-neu-pressed'
    )
    expect(focusSource).toContain(
      'bg-surface text-muted-foreground shadow-neu-raised-sm'
    )
    expect(focusSource).not.toContain(
      'bg-accent text-foreground shadow-lg transition-all'
    )
    expect(habitSource).not.toContain('border-foreground bg-foreground')
    expect(habitSource).toContain(
      "? 'border-primary bg-surface-elevated shadow-neu-raised-sm'"
    )
    expect(habitSource).toContain('active:shadow-neu-pressed')
  })

  it('gives dashboard controls raised, pressed, and inset depth states', () => {
    const notesSource = readSource('./widgets/BrainDumpWidget.tsx')
    const tasksSource = readSource('./widgets/TasksWidget.tsx')
    const githubSource = readSource('./widgets/GitHubWidget.tsx')
    const calendarSource = readSource('../ui/calendar-rac.tsx')

    expect(notesSource).toContain('bg-surface-sunken p-3')
    expect(notesSource).toContain('shadow-neu-pressed')
    expect(notesSource).toContain('shadow-neu-raised-sm')

    expect(tasksSource).toContain(
      'bg-surface-sunken px-2.5 py-2 shadow-neu-pressed'
    )
    expect(tasksSource).toContain('bg-surface px-3 py-2.5 shadow-neu-raised-sm')
    expect(tasksSource).toContain('active:shadow-neu-pressed')
    expect(tasksSource.indexOf("t('widgets.tasks.viewAll')")).toBeLessThan(
      tasksSource.indexOf('<QuickAddInput')
    )
    expect(tasksSource).not.toContain(
      'mt-2 flex items-center gap-0.5 self-end rounded-md border'
    )

    expect(githubSource).toContain(
      'bg-surface px-2.5 py-2 text-start shadow-neu-raised-sm'
    )
    expect(githubSource).toContain('active:shadow-neu-pressed')

    expect(calendarSource).toContain('shadow-neu-raised-sm')
    expect(calendarSource).toContain('data-[pressed]:shadow-neu-pressed')
    expect(calendarSource).toContain('data-[selected]:shadow-neu-raised')
    expect(calendarSource).not.toContain('data-[selected]:shadow-neu-pressed')
  })
})
